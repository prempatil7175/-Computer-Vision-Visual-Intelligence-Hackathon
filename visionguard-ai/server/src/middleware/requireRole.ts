import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { supabaseAdmin } from "../lib/supabase";

export function requireRole(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    const orgId = req.headers["x-organization-id"] as string;
    if (!orgId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Missing x-organization-id header" } });
    }

    // Check role from DB
    const { data: member, error } = await supabaseAdmin
      .from("organization_members")
      .select("role")
      .eq("organization_id", orgId)
      .eq("user_id", req.user.id)
      .single();

    if (error || !member) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Not a member of this organization" } });
    }

    if (!allowedRoles.includes(member.role)) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } });
    }

    next();
  };
}
