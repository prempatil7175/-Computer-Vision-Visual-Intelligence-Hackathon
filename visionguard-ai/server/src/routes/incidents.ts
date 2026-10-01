import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { triggerIncident } from "../controllers/incidents.controller";

const router = Router();

router.use(requireAuth);
router.post("/trigger", triggerIncident as any);

export default router;
