import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { analyzeInspection } from "../controllers/analyze.controller";

const router = Router();

router.use(requireAuth);
router.post("/", analyzeInspection as any);

export default router;
