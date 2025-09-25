// server/src/controllers/evaluation.controller.js
const Evaluation = require("../models/Evaluation");
const User = require("../models/User");

/**
 * POST /evaluations
 * Admin/Prof poate crea o evaluare pentru un elev
 */
exports.createEvaluation = async (req, res) => {
  try {
    const { studentId, chapter, score, date } = req.body;

    const newEval = await Evaluation.create({
      studentId,
      chapter,
      score,
      date,
    });

    res.status(201).json({ evaluation: newEval });
  } catch (err) {
    console.error("❌ Eroare la createEvaluation:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /evaluations
 * Elevul logat își vede propriile evaluări
 */
exports.getMyEvaluations = async (req, res) => {
  try {
    console.log("👤 getMyEvaluations pentru user:", req.user);

    const studentId = req.user.id;
    const evaluations = await Evaluation.find({ studentId }).sort({ date: 1 });

    res.json({ evaluations });
  } catch (err) {
    console.error("❌ Eroare la getMyEvaluations:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /evaluations/:studentId
 * Admin/Prof poate vedea evaluările unui anumit elev
 */
exports.getEvaluationsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`👤 getEvaluationsByStudent pentru elevul ${studentId}`);

    const evaluations = await Evaluation.find({ studentId }).sort({ date: 1 });

    res.json({ evaluations });
  } catch (err) {
    console.error("❌ Eroare la getEvaluationsByStudent:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /evaluations/students-with-admitere
 * Adminul → toți elevii eligibili
 * Profesorul → doar elevii alocați lui
 */
exports.getStudentsWithAdmitere = async (req, res) => {
  try {
    console.log("=== getStudentsWithAdmitere ===");
    console.log("User logat:", req.user);

    const filter = {
      role: "student",
      subscriptions: {
        $elemMatch: { $in: ["bio1", "bio2", "chim1", "chim2", "adm1", "adm2"] },
      },
    };

    if (req.user?.role === "prof") {
      filter.assignedProfId = req.user.id;
    }

    const students = await User.find(filter).select(
      "_id name surname email subscriptions"
    );

    res.json({ students });
  } catch (err) {
    console.error("❌ Eroare la getStudentsWithAdmitere:", err);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      location: "getStudentsWithAdmitere",
    });
  }
};
