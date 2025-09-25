import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upsertNote, getNoteByLesson } from "../controllers/note.controller.js";

const router = Router();

router.get("/:lessonId", getNoteByLesson);
router.post("/", requireAuth, requireRole("prof", "admin"), upsertNote);

export default router;
