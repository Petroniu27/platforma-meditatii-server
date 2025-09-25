const { z } = require("zod");
const Note = require("../models/Note");

const noteSchema = z.object({
  lesson: z.string(),
  content: z.string().min(10)
});

const upsertNote = async (req, res, next) => {
  try {
    const data = noteSchema.parse(req.body);
    const doc = await Note.findOneAndUpdate(
      { lesson: data.lesson },
      data,
      { upsert: true, new: true }
    );
    res.status(201).json(doc);
  } catch (e) { next(e); }
};

const getNoteByLesson = async (req, res, next) => {
  try {
    const doc = await Note.findOne({ lesson: req.params.lessonId });
    if (!doc) return res.status(404).json({ error: "Nu există notă pentru lecție" });
    res.json(doc);
  } catch (e) { next(e); }
};

module.exports = { upsertNote, getNoteByLesson };
