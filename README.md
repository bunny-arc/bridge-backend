# Inter2Tech - AP CET & National B.Tech College, Priority Web Options & Counseling Backend

**Inter2Tech** is a complete, full-stack B.Tech counseling companion and seat allotment simulator for Andhra Pradesh (AP EAPCET / ICET / ECET) and National (JEE Main, JEE Advanced, Deemed/Payment) engineering admissions.

It features:
- **330+ Colleges Dataset**: Verified 2025/2026 placement statistics, cutoff closing ranks, hostels, travel routes, and student eateries across all 26 AP districts.
- **APSCHE Web Options Priority Sequencer**: Interactive drag-and-drop prioritization sheet.
- **Seat Allotment Simulator**: Instant Round 1 and Sliding phase qualification simulator based on student rank and reservation category multipliers (OC, EWS, BC-A/B/C/D/E, SC, ST).
- **Document Verification Checklist**: 9 mandatory counseling certificates for HLC verification with local area (AU / SVU) guidelines and JVD fee reimbursement rules.
- **4-Year ROI & Payback Calculator**: Tuition, JVD reimbursement slabs, and hostel expense calculations.
- **Live Transit Geolocation**: Interactive GPS routes and Google Maps integration from candidate location to college campuses.
- **Production-Ready Backend Server**: Real OTP delivery (Email/SMS), JWT authentication, persistent priority history, and direct email dispatch of counseling priority sheets.

---

## 📁 Project Architecture (Clean Frontend & Backend Separation)

```
bridge-project/
├── backend/                       # 🖥️ BACKEND MODULE (Node.js Express + MongoDB)
│   ├── server.js                  # Production Express REST API, Auth & OTP, MongoDB Atlas
│   ├── ai-counselor.js            # Gemini AI Counseling engine
│   ├── models/
│   │   └── User.js                # Mongoose User model for cloud persistence
│   └── data/                      # High-capacity JSON storage & dataset storage
│       ├── colleges.json          # Complete 658 colleges catalog
│       ├── core-colleges.json     # Elite universities catalog
│       ├── districts.json         # All 26 AP districts with transit hubs
│       ├── checklist.json         # 9 mandatory counseling verification documents
│       ├── multipliers.json       # Cutoff multipliers (OC, EWS, BC, SC, ST)
│       ├── users.json             # Local backup user profiles
│       └── dataset_storage/       # Dedicated user records
├── frontend/                      # 🌐 FRONTEND CLIENT (Modular Architecture)
│   ├── index.html                 # 📄 ONLY HTML FILE THAT RUNS THE ENTIRE PROJECT
│   ├── style.css                  # 🎨 Custom styles, animations, dark mode
│   ├── all_colleges_dataset.js    # 🏛️ Full 361+ AP EAPCET college dataset
│   ├── js/
│   │   ├── config.js              # ⚙️ API endpoint configuration (Localhost vs Render)
│   │   ├── colleges-data.js       # 📊 College algorithms & district generator
│   │   ├── counseling.js          # 🎯 Priority list generator, seat simulator, ROI calculator
│   │   └── app.js                 # 🚀 UI events, splash screen, modals, auth, PDF export
│   ├── manifest.json              # 📱 Mobile PWA install manifest
│   ├── sw.js                      # ⚡ Service Worker for fast caching
│   ├── assets/                    # 🖼️ Brand badges and logos
│   └── college_images/            # 📸 Verified college campus photos
├── server.js                      # 🚀 Root loader (delegates to backend/server.js for Render & npm start)
├── firebase.json                  # 🔥 Firebase Hosting configuration (points to frontend/)
└── package.json                   # 📦 Scripts and dependencies
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
A default `.env` file is included with zero-config development settings enabled:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=inter2tech_jwt_secret_secure_key_2025_2026_counseling_companion
DEV_FALLBACK_OTP=true

# Optional SMTP for sending real emails
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Inter2Tech Counseling Portal" <no-reply@inter2tech.com>

# Optional SMS Gateway (e.g., Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```
*Note: In development mode, if SMTP is not configured, OTPs and emailed priority sheets are logged directly to the server terminal so you can test seamlessly without third-party email accounts.*

### 3. Start the Server
```bash
npm start
# or for auto-reload during development:
npm run dev
```

Visit the application in your browser:
👉 **`http://localhost:3000`**

### 4. Run the Test Suite
To run the automated verification suite (tests all 24 REST API endpoints, OTPs, auth, and dataset):
```bash
node run-tests-local.js
```

---

## 📡 REST API Documentation

### 1. Authentication & OTP

#### Send OTP (`POST /api/otp/send`)
Dispatches a 6-digit verification code to the student's email and/or mobile phone.
```json
// Request Body
{
  "email": "student@example.com",
  "phone": "9876543210",
  "channel": "email" // "email" | "phone" | optional (both)
}

// Response
{
  "ok": true,
  "message": "Verification code sent successfully",
  "channels": { "email": true },
  "devMode": true
}
```

#### Verify OTP (`POST /api/otp/verify`)
Verifies the 6-digit code.
```json
// Request Body
{
  "channel": "email",
  "target": "student@example.com",
  "code": "123456" // or "000000" in development mode
}

// Response
{
  "ok": true,
  "verified": true
}
```

#### User Login (`POST /api/login`)
```json
// Request Body
{
  "email": "student@example.com",
  "password": "yourpassword"
}

// Response
{
  "ok": true,
  "token": "eyJhbGciOi...",
  "email": "student@example.com",
  "profile": { "fullName": "Student Name", "gender": "male" },
  "prefs": { "exam": "ap_cet", "rank": 12500 }
}
```

#### Complete Registration (`POST /api/login/complete`)
```json
// Request Body
{
  "email": "student@example.com",
  "phone": "9876543210",
  "username": "student",
  "password": "yourpassword"
}
```

#### Forgot / Reset Password
- `POST /api/forgot` with `{ "email": "..." }`
- `POST /api/reset` with `{ "email": "...", "code": "...", "password": "newpassword" }`

---

### 2. User Profile & Priority History

#### Save/Load Profile (`GET` & `POST /api/profile`)
Requires `Authorization: Bearer <token>` header.
```json
// POST /api/profile
{
  "profile": { "fullName": "Student Name", "gender": "male", "interPct": 94.5 },
  "prefs": { "exam": "ap_cet", "rank": 12500, "category": "BC_B", "branch": "CSE" }
}
```

#### Save/Load Priority History (`GET` & `POST /api/history`)
Synchronizes the candidate's prioritized web options choices across devices.
```json
// POST /api/history
{
  "history": [
    {
      "id": 1731154800000,
      "ts": 1731154800000,
      "exam": "ap_cet",
      "rank": 12500,
      "category": "OC",
      "items": [
        { "collegeId": "c1", "branchCode": "CSE" },
        { "collegeId": "c2", "branchCode": "ECE" }
      ]
    }
  ]
}
```

#### Send Priority Sheet by Email (`POST /api/send-priority`)
Dispatches a formatted counseling priority list to the candidate's email (and optional parent/counselor CC).
```json
{
  "to": "student@example.com",
  "cc": "parent@example.com",
  "name": "Student Name",
  "exam": "ap_cet",
  "rank": 12500,
  "category": "OC",
  "lines": [
    "#1 AUCE - Andhra University College of Engineering [CSE]",
    "#2 JNTUK - JNTU College of Engineering Kakinada [CSE]",
    "#3 VRSEC - Velagapudi Ramakrishna Siddhartha Engineering College [CSE]"
  ]
}
```

---

### 3. College & Counseling Dataset APIs

#### Filter & Search Colleges (`GET /api/colleges`)
Query Parameters:
- `exam`: `ap_cet` | `jee_main` | `jee_adv` | `payment`
- `district`: Name or substring of any of the 26 AP districts
- `region`: `AU` | `SVU` | `ALL`
- `branch`: `CSE` | `ECE` | `INF` | `CSM` | `AID` | `EEE` | `MEC` | `CIV`
- `category`: `OC` | `EWS` | `BC_A` | `BC_B` | `BC_C` | `BC_D` | `BC_E` | `SC` | `ST`
- `rank`: Maximum eligible closing rank (automatically scaled by category reservation)
- `search`: Keyword for college name, code, or city
- `hideLowPlacement`: `true` | `false`
- `sortBy`: `rank_asc` | `placement_high` | `placement_avg` | `rating_high` | `tuition_low` | `name_asc`
- `page` & `limit`: Pagination parameters

#### Single College Details (`GET /api/colleges/:id`)
Fetch comprehensive college profile (branches, placement history, hostels, transit routes, famous eateries).

#### 26 AP Districts Metadata (`GET /api/districts`)
Returns all 26 districts in Andhra Pradesh with regional university affiliation (`AU` / `SVU`) and hub cities.

#### Counseling Document Checklist (`GET /api/checklist`)
Returns 9 original certificates required for APSCHE HLC physical/online verification.

#### Category Cutoff Multipliers (`GET /api/multipliers`)
Returns official reservation multipliers for calculating cutoff scaling from OC down to ST quotas.
