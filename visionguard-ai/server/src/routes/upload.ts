import { Router } from "express";
import multer from "multer";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Configure multer for memory storage and max file size of 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(requireAuth);

router.post("/", upload.single("image"), async (req: AuthRequest, res, next) => {
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
});

export default router;
