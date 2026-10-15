# ForgeFit — Performance OS & Athletic Coaching Platform

ForgeFit is a full-stack, enterprise-grade fitness coaching platform engineered for performance studios, personal trainers, and athletes. It provides real-time workout adherence tracking, program architecture design, two-way communication, session scheduling, and morning recovery analytics.

---

## ⚡ Quick Start (Ready to Use Out-of-the-Box)

The project includes an automatic in-memory MongoDB server with pre-seeded demo data, so you do not need to configure an external database to run it locally.

### 1. Install Dependencies

In the project root:
```bash
npm install
```

In the backend folder (`fitness-backend`):
```bash
cd fitness-backend && npm install && cd ..
```

### 2. Launch Full Stack with a Single Command

```bash
npm start
```
*(or `npm run dev:all`)*

This runs both:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://127.0.0.1:5173`

Open `http://127.0.0.1:5173` in your browser.

---

## 🔑 Pre-Configured Demo Accounts

Use the **One-Click Demo Access** buttons on the Login page or sign in manually:

| Role | Email | Password | What You Can Access |
|---|---|---|---|
| **Coach / Admin** | `admin@forgefit.com` | `admin123` | Executive Cockpit, Roster Management, Program Builder, Calendar & Session Scheduler, Athlete Chat |
| **Athlete / Client** | `client@forgefit.com` | `client123` | Athlete Command Center, Workout Tracker, Program Checklists, Recovery Signals, Direct Coach Line |
| **Demo Athlete 2** | `ava@forgefit.com` | `demo123` | Assigned Functional Core workouts, Booked technique call |
| **Demo Athlete 3** | `leo@forgefit.com` | `demo123` | Assigned Speed & Agility sessions, HIIT check-in data |

---

## 🚀 Key Features & Capabilities

### 1. Executive Performance Cockpit (Coach)
- **Live Metrics**: Real-time adherence %, total workouts assigned vs. completed, estimated metabolic output (calories), and total logged volume.
- **Interactive Analytics**: Stacked bar charts and completion ratio pie charts powered by Recharts.
- **Recovery Signal Feed**: Live stream of morning readiness scores (energy, sleep hours, mood, muscle soreness).
- **Focus Board**: Identifies athletes requiring immediate volume adjustment or follow-up.

### 2. Program Architecture Studio
- Build structured training blocks with sets, rep ranges, rest intervals, and coach execution notes.
- One-click presets (Hypertrophy 3×10, Strength 4×8, Power 5×5, Pump 3×15, Core 3×45s).
- Pre-populated library of benchmark compound exercises.
- Direct dispatch to client dashboards with completion tracking.

### 3. Athlete Roster & Workout Management
- Quick search and filtering across all registered athletes.
- Add new client users or enroll athletes into coaching programs.
- Quick-assign workouts from the central exercise template library.
- Log, view, and delete coaching cues with chronological timestamps.
- Batch removal and workout checklist toggling.

### 4. Interactive Session Scheduler
- Schedule 1:1 coaching calls, technique reviews, and conditioning sessions.
- Integrated video consultation launch links (Zoom, Google Meet).
- One-click status management (Booked, Confirmed, Completed, Cancelled).
- Session deletion and copyable meeting URLs.

### 5. Direct Athlete-Coach Messaging
- Instant 2-way communication stream with active sync notifications.
- Quick suggestion chips for rapid coach cues and athlete check-in updates.
- Conversation search and unread message indicators.

### 6. Athlete Portal & Daily Readiness Check-In
- Self-service portal for athletes to view and check off assigned exercises.
- Daily morning check-in widget: 1-10 energy slider, sleep duration slider, mood selector, and notes.
- Visual 7-day recovery trend graph with color-coded readiness bars.
- Direct video consultation launcher.

### 7. Nutrition, Macros & Daily Habits Engine
- **Macro Target Architecture**: Coaches configure individualized calorie, protein, carbohydrates, fats, hydration, and daily step targets.
- **1-Tap Hydration Tracker**: Fast water logging buttons (+250ml, +500ml, +1L) with real-time target fulfillment visualization.
- **Daily Step Volume**: Monitors daily physical activity adherence against coach targets.
- **7-Day Caloric Adherence Chart**: Visual breakdown of calorie intake versus target ceiling over the past week.
- **Daily Food & Macro Logging**: Athletes record daily nutrient intake with macro distribution gauges.

### 8. Body Composition & Transformation Tracker
- **Weigh-in Tracking**: Chronological body weight logging with body fat percentage and circumference metrics (waist, chest).
- **Interactive Transformation Chart**: Dynamic Recharts curve showing weight trajectory and body recomposition milestones.
- **Historical Transformation Roster**: Clean log table with individual record deletion and notes.

### 9. Active Workout Companion & Rest Timer
- **Interval Stopwatch**: Built-in 30s, 60s, 90s, and 120s rest interval presets embedded directly on the athlete training dashboard.
- **Audio-Visual Countdown**: Live pause, start, and reset controls with pulse animations when rest intervals conclude.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS, Lucide React, Recharts, Axios.
- **Backend**: Node.js, Express 5, Mongoose 9, MongoDB Memory Server (local zero-config fallback), JWT Authentication, Bcrypt.
- **Tooling**: Concurrently (multi-server orchestration), ESLint 9, PostCSS.

---

## 📂 Project Architecture

```text
FitnessApp/
├── package.json              # Root package with dev:all / start commands
├── vite.config.js            # Vite build configuration
├── tailwind.config.js        # Tailwind CSS design system
├── src/
│   ├── api.js                # Axios client with JWT + 401 interceptors
│   ├── App.jsx               # Protected routing & role guards
│   ├── components/
│   │   ├── Layout.jsx        # Sidebar navigation & live message alerts
│   │   └── ProtectedRoute.jsx# Role-based route guard
│   ├── pages/
│   │   ├── Home.jsx          # Public showcase & marketing landing page
│   │   ├── Login.jsx         # Sign in with one-click demo triggers
│   │   ├── Signup.jsx        # Athlete registration
│   │   ├── Dashboard.jsx     # Coach executive cockpit
│   │   ├── ClientDashboard.jsx # Athlete training & recovery dashboard
│   │   ├── Clients.jsx       # Roster management & coach cues
│   │   ├── ProgramBuilder.jsx# Periodized routine architect
│   │   ├── Schedule.jsx      # Session booking & calendar
│   │   └── Messages.jsx      # Two-way live chat
│   └── utils/
│       └── auth.js           # Auth state & token persistence
└── fitness-backend/
    ├── local-server.js       # Express server with in-memory Mongo fallback
    ├── server.js             # Serverless / host-ready entry
    ├── middleware/
    │   ├── auth.js           # JWT verification middleware
    │   └── admin.js          # Coach/Admin role authorization
    ├── models/
    │   ├── User.js           # User credentials & role
    │   ├── Client.js         # Athlete roster, sessions, notes, check-ins
    │   ├── Plan.js           # Workout template library
    │   └── Program.js        # Structured multi-exercise routines
    └── routes/
        ├── auth.js           # Signup, login, and user dropdown
        ├── clients.js        # Roster, sessions, notes, workouts
        ├── programs.js       # Program creation & exercise toggles
        └── workouts.js       # Central exercise library
```

---

## 🌐 Production Deployment

To connect a persistent MongoDB Atlas cluster instead of the in-memory database:
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Set the environment variable in `fitness-backend/.env` or on your host:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/forgefit?retryWrites=true&w=majority
   JWT_SECRET=your_production_secret_key
   PORT=5000
   ```
3. Deploy the backend to Render, Railway, or VPS.
4. Set `VITE_API_URL=https://your-backend-api.example.com/api` and deploy the frontend to Vercel, Netlify, or Render.
