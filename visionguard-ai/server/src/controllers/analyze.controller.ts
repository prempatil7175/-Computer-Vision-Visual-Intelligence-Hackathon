import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../lib/supabase";
import { AnalyzeRequestSchema } from "../schemas/analyze";
import { analyzeImage } from "../services/gemini.service";

export const analyzeInspection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = AnalyzeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.format() } });
    }

    const { image_url, project_id, inspection_type } = parsed.data;
    const userId = req.user.id;

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("user_id", userId)
      .single();

    if (projectError || !project) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You don't have access to this project." } });
    }

    // Insert Inspection record as pending
    const { data: inspection, error: inspectionError } = await supabaseAdmin
      .from("inspections")
      .insert({
        project_id,
        inspector_id: userId,
        image_url,
        inspection_type,
        status: 'In Progress'
      })
      .select()
      .single();

    if (inspectionError) throw inspectionError;

    // Fetch image and convert to base64
    let imageBase64 = "";
    try {
        const imageResponse = await fetch(image_url);
        const arrayBuffer = await imageResponse.arrayBuffer();
        imageBase64 = Buffer.from(arrayBuffer).toString('base64');
    } catch (e) {
        await supabaseAdmin.from("inspections").update({ status: 'Failed' }).eq("id", inspection.id);
        return res.status(400).json({ success: false, error: { code: "FETCH_ERROR", message: "Failed to download image from URL" } });
    }

    // Call Gemini Service
    let aiResults;
    try {
        aiResults = await analyzeImage(imageBase64, inspection_type);
    } catch (e) {
        await supabaseAdmin.from("inspections").update({ status: 'Failed' }).eq("id", inspection.id);
        console.error("Gemini Error:", e);
        return res.status(500).json({ success: false, error: { code: "AI_ERROR", message: "AI analysis failed" } });
    }

    const anomaliesToInsert = (aiResults.anomalies || []).map((anomaly: any) => ({
        inspection_id: inspection.id,
        category: anomaly.category,
        severity: anomaly.severity,
        description: anomaly.description,
        recommended_action: anomaly.recommended_action,
        x_coordinate: anomaly.bounding_box?.x,
        y_coordinate: anomaly.bounding_box?.y,
        resolved: false
    }));

    if (anomaliesToInsert.length > 0) {
        const { error: anomalyInsertError } = await supabaseAdmin.from("anomalies").insert(anomaliesToInsert);
        if (anomalyInsertError) throw anomalyInsertError;
    }

    await supabaseAdmin.from("inspections").update({ status: 'Completed' }).eq("id", inspection.id);

    res.json({ success: true, data: { inspection_id: inspection.id, anomalies: anomaliesToInsert, score: aiResults.overall_site_safety_score } });
  } catch (err) {
    next(err);
  }
};
