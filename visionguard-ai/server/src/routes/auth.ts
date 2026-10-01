import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../lib/supabase";
import { bootstrapOrgSchema } from "../schemas/auth";

const router = Router();

router.post("/bootstrap-org", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const parsed = bootstrapOrgSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.format() } });
    }

    const { orgName } = parsed.data;
    const userId = req.user.id;

    // We use admin client to insert safely since user might not have rights yet
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({ name: orgName, created_by: userId })
      .select()
      .single();

    if (orgError) throw orgError;

    const orgId = org.id;

    // Insert admin member
    const { error: memberError } = await supabaseAdmin
      .from("organization_members")
      .insert({ organization_id: orgId, user_id: userId, role: "admin" });

    if (memberError) throw memberError;

    // Insert default settings
    await supabaseAdmin.from("org_settings").insert({ organization_id: orgId });
    await supabaseAdmin.from("integrations").insert({ organization_id: orgId, dry_run: true });

    res.json({ success: true, data: { organization_id: orgId } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user.id;
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    const { data: memberships, error: memError } = await supabaseAdmin
      .from("organization_members")
      .select("organization_id, role, organizations(name)")
      .eq("user_id", userId);

    if (memError) throw memError;

    res.json({ success: true, data: { profile, memberships } });
  } catch (err) {
    next(err);
  }
});

export default router;
