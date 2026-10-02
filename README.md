<div align="center">

# 💊 MediTrackr

**An intelligent, AI-powered Personal Health Operating System — never miss a dose or vital metric again.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://jotishnitr.github.io/MediTrackr/)
[![API Status](https://img.shields.io/badge/backend-Render-informational?style=for-the-badge&logo=render&logoColor=white)](https://meditrackr.onrender.com/health)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-ISC-blue?style=for-the-badge)](#license)

[Live Web App](https://jotishnitr.github.io/MediTrackr/) · [Report Bug](https://github.com/jotishnitr/MediTrackr/issues) · [Request Feature](https://github.com/jotishnitr/MediTrackr/issues)

</div>

---

## 📖 About The Project

**MediTrackr** is a full-stack personal health and medication management platform designed to make daily health management seamless, proactive, and intelligent. 

What began as a medicine tracking utility has evolved into a comprehensive **Personal Health Operating System (Health OS)**. MediTrackr combines automated scheduling, multi-channel push reminders, FDA drug verification, comprehensive daily vitals tracking, autonomous AI Copilot actions, doctor-ready clinical PDF exports, low-stock refill forecasting with pharmacy purchase suggestions, caregiver connection networks, and 16-language internationalization.

---

## ✨ Key Features

### 🤖 Dual-Mode AI Health Assistant & Copilot
- **MediTrackr Copilot (Autonomous Action Agent)**:
  - Executes real application actions directly from natural language conversation via function/tool calling.
  - Automatically adds new medicines, schedules recurring reminders, updates vitals, adjusts timetables, and drafts doctor summaries.
  - Interactive confirmation cards allow users to review and confirm or discard pending actions before execution.
- **Health Advisor (Clinical Q&A & Prescription Scanner)**:
  - Answers medical and medication questions with contextual health guidance.
  - **Multimodal Vision / Image Scanner**: Upload photos of prescriptions, medicine labels, or diagnostic lab reports for automatic AI parsing and extraction.
- **Voice-to-Text Integration**: Hands-free voice input powered by the Web Speech API with automatic language mapping.
- **History & Feedback**: Persistent conversation history with one-click clear and in-app feedback submission.

### 📄 Clinical Health & Medication PDF Reports
- Generates official, doctor-ready **Clinical Health & Medication Summary Reports** formatted to clinical standards using `jsPDF` and `html2canvas`.
- Compiles active medication regimens, dosage timings, adherence percentages, vital history (blood pressure, sugar, heart rate), symptom records, and clinical precautions into an exportable document ready to share with physicians.

### 📊 Comprehensive Health Logging & AI Summarization
- **Daily Vitals & Biometrics**:
  - Tracks **Blood Pressure** (systolic/diastolic), **Heart Rate** (BPM), **Blood Sugar** (fasting, post-meal, or random), **Body Temperature**, and **Body Weight**.
  - **Water Intake Tracker**: Dynamic hydrometer with 250ml quick-add increments.
  - **Sleep Tracker**: Logs hours rested each night.
- **Lifestyle & Symptom Tracking**:
  - Visual selector for **Mood** (Great, Good, Okay, Stressed, Low), **Energy Level**, **Stress Level**, **Pain Level Slider** (0–10), and **Physical Activity** intensity.
  - **Lifestyle Factors**: Caffeine, Alcohol, High Salt, Smoking tags.
  - **Symptom Checklist**: Headache, Fatigue, Nausea, Dizziness, Pain, Fever, Cough, Insomnia, Chills, Congestion, Sore Throat, Anxiety, etc.
- **Gemini AI Health Summarization**:
  - Synthesizes logged biometrics, symptoms, lifestyle tags, and medication adherence into comprehensive AI health summaries, identifying risks, health trends, and personalized wellness suggestions.
  - Automated daily reminders prompt users to complete their health log.

### 💊 Smart Medication Management & Adherence
- **Custom Regimen Builder**: Add, edit, and organize medicines with custom dosages, dosage forms (tablets, capsules, syrups, injections), meal rules (before food, after food, with food), and active day schedules.
- **Today's Schedule & 1-Click Status**: Quickly mark doses as **Taken**, **Pending**, or **Missed** directly from the dashboard.
- **Weekly Adherence Analytics**: Interactive visual adherence charts, streak counters, and compliance percentages.
- **Automated Weekly Cycle Reset**: Background reset routines ensure recurring schedules remain synchronized without manual intervention.

### 🛒 Upcoming Refills Tracker & Buy Suggestions
- **Refill Forecasting**: Calculates real-time supply depletion and days remaining for every medication.
- **Urgency Badges**: Visual indicators (**Out of Stock**, **Urgent** [≤3 days], **Warning** [≤7 days], **Normal**).
- **Direct Pharmacy Buy Links**: 1-click links to top online pharmacies (**1mg**, **Apollo Pharmacy**, **PharmEasy**, and **Netmeds**) with drug names automatically pre-queried.

### 🔍 OpenFDA Drug Database Search
- Integrated directly with the official **openFDA Drug API** (`fetchFDA`).
- Search over-the-counter and prescription medicines to review generic names, brand names, active ingredients, dosage forms, manufacturer details, official indications, warnings, and precautions.
- Add any discovered medication directly to your personal schedule with a single click.

### ⏰ Multi-Channel Smart Reminders & Background Schedulers
- **Web Push Notifications**: Browser push notifications via `web-push` (VAPID) and Firebase Cloud Messaging (FCM) to deliver timely dosage alerts.
- **Audible Chimes & Alerts**: Customizable chime sounds and in-browser popups.
- **Node-Cron Background Jobs**:
  - Real-time scheduled medicine reminder triggers.
  - Automated refill warning notifications for low stock.
  - Evening daily health log logging reminders.
  - Weekly adherence status resets.

### 👨‍👩‍👧‍👦 Family & Caregiver Connection Network
- Link family members and caregivers via email invitation.
- **Notification Inbox**: Interactive notification center with real-time **Accept** and **Reject** controls for caregiver access requests.
- Track caregiver connection status (**Connected** / **Pending**) directly inside the Health Profile.
- Emergency contact integration for rapid response.

### 🌐 16-Language Internationalization (i18n)
- Powered by `i18next` with real-time language switching across the entire UI.
- Supported languages:
  | Language | Code | Language | Code |
  |---|---|---|---|
  | **English** | `en` | **Kannada (ಕನ್ನಡ)** | `kn` |
  | **Hindi (हिन्दी)** | `hi` | **Odia (ଓଡ଼ିଆ)** | `or` |
  | **Bengali (বাংলা)** | `bn` | **Malayalam (മലയാളം)** | `ml` |
  | **Telugu (తెలుగు)** | `te` | **Punjabi (ਪੰਜਾਬੀ)** | `pa` |
  | **Marathi (मराठी)** | `mr` | **Assamese (অসমীয়া)** | `as` |
  | **Tamil (தமிழ்)** | `ta` | **Maithili (मैथिली)** | `mai` |
  | **Urdu (اردو)** | `ur` | **Sanskrit (संस्कृतम्)** | `sa` |
  | **Gujarati (ગુજરાતી)** | `gu` | **Nepali (नेपाली)** | `ne` |
- Automatic bidirectional AI translation so users can interact with Copilot and Health Advisor in their native tongue.

### 💬 HelpBot Floating Guide
- Interactive floating assistant accessible from any screen.
- Offers instant guidance, quick navigation prompts, FAQs, voice input, and contact support info.

### 🔐 Security & User Authentication
- Secure authentication using `bcryptjs` password hashing and HTTP-only cookie-based `jsonwebtoken` (JWT) sessions.
- **Google OAuth 2.0**: One-tap sign-in with `@react-oauth/google`.
- **Password Recovery**: Secure Forgot/Reset Password workflow with time-limited tokens and automated transactional emails delivered via Brevo (Sendinblue).

### 📱 Progressive Web App (PWA) & Polished UI
- Fully responsive, mobile-first design with a dark aesthetic.
- Physics-based animations and transitions powered by `framer-motion`.
- Offline capabilities and installable home screen experience via `vite-plugin-pwa` and Service Workers.

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | Component architecture & modern UI rendering |
| [Vite 8](https://vitejs.dev/) | Next-generation frontend build tooling and dev server |
| [Framer Motion](https://www.framer.com/motion/) | Physics-based animations, layout transitions, and modals |
| [i18next](https://www.i18next.com/) + `react-i18next` | Complete internationalization (16 languages) |
| [jsPDF](https://github.com/parallax/jsPDF) + `html2canvas` | Client-side clinical PDF report generation |
| [React Markdown](https://github.com/remarkjs/react-markdown) + `remark-gfm` | Formatted clinical markdown rendering for AI responses |
| [React Router v7](https://reactrouter.com/) | Client-side routing and deep-linking |
| [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) | One-tap Google authentication |
| [Firebase](https://firebase.google.com/) | Firebase Cloud Messaging (FCM) client support |
| [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) | Voice recognition and speech-to-text dictation |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Service worker caching and installable PWA manifest |

### Backend

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) | High-performance RESTful API server |
| [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com/) | Document database, schemas, and indexing |
| [@google/genai](https://www.npmjs.com/package/@google/genai) | Google Gemini AI integration (Copilot, Advisor & Summarizer) |
| [web-push](https://www.npmjs.com/package/web-push) | VAPID-based Web Push Notifications |
| [Firebase Admin](https://firebase.google.com/docs/admin/setup) | Server-side FCM notification delivery |
| [node-cron](https://www.npmjs.com/package/node-cron) | Scheduled background jobs (reminders, resets, health logs) |
| [@getbrevo/brevo](https://www.npmjs.com/package/@getbrevo/brevo) | Transactional email delivery for password resets |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) + [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Stateless JWT authentication & password encryption |
| [cookie-parser](https://www.npmjs.com/package/cookie-parser) + [cors](https://www.npmjs.com/package/cors) | Secure HTTP-only cookies and flexible origin handling |

### Deployment & Infrastructure

| Service | Purpose |
|---|---|
| [GitHub Pages](https://pages.github.com/) (`gh-pages`) | Frontend PWA hosting with SPA routing & `.nojekyll` configuration |
| [Render](https://render.com/) | Production Node.js/Express backend hosting |
| [MongoDB Atlas](https://www.mongodb.com/) | Cloud database cluster |

---

## 🚀 Live Demo

- **Frontend Web App**: [https://jotishnitr.github.io/MediTrackr/](https://jotishnitr.github.io/MediTrackr/)
- **Backend API Endpoint**: [https://meditrackr.onrender.com](https://meditrackr.onrender.com)
- **Health Check Ping**: [https://meditrackr.onrender.com/health](https://meditrackr.onrender.com/health)

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) database cluster
- A [Google AI Studio](https://aistudio.google.com/) Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/jotishnitr/MediTrackr.git
cd MediTrackr

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Environment Configuration

#### 1. Frontend Environment (`.env` in root directory)

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
VITE_VAPID_PUBLIC_KEY=your_web_push_vapid_public_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

#### 2. Backend Environment (`server/.env`)

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

# Google Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key

# Web Push (generate via npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Google OAuth
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret

# Brevo (Transactional Email for Password Resets)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email@example.com

# Firebase Admin (Optional / FCM notifications)
project_id=your_firebase_project_id
client_email=your_firebase_service_account_email
private_key="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Running Locally

```bash
# Terminal 1: Start the backend server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Start the frontend Vite server (runs on http://localhost:5173)
npm run dev
```

### Building for Production

```bash
# Build the optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```

### Deploying to GitHub Pages

```bash
# Builds and deploys the dist directory to gh-pages branch
npm run deploy
```

---

## 📁 Project Structure

```
MediTrackr/
├── assets/                       # Brand icons, graphics, static assets
├── public/                       # Favicons, Web App Manifest, Service Worker
│   ├── manifest.json
│   ├── service-worker.js
│   └── 404.html                  # SPA routing fallback for GitHub Pages
├── server/                       # Node.js/Express + MongoDB backend
│   ├── config/                   # MongoDB connection & configuration
│   ├── controllers/              # Route controller handlers
│   │   ├── copilot.js            # AI Copilot functional tool execution
│   │   ├── geminiAi.js           # Gemini AI HelpBot conversation
│   │   ├── geminiAssistant.js    # Gemini Health Advisor Q&A + Image analysis
│   │   ├── healthLog.js          # Health metrics persistence & retrieval
│   │   ├── healthLogAI.js        # Gemini Daily Health Summarization
│   │   ├── reminderMedicine.js   # Medication reminder management
│   │   └── subscribe.js          # Web Push VAPID subscription handler
│   ├── middleware/               # JWT authentication middleware
│   ├── models/                   # Mongoose schemas (User, Medicine, HealthLog, ChatHistory)
│   ├── routes/                   # Modular Express API route definitions
│   ├── utils/                    # Cron jobs, reminder schedulers, email sender
│   │   ├── healthLogReminder.js  # Scheduled evening health log reminder
│   │   ├── reminderScheduler.js  # Real-time medication dose scheduler
│   │   ├── reminderRefill.js     # Low-supply refill alert scheduler
│   │   └── resetMedicineStatus.js# Weekly adherence cycle reset
│   ├── server.js                 # API server entrypoint & route registration
│   └── package.json
├── src/                          # React application source code
│   ├── locales/                  # i18n translation dictionaries (16 languages)
│   ├── utils/                    # Frontend utilities & helpers
│   │   ├── medicineUtils.js      # Dose status & schedule calculation
│   │   ├── pdfGenerator.js       # Clinical report PDF generation (jsPDF + html2canvas)
│   │   ├── pushNotification.js  # Web Push subscription registration
│   │   ├── translator.js         # Bidirectional language translation bridge
│   │   └── useSpeechToText.js    # Web Speech API speech-to-text hook
│   ├── AiAssistant.jsx           # MediTrackr Copilot & Health Advisor modal/page
│   ├── Dashboard.jsx             # Main dashboard (Today's Schedule, Adherence, Refills)
│   ├── HealthLog.jsx             # Daily Vitals, Symptoms, & AI Health Summary UI
│   ├── HelpBot.jsx               # Floating interactive guide bot
│   ├── LanguageSelector.jsx      # Multi-language selector dropdown
│   ├── MedicineModal.jsx         # Add/Edit medicine form modal
│   ├── MyMedicines.jsx           # Medicine cabinet & detailed regimen viewer
│   ├── Navbar.jsx                # Responsive header, navigation & quick-action icons
│   ├── NotificationModal.jsx     # Connection requests & notifications inbox
│   ├── ProfileModal.jsx          # Health profile & caregiver linking modal
│   ├── Reminders.jsx             # Timetable, weekly adherence chart & reminders
│   ├── SearchMedicine.jsx        # FDA Drug Database search UI
│   ├── App.jsx                   # Primary router & global state coordinator
│   ├── index.css                 # Custom design system tokens & styles
│   └── main.jsx                  # React application mount point
├── vite.config.js                # Vite build and PWA plugin configuration
├── eslint.config.js              # ESLint configuration
└── package.json                  # Root dependencies and scripts
```

---

## 🔌 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/ping`, `/health` | Health check & uptime keep-alive |
| `POST` | `/register`, `/login` | User registration & authentication |
| `POST` | `/googleLogin` | Google OAuth 2.0 verification |
| `POST` | `/logout` | Clear authentication session |
| `POST` | `/forgotPassword`, `/resetPassword` | Password recovery via email tokens |
| `GET`, `POST`, `PUT`, `DELETE` | `/getMedicine`, `/addMedicine`, `/updateMedicine`, `/deleteMedicine` | Medicine CRUD operations |
| `POST` | `/statusMedicine` | Update medication status (`TAKEN`, `PENDING`, `MISSED`) |
| `GET` | `/getUpcomingRefills` | Fetch low-stock medications and remaining days |
| `GET` | `/weeklyAdherence` | Adherence rate history for the current week |
| `GET`, `POST` | `/getHealthLog`, `/healthLog` | Fetch and persist daily health vitals & symptoms |
| `POST` | `/healthLogAi` | Generate AI clinical summary from health logs |
| `POST` | `/copilot` | Execute autonomous AI Copilot actions with tool calling |
| `POST` | `/geminiAiAssistant` | Health Advisor Q&A with multimodal image scanning |
| `GET`, `DELETE` | `/getCopilotHistory`, `/deleteCopilotHistory` | Manage Copilot chat conversation history |
| `GET`, `DELETE` | `/getChatHistory` | Manage HelpBot conversation history |
| `GET` | `/fetchFDA` | Query openFDA drug database |
| `POST` | `/subscribe` | Register Web Push VAPID subscription |
| `GET` | `/getNotifications` | Fetch incoming notifications and connection requests |
| `POST` | `/respondConnection` | Accept or reject caregiver / family link requests |

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

## 👤 Author

**Jotish**  
- GitHub: [@jotishnitr](https://github.com/jotishnitr)
- Live Site: [MediTrackr](https://jotishnitr.github.io/MediTrackr/)

<div align="center">

If you find MediTrackr helpful, please consider giving it a ⭐ on GitHub!

</div>
