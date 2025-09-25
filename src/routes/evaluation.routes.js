const express = require("express");
const router = express.Router();

const {
  createEvaluation,
  getMyEvaluations,
  getEvaluationsByStudent,
  getStudentsWithAdmitere,
} = require("../controllers/evaluation.controller");

const {
  requireAuth,
  requireRole,
  requireValidSubscription,
} = require("../middleware/auth");

// 🔐 Elevul logat își vede propriile evaluări
router.get(
  "/",
  requireAuth,
  requireRole("student"),          // doar elevii își văd evaluările proprii
  requireValidSubscription,        // verifică dacă are abonament valid (bio1..adm2)
  getMyEvaluations
);

// 🔐 Admin/Prof creează evaluare
router.post(
  "/",
  requireAuth,
  requireRole("admin", "prof"),
  createEvaluation
);

// 🔐 Admin → toți elevii eligibili
// 🔐 Prof → doar elevii alocați lui
router.get(
  "/students-with-admitere",
  requireAuth,
  requireRole("admin", "prof"),
  getStudentsWithAdmitere
);

// 🔐 Admin/Prof vede evaluările unui anumit elev
router.get(
  "/:studentId",
  requireAuth,
  requireRole("admin", "prof"),
  getEvaluationsByStudent
);

module.exports = router;
