import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

export const uploadImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: "NO_FILE", message: "No image file provided" } });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${req.user.id}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from("inspections")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
      return res.status(500).json({ success: false, error: { code: "UPLOAD_FAILED", message: "Failed to upload image" } });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("inspections")
      .getPublicUrl(filePath);

    res.json({ success: true, data: { url: publicUrlData.publicUrl } });
  } catch (err) {
    next(err);
  }
};
