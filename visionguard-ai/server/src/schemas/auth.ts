import { z } from "zod";

export const bootstrapOrgSchema = z.object({
  orgName: z.string().min(2).max(120),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "engineer", "safety_manager", "inspector", "viewer"]),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
});
