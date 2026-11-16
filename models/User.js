const mongoose = require("mongoose");

// Student / User Schema for MongoDB (The Bridge to B.Tech)
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      default: function () {
        return this.email ? this.email.split("@")[0] : "student";
      },
    },
    password: {
      type: String,
    },
    googleConnected: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
    },
    profile: {
      fullName: {
        type: String,
        default: "Student Bridge",
      },
      email: {
        type: String,
      },
      avatarUrl: {
        type: String, // Base64 data URL or image URL for student profile picture
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      gender: {
        type: String,
        default: "",
      },
      dob: {
        type: String,
        default: "",
      },
      whatsapp: {
        type: String,
        default: "",
      },
      experience: {
        type: String,
        default: "Fresher",
      },
      emailVerified: {
        type: Boolean,
        default: true,
      },
    },
    prefs: {
      exam: { type: String, default: "ap_cet" },
      category: { type: String, default: "OC" },
      region: { type: String, default: "ALL" },
      branch: { type: String, default: "ALL" },
    },
  },
  {
    timestamps: true,
  }
);

// Method to get 2-letter fallback initials
userSchema.methods.getInitials = function () {
  const name = this.profile?.fullName || this.username || "Student Bridge";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const User = mongoose.models?.User || mongoose.model("User", userSchema);

module.exports = User;
