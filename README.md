# 🚀 SkillSync

SkillSync is a full-stack platform designed for students to track their technical learning and interview preparation — and for recruiters to evaluate real skill progress. It provides secure authentication, role-based access, gamified learning progress, and a scalable structure for DSA practice and interview tools.

---

## ✨ Key Features

### 👤 Authentication & Security
- Secure login & signup (Email + Password)
- JWT-based authentication (no third-party OAuth)
- Password hashing with bcrypt
- Token stored and managed via LocalStorage
- Axios interceptor to auto-attach token

### 🎓 Student & Recruiter Functionality
- **Student view:** Track learning, XP, solved problems, skills, growth
- **Recruiter view:** Evaluate candidate readiness & skill maturity
- Role stored in DB + frontend logic

### 📊 Dashboard & Progress Tracking
- Personal profile with XP & progress stats
- Visual analytics for learning milestones
- Structured architecture for:
  - DSA modules (Arrays, DP, Graphs, Trees etc.)
  - Interview question practice
  - Leaderboards (Roadmap ready)

### 💻 Modern UI/UX
- Next.js + Tailwind CSS
- Clean, responsive design
- Form validation & error handling

### 🧠 Scalable System Design
- REST APIs
- Modular code structure
- Easy to extend: resume analyzer, mock interviews, leaderboard

---

## 🛠 Tech Stack

| Layer | Technologies |
|------|-------------|
| **Frontend** | Next.js, React, Tailwind CSS, Zustand, Axios |
| **Backend** | Node.js, Express.js, JWT, bcrypt |
| **Database** | MySQL (user profile, stats, tokens, roles) |
| **Tools** | dotenv, REST API, LocalStorage |

---

## 🗂 Folder Structure

skillsync/
├── frontend/
│ ├── pages/
│ ├── components/
│ ├── store/ (Zustand)
│ └── utils/ (Axios interceptor)
└── backend/
├── routes/
├── controllers/
├── middleware/
├── models/
└── config/

---

## ⚙️ Setup & Installation

### ✅ Clone Repository
```bash
git clone https://github.com/yourusername/skillsync.git
cd frontend
npm install
cd backend
npm install
NEXT_PUBLIC_API_URL=http://localhost:5000/api
PORT=5000
DB_USER=root
DB_PASSWORD=yourpassword
JWT_SECRET=yourSecretKey
cd backend
npm run dev
cd frontend
npm run dev


```

🧑‍💻 Purpose
SkillSync helps students showcase real learning progress, not just a resume — and helps recruiters evaluate verified skill readiness.

⭐ Support
If you like this project, give it a ⭐ on GitHub and follow the journey!
Contributions, issues, and suggestions are welcome.
