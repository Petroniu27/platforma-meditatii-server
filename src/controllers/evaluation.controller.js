const Evaluation = require("../models/Evaluation");
const User = require("../models/User");

/**
 * POST /evaluations
 * Admin/Prof poate crea o evaluare pentru un elev
 */
exports.createEvaluation = async (req, res) => {
  try {
    const { studentId, subject, chapterCode, score, date } = req.body;

    // 1. Verifică elevul
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res
        .status(404)
        .json({ error: "Elevul nu există sau nu este valid." });
    }

    // 2. Dacă e profesor → verifică dacă elevul e asignat
    if (req.user.role === "prof") {
      if (
        !student.assignedProfId ||
        student.assignedProfId.toString() !== req.user.id
      ) {
        return res
          .status(403)
          .json({ error: "Elevul nu este asignat acestui profesor." });
      }
    }

    // 3. Creează evaluarea
    const newEval = await Evaluation.create({
      studentId,
      profId: req.user.id,
      subject,
      chapterCode,
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
 * Admin/Prof poate vedea evaluările unui elev
 */
exports.getEvaluationsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const evaluations = await Evaluation.find({ studentId }).sort({ date: 1 });
    res.json({ evaluations });
  } catch (err) {
    console.error("❌ Eroare la getEvaluationsByStudent:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /evaluations/students-with-admitere
 * Admin → toți elevii eligibili
 * Prof → doar elevii lui
 */
exports.getStudentsWithAdmitere = async (req, res) => {
  try {
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
