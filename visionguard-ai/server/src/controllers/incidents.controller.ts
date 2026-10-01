import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../lib/supabase";

export const triggerIncident = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { anomaly_id } = req.body;
    
    if (!anomaly_id) {
        return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Missing anomaly_id" } });
    }

    const { data: anomaly, error: anomalyError } = await supabaseAdmin
        .from("anomalies")
        .select(`
            *,
            inspections (
                project_id,
                projects (
                    name,
                    user_id
                )
            )
        `)
        .eq("id", anomaly_id)
        .single();

    if (anomalyError || !anomaly) {
        return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Anomaly not found" } });
    }

    // Verify ownership
    if (anomaly.inspections.projects.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You don't have access to this anomaly." } });
    }

    // Simulate Webhook dispatch
    console.log(`[WEBHOOK SIMULATOR] Dispatching alert for Anomaly ${anomaly_id}`);
    console.log(`[WEBHOOK SIMULATOR] Details: ${anomaly.severity} - ${anomaly.category}`);
    console.log(`[WEBHOOK SIMULATOR] Sent SMS/WhatsApp to Maintenance Team for Project: ${anomaly.inspections.projects.name}`);

    // Update anomaly as dispatched or resolved
    await supabaseAdmin.from("anomalies").update({ resolved: true }).eq("id", anomaly_id);

    res.json({ success: true, message: "Incident dispatched successfully", data: { anomaly_id } });
  } catch (err) {
    next(err);
  }
};
