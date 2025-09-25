require("dotenv").config();
const mongoose = require("mongoose");
const Video = require("../src/models/Video");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Video.deleteMany({});

  await Video.create([
    {
      slug: "bio-b1-celula-01",
      title: "Celula – Introducere",
      moduleId: "bac-b1",
      captions: [{ lang: "ro", label: "Română" }],
      mock: { enabled: true, mp4Url: "https://files.example.com/mock/celula01.mp4" }
    },
    {
      slug: "bio-b1-celula-02",
      title: "Celula – Structura",
      moduleId: "bac-b1",
      captions: [{ lang: "ro", label: "Română" }],
      mock: { enabled: true, mp4Url: "https://files.example.com/mock/celula02.mp4" }
    }
  ]);

  console.log("Seed done");
  process.exit(0);
})();
