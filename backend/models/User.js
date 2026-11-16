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
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        fullName: "Student Bridge",
        experience: "Fresher",
        emailVerified: true
      }),
    },
    prefs: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        exam: "ap_cet",
        category: "OC",
        region: "ALL",
        branch: "ALL"
      }),
    },
  },
  {
    timestamps: true,
    strict: false,
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
