const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true },    // prenume
    surname: { type: String, required: true }, // nume de familie
    phone: { type: String, required: true },
    password: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ["student", "prof", "admin"],
      default: "student",
    },

    active: { type: Boolean, default: true },

    // 🔹 coduri interne de abonamente, ex: ["bio1", "chim2", "adm1"]
    subscriptions: {
      type: [String],
      default: [],
    },

    assignedProfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// 🔐 Hash parola la salvare
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Comparare parolă
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
