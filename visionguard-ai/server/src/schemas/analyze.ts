import { z } from 'zod';

export const AnalyzeRequestSchema = z.object({
  image_url: z.string().url(),
  project_id: z.string().uuid(),
  inspection_type: z.enum(["Safety", "Structural", "Hybrid"]),
});

export const AnomalyInsertionSchema = z.object({
  inspection_id: z.string().uuid(),
  category: z.string(),
  severity: z.enum(["Low", "Moderate", "Critical"]),
  description: z.string(),
  recommended_action: z.string(),
});
