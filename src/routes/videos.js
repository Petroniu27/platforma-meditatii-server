// server/src/routes/videos.js
const express = require("express");
const Video = require("../models/Video");
const WatchProgress = require("../models/WatchProgress");

const router = express.Router();

// ===== Auth (fallback dacă nu e disponibil) =====
let requireAuth = (_req, _res, next) => next();
let requireRole = () => (_req, _res, next) => next();
try {
  const auth = require("../middleware/auth");
  if (auth?.requireAuth) requireAuth = auth.requireAuth;
  if (auth?.requireRole) requireRole = auth.requireRole;
} catch {
  // fără JWT încă → mergem fără restricții în dev
}

// ------------------------------------------------------------------
// LISTARE generală (filtrabilă)
// GET /api/videos?moduleId=bac-b1
// ------------------------------------------------------------------
router.get("/", async (req, res) => {
  const { moduleId } = req.query;
  const filter = { isActive: true, ...(moduleId ? { moduleId } : {}) };
  const list = await Video.find(filter).sort({ createdAt: 1 }).lean();
  res.json(list);
});

// ------------------------------------------------------------------
// LISTARE după „lecție”/modul
// GET /api/videos/lesson/:lessonId
// ------------------------------------------------------------------
router.get("/lesson/:lessonId", async (req, res) => {
  const list = await Video.find({ moduleId: req.params.lessonId, isActive: true })
    .sort({ createdAt: 1 })
    .lean();
  res.json(list);
});

// ------------------------------------------------------------------
// DETALIU video după slug
// GET /api/videos/:slug
// (Ține /lesson deasupra ca să nu intre pe :slug)
// ------------------------------------------------------------------
router.get("/:slug", async (req, res) => {
  const v = await Video.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!v) return res.status(404).json({ error: "Not found" });
  res.json(v);
});

// ------------------------------------------------------------------
// CREATE video (doar prof/admin când ai auth activat)
// POST /api/videos
// Body minim: { slug, title, moduleId, vimeoId?, mock? }
// ------------------------------------------------------------------
router.post(
  "/",
  requireAuth,
  requireRole("prof", "admin"),
  async (req, res) => {
    const { slug, title, moduleId } = req.body || {};
    if (!slug || !title || !moduleId) {
      return res.status(400).json({ error: "slug, title și moduleId sunt obligatorii" });
    }
    const exists = await Video.findOne({ slug });
    if (exists) return res.status(409).json({ error: "Slug deja folosit" });

    const created = await Video.create(req.body);
    res.status(201).json(created);
  }
);

// ------------------------------------------------------------------
// PROGRES vizionare (salvare periodică)
// PATCH /api/videos/:slug/progress
// Dacă ai auth: folosește req.user._id; altfel: userId din body / dummy
// ------------------------------------------------------------------
router.patch("/:slug/progress", requireAuth, async (req, res) => {
  const userId = (req.user && req.user._id) || req.body.userId || "000000000000000000000001";
  const { lastPositionSec, completed } = req.body || {};

  const doc = await WatchProgress.findOneAndUpdate(
    { userId, videoSlug: req.params.slug },
    {
      $set: {
        lastPositionSec: Number.isFinite(lastPositionSec) ? Math.floor(lastPositionSec) : 0,
        completed: !!completed
      }
    },
    { new: true, upsert: true }
  ).lean();

  res.json(doc);
});

// ------------------------------------------------------------------
// GET progres vizionare
// GET /api/videos/:slug/progress
// ------------------------------------------------------------------
router.get("/:slug/progress", requireAuth, async (req, res) => {
  const userId = (req.user && req.user._id) || req.query.userId || "000000000000000000000001";
  const doc = await WatchProgress.findOne({ userId, videoSlug: req.params.slug }).lean();
  res.json(doc || { lastPositionSec: 0, completed: false });
});

module.exports = router;
