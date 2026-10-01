import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import { uploadImage } from "../controllers/upload.controller";

const router = Router();

// Configure multer for memory storage and max file size of 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(requireAuth);
router.post("/", upload.single("image"), uploadImage as any);

export default router;
