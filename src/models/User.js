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
    name: { type: String, required: true },        // prenume elev
    surname: { type: String, required: true },     // nume elev
    phone: { type: String, required: true },       // telefon elev
    parentName: { type: String, default: "" },     // nume părinte
    parentPhone: { type: String, default: "" },    // telefon părinte
    password: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ["student", "prof", "admin"],
      default: "student",
    },

    active: { type: Boolean, default: true },

    subscriptions: {
      type: [String], // ex: ["bio1", "chim2", "adm1"]
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

// 🔐 hash parola la salvare
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ metodă pentru comparare parolă
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 👇 exportăm modelul
module.exports = mongoose.model("User", UserSchema);
