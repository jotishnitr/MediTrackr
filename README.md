<div align="center">

# 💊 MediTrackr

**A modern medicine tracking companion — never miss a dose again.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://jotishnitr.github.io/MediTrackr/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-ISC-blue?style=for-the-badge)](#license)

[Live Site](https://jotishnitr.github.io/MediTrackr/) · [Report Bug](https://github.com/jotishnitr/MediTrackr/issues) · [Request Feature](https://github.com/jotishnitr/MediTrackr/issues)

</div>

---

## 📖 About The Project

**MediTrackr** is a full-stack personal health tracking application built to help users manage their medication schedules reliably. What started as a static HTML/CSS prototype with a hand-built dark-theme design system has evolved into a full **React + Vite** single-page app, backed by a **Node.js/Express/MongoDB** API.

The project focuses on solving a real problem — missed medication doses — with dependable local + push notifications, persistent state, and a clean, distraction-free interface.

---

## ✨ Features

- 💊 **Medicine Tracking** — Add, edit, and manage a personal list of medicines with dosage and schedule details.
- ⏰ **Smart Reminders** — Timely medication alerts powered by the browser Notifications API (web) and `@capacitor/local-notifications` (Android), so reminders fire even outside the browser tab.
- 🔁 **Weekly Reset Logic** — Automatic weekly cycle resets keep recurring schedules accurate without manual upkeep.
- 🔐 **Secure Authentication** — User accounts secured with `bcryptjs` password hashing and `jsonwebtoken` (JWT) session handling.
- 🔑 **Google Sign-In** — One-tap authentication via `@react-oauth/google`.
- 🎨 **Premium Dark UI** — A polished, custom dark-theme design system with smooth, physics-based animations powered by `framer-motion`.
- 📶 **PWA Support** — Installable, offline-capable progressive web app via `vite-plugin-pwa`.
- 💾 **Persistent Local State** — Reliable local caching and sync logic to keep medicine data available across sessions.
- ☁️ **Cloud-Backed Data** — MongoDB Atlas persistence through Mongoose schemas, validation, and middleware hooks.

---

## 🛠️ Tech Stack

**Frontend**

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | Core UI library |
| [Vite 8](https://vitejs.dev/) | Build tool & dev server |
| [Framer Motion](https://www.framer.com/motion/) | Animations & transitions |
| [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) | Google authentication |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Progressive Web App support |
| [ESLint](https://eslint.org/) | Code quality & linting |

**Backend**

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) | REST API server |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Database & ODM |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Password hashing |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | Auth token handling |
| [dotenv](https://www.npmjs.com/package/dotenv) | Environment configuration |
| [nodemon](https://nodemon.io/) | Dev server auto-reload |

**Deployment**

| Technology | Purpose |
|---|---|
| [GitHub Pages](https://pages.github.com/) via `gh-pages` | Web hosting |

---

## 🚀 Live Demo

The web version is live at:

- **🔗 [https://jotishnitr.github.io/MediTrackr/](https://jotishnitr.github.io/MediTrackr/)** (Most preferable)

- **🔗 [https://medi-trackr--djotishkumar202.replit.app/](https://medi-trackr--djotishkumar202.replit.app/)**

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm
- A MongoDB Atlas connection string (for backend functionality)

### Installation

```bash
# Clone the repository
git clone https://github.com/jotishnitr/MediTrackr.git
cd MediTrackr

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the `server` directory with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Running Locally

```bash
# Start the frontend (Vite dev server)
npm run dev

# In a separate terminal, start the backend
cd server
npm start
```

### Building for Production

```bash
npm run build
```

### Deploying to GitHub Pages

```bash
npm run deploy
```

---

## 📁 Project Structure

```
MediTrackr/
├── assets/           # App icons, splash screens, static assets
├── public/           # Static public assets served by Vite
├── server/           # Node.js/Express + MongoDB backend
├── src/              # React frontend source code
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

## 👤 Author

**Jotish**
GitHub: [@jotishnitr](https://github.com/jotishnitr)

<div align="center">

If you found this project useful, consider giving it a ⭐!

</div>
