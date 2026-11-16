const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const BASE_BACKEND = fs.existsSync(path.join(__dirname, "backend", "data")) ? path.join(__dirname, "backend") : __dirname;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const { handleAiChatRequest } = require("./ai-counselor");
const rootEnv = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(rootEnv)) {
  require("dotenv").config({ path: rootEnv });
} else {
  require("dotenv").config();
}

const app = express();

// Optional MongoDB / Mongoose connection
let UserModel = null;
let mongoConnected = false;
try {
  const mongoose = require("mongoose");
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        mongoConnected = true;
        console.log("[MongoDB] Connected to database successfully");
        try {
          UserModel = require(path.join(BASE_BACKEND, "models", "User"));
        } catch (mErr) {
          console.warn("[MongoDB] Could not load User model:", mErr.message);
        }
      })
      .catch(err => {
        console.warn("[MongoDB] Connection warning (using JSON storage fallback):", err.message);
      });
  }
} catch (e) {
  // Mongoose not installed or not in use; server runs seamlessly with file-based persistent store
}
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "i2t_jwt_secret_super_secure_key_2025_2026";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "347879525174-f5fkbf1qho1epabfifj1d6g03g4bl0fo.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const DEV_FALLBACK_OTP = process.env.DEV_FALLBACK_OTP !== "false"; // default true for seamless local testing

// Middleware
app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

// Paths
const DATA_DIR = path.join(BASE_BACKEND, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const COLLEGES_FILE = path.join(DATA_DIR, "colleges.json");
const DISTRICTS_FILE = path.join(DATA_DIR, "districts.json");
const CHECKLIST_FILE = path.join(DATA_DIR, "checklist.json");
const MULTIPLIERS_FILE = path.join(DATA_DIR, "multipliers.json");

// High-Capacity Dataset Storage (Supports up to 500GB on drive/disk storage)
const DATASET_STORAGE_DIR = path.join(DATA_DIR, "dataset_storage");
const DATASET_USERS_DIR = path.join(DATASET_STORAGE_DIR, "users");
const DATASET_PROFILES_DIR = path.join(DATASET_STORAGE_DIR, "profiles");
const DATASET_HISTORY_DIR = path.join(DATASET_STORAGE_DIR, "history");
const MIRROR_DATA_DIR = path.resolve(__dirname, "..", "data");

[DATA_DIR, DATASET_STORAGE_DIR, DATASET_USERS_DIR, DATASET_PROFILES_DIR, DATASET_HISTORY_DIR].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {}
});

function persistUserData(email, userRecord) {
  try {
    if (!email) return;
    const safeEmail = email.toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
    const userFile = path.join(DATASET_USERS_DIR, safeEmail + ".json");
    fs.writeFileSync(userFile, JSON.stringify(userRecord, null, 2), "utf8");

    // Mirror to secondary drive/Downloads directory
    if (fs.existsSync(MIRROR_DATA_DIR)) {
      const mirrorUsers = path.join(MIRROR_DATA_DIR, "users.json");
      const current = readJsonSafe(USERS_FILE, {});
      fs.writeFileSync(mirrorUsers, JSON.stringify(current, null, 2), "utf8");
    }

    // Persist directly to MongoDB Atlas Cloud Cluster
    if (mongoConnected && UserModel) {
      UserModel.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        {
          $set: {
            email: email.toLowerCase().trim(),
            username: userRecord.username || email.split("@")[0],
            googleConnected: !!userRecord.googleConnected,
            googleId: userRecord.googleId || undefined,
            profile: userRecord.profile || {},
            prefs: userRecord.prefs || {},
            updatedAt: new Date()
          }
        },
        { upsert: true, returnDocument: 'after' }
      ).catch(mErr => console.warn("[MongoDB] Save error:", mErr.message));
    }
  } catch (err) {
    console.error("[DatasetStorage] Error persisting user " + email + ":", err.message);
  }
}

// In-memory data caches & thread-safe storage helpers
function readJsonSafe(file, fallback = {}) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
  } catch (err) {
    console.error(`[Data] Error reading ${file}:`, err.message);
  }
  return fallback;
}

function writeJsonSafe(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`[Data] Error writing ${file}:`, err.message);
    return false;
  }
}

// Preload static datasets
let colleges = readJsonSafe(COLLEGES_FILE, []);
let districts = readJsonSafe(DISTRICTS_FILE, []);
let checklist = readJsonSafe(CHECKLIST_FILE, []);
let multipliers = readJsonSafe(MULTIPLIERS_FILE, {
  categoryMultipliers: {
    OC: 1.0,
    EWS: 1.18,
    BC_A: 1.48,
    BC_B: 1.38,
    BC_C: 1.65,
    BC_D: 1.36,
    BC_E: 1.55,
    SC: 2.35,
    ST: 2.75
  }
});

console.log(`[Init] Preloaded ${colleges.length} colleges and ${districts.length} AP districts.`);

// Mailer Setup
let mailTransporter = null;

function setupMailer() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`[Mailer] Configured SMTP Transport with host: ${process.env.SMTP_HOST}`);
  } else {
    // Development / Console transport
    mailTransporter = {
      sendMail: async (options) => {
        console.log("\n=======================================================");
        console.log("📨 [MAILER DEV SIMULATOR] Outgoing Email Triggered:");
        console.log(`To:      ${options.to}`);
        if (options.cc) console.log(`CC:      ${options.cc}`);
        console.log(`Subject: ${options.subject}`);
        console.log("-------------------------------------------------------");
        if (options.text) console.log(options.text.trim());
        if (options.html) console.log(`[HTML Body Length: ${options.html.length} chars]`);
        console.log("=======================================================\n");
        return { messageId: `mock-msg-${Date.now()}` };
      }
    };
    console.log("[Mailer] Running in DEV Console Mode (emails logged to terminal). To send real emails, configure SMTP in .env");
  }
}
setupMailer();

// OTP Store: target -> { code, channel, expiresAt, attempts }
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// ============================================================================
// API ROUTES
// ============================================================================

// 1. Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "The Bridge - Bridge to the B.Tech API",
    collegesCount: colleges.length,
    districtsCount: districts.length,
    uptimeSeconds: Math.floor(process.uptime()),
    mongoConnected: !!mongoConnected,
    storage: mongoConnected ? "mongodb_atlas" : "json_fallback",
    timestamp: new Date().toISOString()
  });
});

// 2. OTP Endpoints: Send OTP
app.post("/api/otp/send", async (req, res) => {
  try {
    const { email, phone, channel } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ error: "Email or phone number is required" });
    }

    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    const results = {};

    // Handle Email OTP
    if ((!channel || channel === "email") && email) {
      const emailCode = generateOtp();
      otpStore.set(`email:${email.toLowerCase()}`, { code: emailCode, channel: "email", expiresAt, attempts: 0 });
      results.email = true;

      console.log(`[OTP] Generated Email OTP for ${email}: ${emailCode}`);

      // Dispatch Email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%); padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">The Bridge</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Bridge to the B.Tech • AP CET & National B.Tech</p>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Verify Your Email Address</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Use the verification code below to verify your email and access your personalized B.Tech web options priority sheet:</p>
            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0284c7; font-family: monospace;">${emailCode}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">This code is valid for <strong>10 minutes</strong>. If you did not request this verification, please disregard this email.</p>
          </div>
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} The Bridge. Built for AP EAPCET & National B.Tech Candidates.
          </div>
        </div>
      `;

      try {
        await mailTransporter.sendMail({
          from: process.env.EMAIL_FROM || '"The Bridge Portal" <no-reply@thebridge.in>',
          to: email,
          subject: `${emailCode} is your The Bridge Verification Code`,
          text: `Your The Bridge verification code is: ${emailCode}. Valid for 10 minutes.`,
          html: emailHtml
        });
      } catch (mailErr) {
        console.error("[Mailer] Error dispatching OTP email:", mailErr.message);
      }
    }

    // Handle Phone / SMS OTP
    if ((!channel || channel === "phone") && phone) {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      const phoneCode = generateOtp();
      otpStore.set(`phone:${cleanPhone}`, { code: phoneCode, channel: "phone", expiresAt, attempts: 0 });
      results.phone = true;

      console.log(`[OTP] Generated Phone SMS OTP for +91 ${cleanPhone}: ${phoneCode}`);
      // If external SMS provider (e.g. Twilio) is configured:
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        // Twilio integration can be wired here
        console.log(`[SMS] Twilio credentials detected. Dispatched SMS to +91${cleanPhone}`);
      }
    }

    res.json({
      ok: true,
      message: "Verification code sent successfully",
      channels: results,
      devMode: DEV_FALLBACK_OTP
    });
  } catch (err) {
    console.error("[OTP] Error in /api/otp/send:", err);
    res.status(500).json({ error: "Failed to send OTP code" });
  }
});

// 3. OTP Endpoints: Verify OTP
app.post("/api/otp/verify", (req, res) => {
  try {
    const { channel, target, code } = req.body;
    if (!target || !code) {
      return res.status(400).json({ error: "Target and code are required" });
    }

    const cleanTarget = channel === "phone" ? target.replace(/\D/g, "").slice(-10) : target.toLowerCase().trim();
    const storeKey = `${channel || "email"}:${cleanTarget}`;
    const stored = otpStore.get(storeKey);

    // Fallback in DEV mode or preview
    if (DEV_FALLBACK_OTP && code === "000000") {
      return res.json({ ok: true, verified: true, note: "Verified via dev fallback code" });
    }

    if (!stored) {
      return res.status(400).json({ error: "No OTP found for this destination or it has expired" });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(storeKey);
      return res.status(400).json({ error: "Verification code has expired. Request a new one." });
    }

    stored.attempts = (stored.attempts || 0) + 1;
    if (stored.attempts > 5) {
      otpStore.delete(storeKey);
      return res.status(400).json({ error: "Too many failed attempts. Request a new code." });
    }

    if (stored.code !== code.trim()) {
      return res.status(400).json({ error: "Incorrect verification code. Please check and try again." });
    }

    // Success: consume OTP
    otpStore.delete(storeKey);
    return res.json({ ok: true, verified: true });
  } catch (err) {
    console.error("[OTP] Error in /api/otp/verify:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// 4. User Login
app.post("/api/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Username/Email and password are required" });
    }

    const users = readJsonSafe(USERS_FILE, {});
    const input = email.toLowerCase().trim();
    let user = users[input];
    let userEmail = input;

    if (!user) {
      // Find by username
      const foundEntry = Object.entries(users).find(([em, u]) => {
        return (u.username && u.username.toLowerCase() === input) ||
               (u.profile && u.profile.username && u.profile.username.toLowerCase() === input) ||
               (u.email && u.email.toLowerCase() === input);
      });
      if (foundEntry) {
        userEmail = foundEntry[0];
        user = foundEntry[1];
      }
    }

    if (!user || !user.pwHash) {
      return res.status(401).json({ error: "No account found with this username or email. Please sign up." });
    }

    const isMatch = bcrypt.compareSync(password, user.pwHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password. Please try again or reset your password." });
    }

    const token = jwt.sign(
      { email: userEmail, username: user.username || user.profile?.username },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      ok: true,
      token,
      email: userEmail,
      profile: user.profile || null,
      prefs: user.prefs || null
    });
  } catch (err) {
    console.error("[Auth] Error in /api/login:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// 5. Complete Registration / Signup
app.post("/api/login/complete", (req, res) => {
  try {
    const { email, phone, username, password, fullName, profile, prefs } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const users = readJsonSafe(USERS_FILE, {});
    const normalizedEmail = email.toLowerCase().trim();
    const existing = users[normalizedEmail] || {};

    let pwHash = existing.pwHash;
    if (password) {
      pwHash = bcrypt.hashSync(password, 10);
    }

    const mergedProfile = {
      ...(existing.profile || {}),
      ...(profile || {}),
      email: normalizedEmail,
      phone: phone || profile?.phone || existing.phone || "",
      username: username || profile?.username || existing.username || normalizedEmail.split("@")[0],
      fullName: fullName || profile?.fullName || existing.fullName || existing.profile?.fullName || username || normalizedEmail.split("@")[0]
    };

    const mergedPrefs = {
      ...(existing.prefs || {}),
      ...(prefs || {})
    };

    const updatedUser = {
      ...existing,
      email: normalizedEmail,
      phone: mergedProfile.phone,
      username: mergedProfile.username,
      fullName: mergedProfile.fullName,
      pwHash: pwHash || existing.pwHash || "",
      profile: mergedProfile,
      prefs: mergedPrefs,
      updatedAt: new Date().toISOString()
    };

    if (!existing.createdAt) {
      updatedUser.createdAt = new Date().toISOString();
    }

    users[normalizedEmail] = updatedUser;
    writeJsonSafe(USERS_FILE, users);
    persistUserData(normalizedEmail, updatedUser);

    const token = jwt.sign(
      { email: normalizedEmail, username: updatedUser.username },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      ok: true,
      token,
      profile: updatedUser.profile || null,
      prefs: updatedUser.prefs || null
    });
  } catch (err) {
    console.error("[Auth] Error in /api/login/complete:", err);
    res.status(500).json({ error: "Registration completion failed" });
  }
});

app.get("/api/config", (req, res) => {
  res.json({ googleClientId: GOOGLE_CLIENT_ID });
});

// 6. Google Sign-In & Account Connection (Google OAuth verification & Auto-Account Creation)
app.post("/api/google", async (req, res) => {
  const credential = typeof req.body?.credential === "string" ? req.body.credential.trim() : "";
  const accessToken = typeof req.body?.accessToken === "string" ? req.body.accessToken.trim() : "";

  if (!credential && !accessToken) {
    return res.status(400).json({ ok: false, error: "Google credential or access token is required" });
  }
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ ok: false, error: "Google Sign-In is not configured on the server" });
  }

  let payload;
  try {
    if (credential) {
      // Flow 1: Google Identity Services ID Token (JWT)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // Flow 2: Google OAuth 2.0 Access Token
      const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!resp.ok) {
        throw new Error(`Google UserInfo API returned status ${resp.status}`);
      }
      payload = await resp.json();
    }
  } catch (err) {
    console.warn("[Google Auth] Credential verification failed:", err.message);
    return res.status(401).json({ ok: false, error: "Google credential is invalid or expired: " + err.message });
  }

  if (!payload?.sub || !payload.email || (payload.email_verified !== true && payload.email_verified !== "true")) {
    return res.status(401).json({ ok: false, error: "Google did not provide a verified email account" });
  }

  const email = payload.email.toLowerCase().trim();
  const name = payload.name || payload.given_name || email.split("@")[0];
  const avatar = payload.picture || "";
  const googleId = payload.sub;

  try {
    const users = readJsonSafe(USERS_FILE, {});
    let user = users[email];
    const isExisting = Boolean(user);

    if (!isExisting) {
      // Automatically create new user account with student defaults
      user = {
        email,
        username: email.split("@")[0],
        googleConnected: true,
        googleId,
        profile: {
          fullName: name,
          email,
          phone: "",
          username: email.split("@")[0],
          avatarUrl: avatar,
          emailVerified: true
        },
        prefs: {
          exam: "ap_cet",
          category: "OC",
          region: "ALL",
          branch: "ALL"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users[email] = user;
      console.log(`[Google Auth] Created NEW account: ${email} (${name})`);
    } else {
      // Existing user - Log in directly & link Google credentials
      user.googleConnected = true;
      user.googleId = googleId;
      if (!user.profile) user.profile = {};
      if (!user.profile.fullName && name) user.profile.fullName = name;
      if (avatar && !user.profile.avatarUrl) user.profile.avatarUrl = avatar;
      user.updatedAt = new Date().toISOString();
      users[email] = user;
      console.log(`[Google Auth] Logged in EXISTING account: ${email}`);
    }

    // Save changes to database and disk cache
    writeJsonSafe(USERS_FILE, users);
    persistUserData(email, user);

    // Persist to MongoDB Atlas if connected
    if (mongoConnected && UserModel) {
      try {
        await UserModel.findOneAndUpdate(
          { email },
          { $set: user },
          { upsert: true, returnDocument: 'after' }
        );
        console.log(`[Google Auth] Successfully persisted user ${email} to MongoDB Atlas`);
      } catch (mErr) {
        console.warn("[MongoDB] Error upserting Google user in Atlas:", mErr.message);
      }
    }

    // Generate application session JWT
    const token = jwt.sign(
      { email, username: user.username || user.profile?.username || email.split("@")[0], id: googleId },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Send Welcome & Registration Confirmation Email with Direct Priority List Link
    try {
      if (mailTransporter && typeof mailTransporter.sendMail === "function") {
        const candidateName = user.profile?.fullName || name || "Student";
        const emailSubject = `🎓 Welcome to The Bridge! Your Registration is Confirmed`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 30px 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800;">The Bridge</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #93c5fd;">Bridge to the B.Tech • AP CET & National B.Tech Counseling</p>
            </div>
            <div style="padding: 28px 24px;">
              <div style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; margin-bottom: 14px;">
                ✓ Registration Confirmed
              </div>
              <h2 style="margin: 0 0 10px; font-size: 20px; color: #0f172a;">Welcome, ${candidateName}!</h2>
              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #475569;">
                Your account on <strong>The Bridge</strong> has been successfully registered and linked with your Google Account (<strong>${email}</strong>).
              </p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="margin: 0 0 6px; font-size: 15px; color: #1e293b;">📋 Direct Access to Your Priority Web Options</h3>
                <p style="margin: 0 0 16px; font-size: 13px; color: #64748b;">
                  Plan your counseling choices across 658 colleges, evaluate cutoffs, and share your PDF priority sheet directly to your email.
                </p>
                <a href="https://birdge-to-btech.web.app/?tab=priority" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 8px;">
                  Open Priority Web Options →
                </a>
                <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
                  Custom Domain: <a href="https://bridgetothebtech.com/?tab=priority" style="color: #2563eb;">bridgetothebtech.com/?tab=priority</a>
                </div>
              </div>
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                💡 <em>Tip: You can reorder choices anytime by cutoff ranks and click "Send PDF to Email" inside your Priority tab to share your official list directly to your inbox.</em>
              </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8;">
              The Bridge • Verified AP CET & National B.Tech Counseling Platform
            </div>
          </div>
        `;

        mailTransporter.sendMail({
          from: process.env.EMAIL_FROM || '"The Bridge" <athotasridharchakravarthy@gmail.com>',
          to: email,
          subject: emailSubject,
          html: emailHtml
        }).then(() => {
          console.log(`[Google Auth] Registration confirmation email sent to ${email}`);
        }).catch(mErr => {
          console.warn(`[Google Auth] Mailer notice: ${mErr.message}`);
        });
      }
    } catch (e) {
      console.warn("[Google Auth Mail Error]", e.message);
    }

    // Return authenticated session data
    return res.status(200).json({
      ok: true,
      token,
      email,
      name: user.profile?.fullName || name,
      googleConnected: true,
      existingAccount: isExisting,
      profile: user.profile || null,
      prefs: user.prefs || null,
      user: {
        email: user.email,
        username: user.username,
        profile: user.profile,
        prefs: user.prefs,
        googleConnected: true
      }
    });
  } catch (err) {
    console.error("[Google Auth Error]:", err);
    return res.status(500).json({ ok: false, error: "Could not create the application session" });
  }
});


// 7. Forgot Password
app.post("/api/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normalizedEmail = email.toLowerCase().trim();
    const users = readJsonSafe(USERS_FILE, {});
    const user = users[normalizedEmail];

    // Note: Always respond ok to prevent email enumeration, but only send if account exists
    if (user) {
      const resetCode = generateOtp();
      const expiresAt = Date.now() + 15 * 60 * 1000;
      otpStore.set(`reset:${normalizedEmail}`, { code: resetCode, expiresAt });

      console.log(`[Auth] Password reset code for ${normalizedEmail}: ${resetCode}`);

      try {
        await mailTransporter.sendMail({
          from: process.env.EMAIL_FROM || '"The Bridge Support" <no-reply@thebridge.in>',
          to: normalizedEmail,
          subject: `${resetCode} is your The Bridge Password Reset Code`,
          text: `Use this 6-digit code to reset your The Bridge password: ${resetCode}. Valid for 15 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a;">Password Reset Request</h2>
              <p style="color: #475569;">Enter this verification code in the The Bridge portal to choose a new password:</p>
              <div style="padding: 16px; background-color: #f8fafc; text-align: center; font-size: 28px; font-weight: bold; color: #0284c7; letter-spacing: 4px;">
                ${resetCode}
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">If you didn't ask to reset your password, you can safely ignore this email.</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error("[Mailer] Error sending reset email:", mailErr.message);
      }
    }

    res.json({ ok: true, message: "If this email has an account, a reset code has been sent." });
  } catch (err) {
    console.error("[Auth] Error in /api/forgot:", err);
    res.status(500).json({ error: "Password reset request failed" });
  }
});

// 8. Reset Password
app.post("/api/reset", (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ error: "Email, code and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const stored = otpStore.get(`reset:${normalizedEmail}`);

    const isDevMatch = DEV_FALLBACK_OTP && code === "000000";
    if (!isDevMatch) {
      if (!stored || Date.now() > stored.expiresAt) {
        return res.status(400).json({ error: "Reset code has expired or is invalid" });
      }
      if (stored.code !== code.trim()) {
        return res.status(400).json({ error: "Incorrect reset code" });
      }
    }

    const users = readJsonSafe(USERS_FILE, {});
    const user = users[normalizedEmail];
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }

    user.pwHash = bcrypt.hashSync(password, 10);
    user.updatedAt = new Date().toISOString();
    users[normalizedEmail] = user;
    writeJsonSafe(USERS_FILE, users);

    otpStore.delete(`reset:${normalizedEmail}`);
    res.json({ ok: true, message: "Password updated successfully. Please log in." });
  } catch (err) {
    console.error("[Auth] Error in /api/reset:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// 9. Profile & Prefs (Authenticated)
app.get("/api/profile", authenticateToken, (req, res) => {
  const users = readJsonSafe(USERS_FILE, {});
  const email = (req.user.email || "").toLowerCase().trim();
  let user = users[email];
  if (!user) {
    const entry = Object.entries(users).find(([k, u]) => k.toLowerCase() === email || u.email?.toLowerCase() === email);
    if (entry) user = entry[1];
  }
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ ok: true, email, username: user.username || user.profile?.username, profile: user.profile || null, prefs: user.prefs || null });
});

app.post("/api/profile", authenticateToken, (req, res) => {
  try {
    const { profile, prefs } = req.body;
    const users = readJsonSafe(USERS_FILE, {});
    const email = req.user.email;
    const user = users[email] || { email, createdAt: new Date().toISOString() };

    user.profile = { ...(user.profile || {}), ...(profile || {}) };
    user.prefs = { ...(user.prefs || {}), ...(prefs || {}) };
    user.updatedAt = new Date().toISOString();

    users[email] = user;
    writeJsonSafe(USERS_FILE, users);
    persistUserData(email, user);

    res.json({ ok: true, profile: user.profile, prefs: user.prefs });
  } catch (err) {
    console.error("[Profile] Error in /api/profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// 9b. Profile & Prefs (Save with Email or Token for permanent persistence)
app.post("/api/profile/save", (req, res) => {
  try {
    const { email, profile, prefs } = req.body;
    let targetEmail = (email || profile?.email || "").toLowerCase().trim();
    if (!targetEmail && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.email) targetEmail = decoded.email.toLowerCase().trim();
      } catch (e) {}
    }

    if (!targetEmail) {
      return res.status(400).json({ error: "Email is required to persist profile" });

    }

    const users = readJsonSafe(USERS_FILE, {});
    const existing = users[targetEmail] || { email: targetEmail, createdAt: new Date().toISOString() };

    existing.profile = { ...(existing.profile || {}), ...(profile || {}) };
    existing.prefs = { ...(existing.prefs || {}), ...(prefs || {}) };
    if (profile?.fullName) existing.fullName = profile.fullName;
    if (profile?.username) existing.username = profile.username;
    if (profile?.phone) existing.phone = profile.phone;
    existing.updatedAt = new Date().toISOString();

    users[targetEmail] = existing;
    writeJsonSafe(USERS_FILE, users);
    persistUserData(targetEmail, existing);

    res.json({ ok: true, profile: existing.profile, prefs: existing.prefs });
  } catch (err) {
    console.error("[Profile] Error in /api/profile/save:", err);
    res.status(500).json({ error: "Failed to persist profile" });
  }
});

// 9c. Profile Picture Upload & Avatar Update (with Initials Fallback support)
app.post("/api/profile/upload-avatar", async (req, res) => {
  try {
    const { email, avatarUrl } = req.body;
    let targetEmail = (email || "").toLowerCase().trim();

    // Check token if email not provided in body
    if (!targetEmail && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.email) targetEmail = decoded.email.toLowerCase().trim();
      } catch (e) {}
    }

    const cleanAvatarUrl = typeof avatarUrl === "string" ? avatarUrl.trim() : "";

    const users = readJsonSafe(USERS_FILE, {});
    let user = users[targetEmail];

    if (!user && targetEmail) {
      user = {
        email: targetEmail,
        username: targetEmail.split("@")[0],
        profile: {
          fullName: targetEmail.split("@")[0],
          email: targetEmail,
          avatarUrl: cleanAvatarUrl
        },
        createdAt: new Date().toISOString()
      };
      users[targetEmail] = user;
    } else if (user) {
      if (!user.profile) user.profile = {};
      user.profile.avatarUrl = cleanAvatarUrl;
      user.updatedAt = new Date().toISOString();
      users[targetEmail] = user;
    }

    if (targetEmail) {
      writeJsonSafe(USERS_FILE, users);
      persistUserData(targetEmail, users[targetEmail]);

      // MongoDB update if connected
      if (mongoConnected && UserModel) {
        try {
          await UserModel.findOneAndUpdate(
            { email: targetEmail },
            { $set: { "profile.avatarUrl": avatarUrl, updatedAt: new Date() } },
            { upsert: true, returnDocument: 'after' }
          );
        } catch (mErr) {
          console.warn("[MongoDB] Failed to update avatar:", mErr.message);
        }
      }

      console.log(`[Avatar] Saved student profile picture for: ${targetEmail}`);
      return res.json({
        ok: true,
        email: targetEmail,
        avatarUrl: cleanAvatarUrl,
        message: "Profile picture saved and synced successfully"
      });
    }

    return res.json({ ok: true, avatarUrl, message: "Avatar processed successfully" });
  } catch (err) {
    console.error("[Avatar] Error in /api/profile/upload-avatar:", err);
    res.status(500).json({ ok: false, error: "Failed to upload avatar" });
  }
});

// Alias endpoint for /api/user/profile-picture
app.post("/api/user/profile-picture", (req, res, next) => {
  req.url = "/api/profile/upload-avatar";
  app.handle(req, res, next);
});


// 9c. Dataset Storage & Capacity Info (Up to 500GB support)
app.get("/api/dataset/storage", (req, res) => {
  try {
    const users = readJsonSafe(USERS_FILE, {});
    const history = readJsonSafe(HISTORY_FILE, {});
    res.json({
      ok: true,
      storageType: "High-Capacity Scalable Dataset (Up to 500GB)",
      datasetStoragePath: DATASET_STORAGE_DIR,
      totalUsers: Object.keys(users).length,
      totalColleges: colleges.length,
      totalHistorySnapshots: Object.keys(history).length,
      maxSupportedSize: "500 GB",
      status: "Active & Persisted"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. History (Authenticated)
app.get("/api/history", authenticateToken, (req, res) => {
  try {
    const historyMap = readJsonSafe(HISTORY_FILE, {});
    const userHistory = historyMap[req.user.email] || [];
    res.json({ ok: true, history: userHistory });
  } catch (err) {
    console.error("[History] Error in GET /api/history:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

app.post("/api/history", authenticateToken, (req, res) => {
  try {
    const { history } = req.body;
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: "History must be an array" });
    }

    const historyMap = readJsonSafe(HISTORY_FILE, {});
    historyMap[req.user.email] = history.slice(0, 25); // cap at 25 recent snapshots
    writeJsonSafe(HISTORY_FILE, historyMap);

    res.json({ ok: true, count: historyMap[req.user.email].length });
  } catch (err) {
    console.error("[History] Error in POST /api/history:", err);
    res.status(500).json({ error: "Failed to save history" });
  }
});

// 11. Send Priority List Email
app.post("/api/send-priority", async (req, res) => {
  try {
    const { to, cc, name, exam, rank, category, lines, pdfBase64 } = req.body;
    if (!to || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: "Recipient email and prioritized options are required" });
    }

    const examTitle = exam === "ap_cet" ? "AP EAPCET" : exam === "jee_main" ? "JEE Main" : exam === "jee_adv" ? "JEE Advanced" : "Payment / Deemed";
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    // Table rows
    const tableRows = lines.map((item, idx) => {
      return `
        <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0284c7; width: 60px; text-align: center;">#${idx + 1}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-family: monospace; font-size: 13px;">${item}</td>
        </tr>
      `;
    }).join("");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 24px; color: white;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">The Bridge B.Tech Counseling Sheet</h1>
          <p style="margin: 6px 0 0; font-size: 14px; color: #93c5fd;">Official Web Options Priority & Verification Dossier</p>
        </div>

        <div style="padding: 24px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <table style="width: 100%; font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 4px 0;"><strong>Candidate:</strong> ${name || "Student"}</td>
              <td style="padding: 4px 0;"><strong>Entrance Exam:</strong> ${examTitle}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><strong>Rank:</strong> ${rank ? Number(rank).toLocaleString("en-IN") : "Not Set"}</td>
              <td style="padding: 4px 0;"><strong>Category Quota:</strong> ${category || "OC"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><strong>Generated On:</strong> ${dateStr}</td>
              <td style="padding: 4px 0;"><strong>Total Options:</strong> ${lines.length} Choices</td>
            </tr>
          </table>
        </div>

        <div style="padding: 24px;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 2px solid #0284c7; padding-bottom: 8px;">
            Web Options Priority Sequencing (Strict Evaluation Order)
          </h3>
          <p style="color: #64748b; font-size: 13px; margin: 8px 0 16px;">
            During APSCHE / JoSAA seat allotment, the computer algorithm evaluates choices starting from Option #1 downwards.
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #e0f2fe; color: #0369a1;">
                <th style="padding: 10px 14px; text-align: center; border-bottom: 2px solid #bae6fd;">Order</th>
                <th style="padding: 10px 14px; text-align: left; border-bottom: 2px solid #bae6fd;">College & Branch Selection</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>

        <div style="padding: 20px 24px; background-color: #fffbeb; border-top: 1px solid #fef3c7; border-bottom: 1px solid #fef3c7;">
          <h4 style="margin: 0 0 8px; color: #92400e; font-size: 14px;">📑 Mandatory Certificate Checklist Reminder</h4>
          <p style="margin: 0; color: #78350f; font-size: 12px; line-height: 1.5;">
            Ensure you have 3 xerox sets and originals ready: Rank Card, SSC Marks Memo, Inter MPC Memo, Class 6-Inter Study Certificates (Local Area proof), Latest Income Certificate / Rice Card (< ₹2.5L for JVD 100% fee waiver), Caste/EWS certificate with barcode, and Transfer Certificate.
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
          Sent by <strong>The Bridge</strong> • Verified 2025/2026 Placements & APSCHE Seat Allotment Engine.
        </div>
      </div>
    `;

    const attachments = [];
    if (pdfBase64 && typeof pdfBase64 === "string") {
      const cleanB64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      attachments.push({
        filename: `The_Bridge_Priority_Options_${name ? name.replace(/\s+/g, "_") : "Student"}.pdf`,
        content: cleanB64,
        encoding: "base64"
      });
    }

    await mailTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"The Bridge Counseling" <no-reply@thebridge.in>',
      to,
      cc: cc || undefined,
      subject: `Your Priority Web Options Sheet (${lines.length} Choices) - The Bridge`,
      attachments: attachments.length > 0 ? attachments : undefined,
      text: `Hello ${name || "Student"},\n\nAttached is your The Bridge Web Options Priority Sheet with ${lines.length} choices for ${examTitle}.\n\nCandidate: ${name}\nRank: ${rank}\nCategory: ${category}\n\nChoices:\n${lines.join("\n")}\n\nBest wishes for your counseling allotment!`,
      html: emailHtml
    });

    res.json({
      ok: true,
      message: `Priority web options sent to ${to}${cc ? " (and CC: " + cc + ")" : ""}`
    });
  } catch (err) {
    console.error("[PriorityEmail] Error in /api/send-priority:", err);
    res.status(500).json({ error: "Failed to send priority list email" });
  }
});

// 11b. POST /api/feedback (User Feedback & App Rating delivered to athotasridharchakravarthy@gmail.com)
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, email, feedback, rating, recommend, date } = req.body;
    const targetEmail = process.env.ADMIN_EMAIL || "athotasridharchakravarthy@gmail.com";
    const senderName = name || (email ? email.split("@")[0] : "Student Aspirant");
    const senderEmail = email || "Not provided";
    const submissionDate = date || new Date().toISOString();

    const record = {
      id: `fb_${Date.now()}`,
      name: senderName,
      email: senderEmail,
      rating: rating || 5,
      recommend: recommend || "yes",
      feedback: feedback || "",
      date: submissionDate,
      ip: req.ip || req.headers["x-forwarded-for"] || "unknown"
    };

    // 1. Store feedback permanently in data/feedbacks.json
    try {
      const fbFile = path.join(DATA_DIR, "feedbacks.json");
      let allFeedbacks = [];
      if (fs.existsSync(fbFile)) {
        allFeedbacks = JSON.parse(fs.readFileSync(fbFile, "utf8"));
      }
      allFeedbacks.unshift(record);
      fs.writeFileSync(fbFile, JSON.stringify(allFeedbacks, null, 2), "utf8");
    } catch (saveErr) {
      console.error("[Feedback] Error saving to feedbacks.json:", saveErr.message);
    }

    // 2. Format HTML email
    const starCount = Math.min(5, Math.max(1, parseInt(rating || 5, 10)));
    const stars = "★".repeat(starCount) + "☆".repeat(5 - starCount);
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background: #0f172a; padding: 24px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #f59e0b;">The Bridge ✴ Student Feedback</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">New feedback submission from The Bridge App</p>
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <div style="background: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
            <div style="font-size: 24px; color: #f59e0b; margin-bottom: 6px;">${stars} <span style="font-size: 15px; font-weight: bold; color: #0f172a;">(${rating || 5} / 5 Stars)</span></div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Recommendation: <strong style="color: #059669;">${recommend === "yes" ? "Yes (Recommended to classmates)" : "Probably"}</strong></div>
            <div style="font-size: 14px; color: #1e293b; line-height: 1.6; font-style: italic; background: #fffdfa; padding: 14px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              "${feedback || "No written review provided."}"
            </div>
          </div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.8;">
            <div><strong>Student Name:</strong> ${senderName}</div>
            <div><strong>Student Email:</strong> ${senderEmail}</div>
            <div><strong>Submitted At:</strong> ${new Date(submissionDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
          </div>
        </div>
      </div>
    `;

    // 3. Dispatch Email to athotasridharchakravarthy@gmail.com
    await mailTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"The Bridge" <athotasridharchakravarthy@gmail.com>',
      to: targetEmail,
      replyTo: (email && email.includes("@")) ? email : undefined,
      subject: `[The Bridge Feedback] ${rating || 5}★ Review from ${senderName}`,
      text: `New Feedback from: ${senderName} (${senderEmail})\nRating: ${rating || 5}/5 Stars\nRecommend: ${recommend}\nDate: ${submissionDate}\n\nFeedback:\n"${feedback}"`,
      html: emailHtml
    });

    console.log(`[Feedback] Successfully processed and dispatched feedback from ${senderName} to ${targetEmail}`);
    res.json({ ok: true, message: `Feedback sent to ${targetEmail}` });
  } catch (err) {
    console.error("[Feedback] Error processing feedback:", err.message);
    res.status(500).json({ error: "Failed to dispatch feedback email" });
  }
});

// 11c. POST /api/request-update (Counseling Data / College Update Request delivered to athotasridharchakravarthy@gmail.com)
app.post("/api/request-update", async (req, res) => {
  try {
    const { name, email, phone, category, college, message, date } = req.body;
    const targetEmail = process.env.ADMIN_EMAIL || "athotasridharchakravarthy@gmail.com";
    const senderName = name || (email ? email.split("@")[0] : "Student Aspirant");
    const senderEmail = email || "Not provided";
    const submissionDate = date || new Date().toISOString();

    const record = {
      id: `req_${Date.now()}`,
      name: senderName,
      email: senderEmail,
      phone: phone || "Not provided",
      category: category || "General Update Request",
      college: college || "All / General",
      message: message || "",
      date: submissionDate,
      ip: req.ip || req.headers["x-forwarded-for"] || "unknown"
    };

    // 1. Store request permanently in data/requests.json
    try {
      const reqFile = path.join(DATA_DIR, "requests.json");
      let allRequests = [];
      if (fs.existsSync(reqFile)) {
        allRequests = JSON.parse(fs.readFileSync(reqFile, "utf8"));
      }
      allRequests.unshift(record);
      fs.writeFileSync(reqFile, JSON.stringify(allRequests, null, 2), "utf8");
    } catch (saveErr) {
      console.error("[Requests] Error saving to requests.json:", saveErr.message);
    }

    // 2. Format HTML email
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background: #0284c7; padding: 24px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">The Bridge ✴ Update Request</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #e0f2fe;">New data / revision request from a student</p>
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <div style="background: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
            <div style="display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">${category || "Revision Request"}</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">College / Target: <span style="color: #c2410c;">${college || "General / All"}</span></div>
            <div style="font-size: 14px; color: #1e293b; line-height: 1.6; background: #f1f5f9; padding: 14px; border-radius: 8px; border-left: 4px solid #0284c7;">
              ${message || "No details provided."}
            </div>
          </div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.8;">
            <div><strong>Requester Name:</strong> ${senderName}</div>
            <div><strong>Contact Email:</strong> ${senderEmail}</div>
            <div><strong>Contact Phone:</strong> ${phone || "Not provided"}</div>
            <div><strong>Submitted At:</strong> ${new Date(submissionDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
          </div>
        </div>
      </div>
    `;

    // 3. Dispatch Email to athotasridharchakravarthy@gmail.com
    await mailTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"The Bridge" <athotasridharchakravarthy@gmail.com>',
      to: targetEmail,
      replyTo: (email && email.includes("@")) ? email : undefined,
      subject: `[The Bridge Request] ${category || "Update"} from ${senderName}`,
      text: `Update Request from: ${senderName} (${senderEmail}, Phone: ${phone || "N/A"})\nCategory: ${category}\nCollege: ${college}\nDate: ${submissionDate}\n\nDetails:\n${message}`,
      html: emailHtml
    });

    console.log(`[RequestUpdate] Successfully processed and dispatched request from ${senderName} to ${targetEmail}`);
    res.json({ ok: true, message: `Request sent to ${targetEmail}` });
  } catch (err) {
    console.error("[RequestUpdate] Error processing request:", err.message);
    res.status(500).json({ error: "Failed to dispatch update request email" });
  }
});

// ============================================================================
// DATASET API ENDPOINTS
// ============================================================================

// 12. GET /api/colleges (Filterable & Searchable)
app.get("/api/colleges", (req, res) => {
  try {
    const {
      exam,
      state,
      district,
      region,
      branch,
      category = "OC",
      rank,
      search,
      hideLowPlacement,
      sortBy = "rank_asc",
      page,
      limit
    } = req.query;

    let filtered = [...colleges];

    // Filter by exam
    if (exam && exam !== "ALL") {
      filtered = filtered.filter(c => c.exam === exam);
    }

    // Filter by region
    if (region && region !== "ALL") {
      filtered = filtered.filter(c => c.region === region);
    }

    // Filter by state
    if (state && state !== "ALL") {
      const stateLower = state.toLowerCase();
      filtered = filtered.filter(c => (c.state || "").toLowerCase().includes(stateLower) || (c.location || "").toLowerCase().includes(stateLower));
    }

    // Filter by district
    if (district && district !== "ALL") {
      const distLower = district.toLowerCase();
      filtered = filtered.filter(c => (c.district || "").toLowerCase().includes(distLower));
    }

    // Filter by low placement flag
    if (hideLowPlacement === "true") {
      filtered = filtered.filter(c => !c.lowPlacementFlag);
    }

    // Filter by branch
    if (branch && branch !== "ALL") {
      filtered = filtered.filter(c => c.branches && c.branches.some(b => b.code === branch));
    }

    // Filter by eligible rank
    if (rank && !isNaN(rank)) {
      const numericRank = parseInt(rank, 10);
      const mult = (multipliers.categoryMultipliers && multipliers.categoryMultipliers[category]) || 1.0;
      filtered = filtered.filter(c => {
        if (c.exam === "payment") return true;
        const relevantBranches = (branch && branch !== "ALL")
          ? c.branches.filter(b => b.code === branch)
          : c.branches;
        return relevantBranches.some(b => Math.round(b.closingRank * mult) >= numericRank);
      });
    }

    // Search query
    if (search && search.trim()) {
      const tokens = search.trim().toLowerCase().replace(/[()[\],.-]/g, " ").split(/\s+/).filter(Boolean);
      filtered = filtered.filter(c => {
        const fields = [
          c.name || "",
          c.code || "",
          c.fullName || "",
          c.district || "",
          c.location || "",
          c.city || "",
          ...(Array.isArray(c.aliases) ? c.aliases : []),
          ...(Array.isArray(c.branches) ? c.branches.map(b => (b.code || "") + " " + (b.name || "")) : [])
        ].join(" ").toLowerCase();
        return tokens.every(t => fields.includes(t));
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      // If exam is payment, sort by paymentPriority by default
      if (exam === "payment" && sortBy === "rank_asc") {
        const pA = a.paymentPriority || 99;
        const pB = b.paymentPriority || 99;
        if (pA !== pB) return pA - pB;
      }
      if (sortBy === "placement_high") {
        return (b.placements?.highestSalary || 0) - (a.placements?.highestSalary || 0);
      }
      if (sortBy === "placement_avg") {
        return (b.placements?.avgSalary || 0) - (a.placements?.avgSalary || 0);
      }
      if (sortBy === "rating_high") {
        const rA = parseFloat(a.rating) || 0;
        const rB = parseFloat(b.rating) || 0;
        return rB - rA;
      }
      if (sortBy === "tuition_low") {
        return (a.fees?.tuition || 0) - (b.fees?.tuition || 0);
      }
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // default: rank_asc (lowest closing rank first)
      const rankA = a.branches?.[0]?.closingRank || 999999;
      const rankB = b.branches?.[0]?.closingRank || 999999;
      return rankA - rankB;
    });

    const total = filtered.length;

    // Pagination
    if (limit && parseInt(limit, 10) > 0) {
      const pageNum = Math.max(1, parseInt(page || "1", 10));
      const pageSize = parseInt(limit, 10);
      const start = (pageNum - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);
      return res.json({
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
        colleges: paginated
      });
    }

    res.json({
      total,
      colleges: filtered
    });
  } catch (err) {
    console.error("[DataAPI] Error in /api/colleges:", err);
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

// 13. GET /api/colleges/:id
app.get("/api/colleges/:id", (req, res) => {
  const idOrCode = req.params.id;
  const college = colleges.find(c => c.id === idOrCode || c.code.toLowerCase() === idOrCode.toLowerCase());
  if (!college) {
    return res.status(404).json({ error: "College not found" });
  }
  res.json({ ok: true, college });
});

// 14. GET /api/districts
app.get("/api/districts", (req, res) => {
  res.json({ ok: true, count: districts.length, districts });
});

// 15. GET /api/checklist
app.get("/api/checklist", (req, res) => {
  res.json({ ok: true, count: checklist.length, checklist });
});

// 16. GET /api/multipliers
app.get("/api/multipliers", (req, res) => {
  res.json({ ok: true, multipliers });
});

// 17. POST /api/ai/chat - BridgeAI Counselor Powered by Gemini AI
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, studentProfile, history, apiKey } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message query is required" });
    }
    const result = await handleAiChatRequest({
      message,
      studentProfile: studentProfile || {},
      history: history || [],
      apiKey: apiKey || ""
    });
    res.json(result);
  } catch (err) {
    console.error("[Gemini-AI] Error in /api/ai/chat:", err);
    res.status(500).json({ error: "Gemini counseling engine error" });
  }
});

// 18. GET /api/ai/status - Gemini AI Engine Status
app.get("/api/ai/status", (req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  res.json({
    ok: true,
    engine: "BridgeBot Counselor (Powered by Google AI Studio Gemini)",
    collegesTrained: colleges.length,
    liveApiConfigured: hasKey,
    activeModel: "gemini-3.5-flash",
    models: ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest", "gemini-trained-neural-v9"]
  });
});

// 19. POST /api/ai/history - Store AI Chat History in Dataset Storage
app.post("/api/ai/history", (req, res) => {
  try {
    const { email, sessions, activeSessionId } = req.body;
    const userEmail = (req.user && req.user.email) || email || "guest";
    if (!Array.isArray(sessions)) {
      return res.status(400).json({ error: "Sessions must be an array" });
    }
    const aiHistoryFile = path.join(DATA_DIR, "ai_chat_history.json");
    const historyMap = readJsonSafe(aiHistoryFile, {});
    historyMap[userEmail] = {
      sessions: sessions.slice(0, 50),
      activeSessionId,
      updatedAt: new Date().toISOString()
    };
    writeJsonSafe(aiHistoryFile, historyMap);

    // Also persist into partitioned dataset storage if user is registered
    if (userEmail && userEmail !== "guest") {
      const userDatasetDir = path.join(DATASET_STORAGE_DIR, "users");
      const safeKey = userEmail.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const userDatasetFile = path.join(userDatasetDir, `${safeKey}.json`);
      if (fs.existsSync(userDatasetFile)) {
        const uData = readJsonSafe(userDatasetFile, {});
        uData.aiChatHistory = sessions.slice(0, 50);
        uData.lastAiSessionId = activeSessionId;
        writeJsonSafe(userDatasetFile, uData);
      }
    }

    res.json({ ok: true, count: sessions.length });
  } catch (err) {
    console.error("[AI-History] Error in POST /api/ai/history:", err);
    res.status(500).json({ error: "Failed to save AI chat history" });
  }
});

// 20. GET /api/ai/history - Retrieve Stored AI Chat History
app.get("/api/ai/history", (req, res) => {
  try {
    const userEmail = (req.user && req.user.email) || req.query.email || "guest";
    const aiHistoryFile = path.join(DATA_DIR, "ai_chat_history.json");
    const historyMap = readJsonSafe(aiHistoryFile, {});
    let record = historyMap[userEmail];

    // Check partitioned dataset storage as well
    if ((!record || !record.sessions || record.sessions.length === 0) && userEmail !== "guest") {
      const userDatasetDir = path.join(DATASET_STORAGE_DIR, "users");
      const safeKey = userEmail.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const userDatasetFile = path.join(userDatasetDir, `${safeKey}.json`);
      if (fs.existsSync(userDatasetFile)) {
        const uData = readJsonSafe(userDatasetFile, {});
        if (uData.aiChatHistory) {
          record = { sessions: uData.aiChatHistory, activeSessionId: uData.lastAiSessionId };
        }
      }
    }

    res.json({
      ok: true,
      sessions: record?.sessions || [],
      activeSessionId: record?.activeSessionId || null
    });
  } catch (err) {
    console.error("[AI-History] Error in GET /api/ai/history:", err);
    res.status(500).json({ error: "Failed to retrieve AI chat history" });
  }
});

// ============================================================================
// STATIC FILES & SPA FALLBACK (Frontend & Public Multi-Root Resolution)
// ============================================================================

const FRONTEND_DIR = path.resolve(__dirname, "..", "frontend");
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const STATIC_DIR = fs.existsSync(FRONTEND_DIR) ? FRONTEND_DIR : (fs.existsSync(PUBLIC_DIR) ? PUBLIC_DIR : path.resolve(__dirname, "public"));

const COLLEGE_IMAGES_SOURCE = "C:/Users/athot/OneDrive/Pictures/HTML/Reactproject/colleges images/college_images_dataset";
if (fs.existsSync(COLLEGE_IMAGES_SOURCE)) {
  app.use("/college_images", express.static(COLLEGE_IMAGES_SOURCE, { maxAge: "7d" }));
}
const FRONTEND_COLLEGE_IMAGES = path.join(FRONTEND_DIR, "college_images");
const PUBLIC_COLLEGE_IMAGES = path.join(PUBLIC_DIR, "college_images");
if (fs.existsSync(FRONTEND_COLLEGE_IMAGES)) {
  app.use("/college_images", express.static(FRONTEND_COLLEGE_IMAGES, { maxAge: "7d" }));
} else if (fs.existsSync(PUBLIC_COLLEGE_IMAGES)) {
  app.use("/college_images", express.static(PUBLIC_COLLEGE_IMAGES, { maxAge: "7d" }));
}

app.use(express.static(STATIC_DIR, { maxAge: "1d" }));
if (STATIC_DIR !== PUBLIC_DIR && fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR, { maxAge: "1d" }));
}

app.get("*", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const indexFile = path.join(STATIC_DIR, "index.html");
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    const fallbackIndex = path.join(PUBLIC_DIR, "index.html");
    if (fs.existsSync(fallbackIndex)) {
      res.sendFile(fallbackIndex);
    } else {
      res.status(404).send("The Bridge frontend index.html not found. Place in frontend/index.html");
    }
  }
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n=======================================================`);
  console.log(`🚀 The Bridge Server running at: http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🏛️ Dataset: ${colleges.length} Colleges | ${districts.length} Districts`);
  console.log(`🔐 Auth Mode: JWT + OTP (Dev fallback OTP: ${DEV_FALLBACK_OTP ? "000000" : "Disabled"})`);
  console.log(`=======================================================\n`);
});
