# 🚗 Sithma Driving School Management System

> **A Comprehensive Full-Stack MERN Driving School Operations & Learner Management Platform**  
> Developed for **Sithma Driving School** (Maharagama, Werahara, and Delgoda branches) as part of the **SLIIT IE2091 Software Project Management (ISPM)** module.

---

## 🌟 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Highlights & Business Rules Matrix](#-key-highlights--business-rules-matrix)
3. [Implemented Epics & Core Features](#-implemented-epics--core-features)
4. [System Architecture & Technology Stack](#-system-architecture--technology-stack)
5. [Demo User Accounts](#-demo-user-accounts)
6. [Getting Started & Local Setup](#-getting-started--local-setup)
7. [API Endpoints Overview](#-api-endpoints-overview)
8. [Definition of Done (DoD) Checklist](#-definition-of-done-dod-checklist)

---

## 📋 Project Overview

Sithma Driving School is a multi-branch driving academy in Sri Lanka operating across **Maharagama, Werahara, and Delgoda**. This web platform digitizes the entire student lifecycle—from online learner registration and package selection to lesson scheduling, bank transfer payment slip verification, Department of Motor Traffic (DMT) milestone tracking, and multilingual exam preparation.

---

## ⚖️ Key Highlights & Business Rules Matrix

| Rule / Constraint | Domain / Module | Implementation Details |
| :--- | :--- | :--- |
| **3-Month Trial Rule** | DMT Milestones | Practical driving test cannot be scheduled earlier than **3 full months** after passing the DMT written learner examination. |
| **1.5-Year Trial Deadline** | DMT Milestones | Students must complete practical trial within **18 months (1.5 years)** of passing the written test before the permit lapses. |
| **3-Attempt Maximum** | DMT Practical Trial | Maximum **3 trial attempts** permitted. If all 3 attempts fail, the system requires student re-registration. |
| **2-Year Light Vehicle Rule** | Heavy Vehicle (Bus) | Applicants for the Heavy Vehicle / Bus package must hold a valid Light Vehicle license for **at least 2 years**. |
| **2+2 Bonus Lessons Bundle** | Course Packages | Enrolling in the **Car Full Package** automatically grants **2 free Bike** and **2 free Three-Wheeler** practical sessions. |
| **Double-Booking Prevention** | Scheduling Engine | Unique compound database index (`{ instructorId: 1, date: 1, startTime: 1 }`) prevents overlapping assignments. |
| **Branch Daily Sessions** | Branch Time Slots | Each branch operates **3 daily 1-hour slots** (08:30–09:30, 10:00–11:00, 14:00–15:00) with 6 certified instructors. |
| **Multilingual Practice Exam** | DMT Exam Practice | Informal practice quiz available in **Sinhala (සිංහල)**, **Tamil (தமிழ்)**, and **English** with 80% passing benchmark. |

---

## 🚀 Implemented Epics & Core Features

### 🔵 EPIC-01: Student Registration, DMT Milestones & Course Packages
- **4-Step Registration Wizard**: Choose Type 1 (New Learner) or Type 2 (Trial-Ready), select branch, pick course package with bonus lesson badges, and create credentials.
- **DMT Milestone Stepper Timeline**: Visual 5-stage progress stepper (Registration ➔ Medical Exam ➔ Learner Exam ➔ 3-Month Practical Window ➔ Driving License Issued).
- **Staff DMT Management Drawer**: Filter learners by branch/status, update medical & learner test results, schedule practical trials, and record pass/fail results.
- **Course Packages Management**: Staff CRUD for managing package prices, lesson counts, and vehicle categories.

### 🟡 EPIC-02: Lesson Scheduling & Time-Slot Management
- **Student Lesson Booking Grid**: Real-time slot availability grid by branch and date with double-booking prevention.
- **Student Lesson Manager**: Upcoming booked lessons, past lesson history, Free Weekly Theory & Practical Class reservation modal, and extra lessons purchase request.
- **Staff Slot Controller**: Create custom time slots and assign instructors per branch.
- **Instructor Daily Schedule**: Real-time view for instructors showing assigned sessions, student names, and contact numbers.

### 🟢 EPIC-03: Payment Slip Upload & Verification + Notifications
- **Multer Slip Upload**: Drag-and-drop / file picker for bank deposit slips and online transfer receipts with instant image preview.
- **Staff Payment Queue**: List of pending slips with high-resolution image modal, one-click confirmation (confirms registration), or rejection with customizable reason feedback.
- **In-App Notification Center**: Notification bell in navbar with real-time polling badge (every 30s) and full filterable alert center.

### 🟣 EPIC-04: Multilingual Practice Quiz & Analytics
- **Multilingual Exam Module**: 3-language selector (English, Sinhala, Tamil) and Light/Heavy vehicle categories.
- **Interactive Quiz Stepper**: Real-time progress bar, 4 multiple-choice options, and server-side scoring engine.
- **Results & Score Review**: Color-coded score cards (≥80% Pass, 50-79% Needs Practice, <50% Failed) with question-by-question explanations.
- **Recharts Performance Chart**: Score progression over time line chart.
- **Staff Question Bank Manager**: CRUD for adding, filtering, and deleting questions per language.

### 📊 Executive Admin Dashboard
- **Aggregate KPI Metrics**: Active students, unverified slips, upcoming trials (30 days), and total confirmed revenue (LKR).
- **Recharts Visualizations**:
  - Branch Registrations Bar Chart (Maharagama vs Werahara vs Delgoda).
  - Practical Trial Success Rate Donut Chart (1st, 2nd, 3rd attempts, Failed).
- **Recent Activity Stream**: Live feed of recent registrations, DMT updates, and payments.

---

## 🛠️ System Architecture & Technology Stack

```
sithma-driving-school/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with JWT interceptor
│   │   ├── components/         # Navbar, DmtTimeline, NotificationBell
│   │   ├── context/            # AuthContext (user, student, role guards)
│   │   ├── pages/              # 12+ Role-Based Pages
│   │   └── index.css           # Sithma design system & color tokens
├── server/                     # Backend (Node.js + Express + Mongoose)
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # 7 Controllers (Auth, Student, Slot, Booking, Payment, Quiz, Admin)
│   ├── middleware/auth.js      # JWT authentication & RBAC authorize middleware
│   ├── models/                 # 10 Mongoose Models
│   ├── routes/                 # Express API routes
│   ├── seed/seedAll.js         # Comprehensive master database seed script
│   └── uploads/slips/          # Uploaded bank payment slips
```

- **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM), JWT, BcryptJS, Multer.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Recharts, Date-fns, React Hot Toast, React Router DOM v6.
- **Design System Tokens**:
  - Primary Blue: `#0B5FA5`
  - Primary Dark: `#073B68`
  - Accent Amber: `#F2A93B`
  - Success Green: `#2E9E6B`
  - Warning Amber: `#E0A32E`
  - Danger Red: `#D64545`
  - Neutral Background: `#F8FAFC`

---

## 👥 Demo User Accounts

The database seed script initializes ready-to-test accounts for all **4 roles**:

| Role | Email Address | Password | Branch / Description |
| :--- | :--- | :--- | :--- |
| **Student** | `student.kasun@gmail.com` | `password123` | Kasun Perera (Car Full Package, Maharagama) |
| **Staff (Registrar)** | `staff.maharagama@sithma.lk` | `password123` | Nimali Fernando (Maharagama Branch Registrar) |
| **Staff** | `staff.werahara@sithma.lk` | `password123` | Chaminda Silva (Werahara Branch Staff) |
| **Instructor** | `instructor.sunil@sithma.lk` | `password123` | Sunil Jayawardena (Senior Instructor, Maharagama) |
| **Admin (Director)** | `admin@sithma.lk` | `admin123` | Dr. Sithma Rajapaksha (Executive Director) |

---

## 💻 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017`

### 2. Backend Setup
```bash
cd server
npm install
node seed/seedAll.js    # Seeds all demo users, packages, branches, and quiz questions
npm run dev             # Starts Express server on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev             # Starts Vite client on http://localhost:5173
```

> **Note on Port Configuration**:
> - Backend runs on **Port 5001** (avoids macOS AirPlay Receiver port 5000 conflicts).
> - Frontend runs on **Port 5173** and proxies `/api` and `/uploads` to `http://localhost:5001`.

---

## 🌐 API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `GET` | `/api/students/:id` | Authenticated | Get student profile & milestone timeline |
| `PATCH` | `/api/students/:id/dmt` | Staff / Admin | Update DMT medical, learner, or trial dates |
| `GET` | `/api/slots` | Authenticated | Get branch time slots by date |
| `POST` | `/api/bookings` | Student | Book a lesson slot with conflict check |
| `POST` | `/api/payments/upload` | Student | Upload payment slip image (Multer) |
| `PATCH` | `/api/payments/:id/verify` | Staff / Admin | Confirm or reject payment slip |
| `GET` | `/api/quiz/questions` | Public | Fetch practice questions in Sinhala/Tamil/English |
| `POST` | `/api/quiz/attempt` | Student | Submit quiz answers for server-side scoring |
| `GET` | `/api/admin/analytics` | Admin / Staff | Cross-branch KPI metrics and chart datasets |

---

## ✅ Definition of Done (DoD) Checklist

- [x] **EPIC-01 Completed**: Student registration wizard, Type 1 & Type 2 selection, milestone stepper, 3-month trial rule, 1.5-year deadline, 3-attempt limit.
- [x] **EPIC-02 Completed**: Lesson slot grid, instructor scheduling, double-booking prevention, 2+2 bonus lessons bundle, free weekly classes.
- [x] **EPIC-03 Completed**: Multer bank slip upload, staff verification queue, modal review, in-app notifications with polling.
- [x] **EPIC-04 Completed**: Multilingual practice quiz in Sinhala, Tamil, English, server-side score calculation, Recharts score history chart.
- [x] **Admin Dashboard Completed**: Cross-branch registrations bar chart, trial pass rate donut chart, executive metric cards.
- [x] **Design System & UX**: Cohesive Sithma color palette, responsive design, validation error feedback, and loading skeletons.
- [x] **Granular Git History**: Step-by-step feature commits pushed to GitHub repository.

---

### 🎓 Academic Information
- **Course**: Sri Lanka Institute of Information Technology (SLIIT)
- **Module**: IE2091 Information Systems Project Management (ISPM)
- **Repository**: [sithma-driving-school-management-system](https://github.com/hiru-personal/sithma-driving-school-management-system.git)
