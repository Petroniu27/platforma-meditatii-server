import { Router } from "express";
import { requireAuth, requireRole, requireValidSubscription } from "../middleware/auth.js";
import { createLesson, listLessons } from "../controllers/lesson.controller.js";

const router = Router();

// 🔐 Elevul logat cu abonament valid poate lista lecțiile
router.get("/", requireAuth, requireRole("student"), requireValidSubscription, listLessons);

// 🔐 Prof/Admin pot crea lecții
router.post("/", requireAuth, requireRole("prof", "admin"), createLesson);

export default router;
