import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { supabaseAdmin } from "../lib/supabase";
import { inviteSchema, acceptInviteSchema } from "../schemas/auth";

const router = Router();

router.use(requireAuth);

router.post("/invitations", requireRole(["admin"]), async (req: AuthRequest, res, next) => {
  try {
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input" } });
    }
    const orgId = req.headers["x-organization-id"] as string;

    const { data, error } = await supabaseAdmin
      .from("invitations")
      .insert({
        organization_id: orgId,
        email: parsed.data.email,
        role: parsed.data.role,
        invited_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    // In a real app, send an email here.
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/invitations/accept", async (req: AuthRequest, res, next) => {
  try {
    const parsed = acceptInviteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input" } });

    const { data: inv, error: invError } = await supabaseAdmin
      .from("invitations")
      .select("*")
      .eq("token", parsed.data.token)
      .is("accepted_at", null)
      .single();

    if (invError || !inv) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Invalid or expired invitation" } });
    }

    if (new Date(inv.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Invitation expired" } });
    }

    await supabaseAdmin
      .from("organization_members")
      .insert({ organization_id: inv.organization_id, user_id: req.user.id, role: inv.role });

    await supabaseAdmin
      .from("invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", inv.id);

    res.json({ success: true, data: { organization_id: inv.organization_id } });
  } catch (err) {
    next(err);
  }
});

router.get("/members", requireRole(["admin"]), async (req: AuthRequest, res, next) => {
  try {
    const orgId = req.headers["x-organization-id"] as string;
    const { data, error } = await supabaseAdmin
      .from("organization_members")
      .select("user_id, role, created_at, profiles(full_name, email)")
      .eq("organization_id", orgId);
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
