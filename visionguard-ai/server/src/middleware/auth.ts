import { Request, Response, NextFunction } from "express";
import { createAuthClient } from "../lib/supabase";

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid token" } });
  }

  const token = authHeader.split(" ")[1] as string;
  const supabase = createAuthClient(token);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid session" } });
  }

  req.user = user;
  req.token = token;
  next();
}
