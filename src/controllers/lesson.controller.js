const { z } = require("zod");
const Lesson = require("../models/Lesson");

// 🔹 Schema de validare pentru lecții
const lessonSchema = z.object({
  title: z.string().min(3, "Titlul trebuie să aibă minim 3 caractere"),
  slug: z.string().min(3, "Slug-ul trebuie să aibă minim 3 caractere"),
  chapter: z.string().min(2, "Capitolul trebuie să aibă minim 2 caractere"),
  subchapter: z.string().optional(),
  summary: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// 🔹 Creează o lecție nouă (admin/prof)
const createLesson = async (req, res, next) => {
  try {
    const data = lessonSchema.parse(req.body);

    // verificăm dacă slug-ul există deja
    const exists = await Lesson.findOne({ slug: data.slug });
    if (exists) {
      return res.status(409).json({ error: "Slug deja există" });
    }

    const doc = await Lesson.create(data);
    res.status(201).json(doc);
  } catch (err) {
    console.error("❌ Eroare la createLesson:", err.message);
    next(err);
  }
};

// 🔹 Listează toate lecțiile (elev cu abonament valid)
const listLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find().sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    console.error("❌ Eroare la listLessons:", err.message);
    next(err);
  }
};

module.exports = {
  createLesson,
  listLessons,
};
