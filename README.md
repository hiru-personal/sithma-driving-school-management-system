# 🚗 Sithma Driving School Management System

> **A Complete Full-Stack MERN Driving School Operations, Scheduling & DMT Learner Management Platform**  
> Developed for **Sithma Driving School** (Maharagama, Werahara, and Delgoda branches) as part of the **SLIIT IE2091 Software Project Management (ISPM)** module.

---

## 🌟 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Highlights & Business Rules Matrix](#-key-highlights--business-rules-matrix)
3. [Implemented Epics & Core Modules](#-implemented-epics--core-modules)
4. [Design Aesthetics: Dark Liquid Glass & WebGL](#-design-aesthetics)
5. [Complete Page Sitemap](#-complete-page-sitemap)
6. [System Architecture & Technology Stack](#-system-architecture--technology-stack)
7. [Demo User Accounts](#-demo-user-accounts)
8. [Getting Started & Local Setup](#-getting-started--local-setup)
9. [Master Database Seeder](#-master-database-seeder)
10. [REST API Catalog](#-rest-api-catalog)
11. [Deployment Configurations](#-deployment-configurations)

---

## 📋 Project Overview

Sithma Driving School is an accredited multi-branch driving academy operating across **Maharagama**, **Werahara**, and **Delgoda** in Sri Lanka. This web platform digitizes the entire student lifecycle—from online learner self-registration, package selection, and lesson booking to bank slip payment verification, Department of Motor Traffic (DMT) milestone tracking, and a multilingual written exam simulator.

---

## ⚖️ Key Highlights & Business Rules Matrix

| Rule / Constraint | Domain / Module | Implementation Details |
| :--- | :--- | :--- |
| **3-Month Trial Rule** | DMT Milestones | Practical driving test cannot be scheduled earlier than **3 full months** after passing the DMT written learner examination. |
| **1.5-Year Trial Deadline** | DMT Milestones | Students must complete their practical trial within **18 months (1.5 years)** of passing the written test before the permit lapses. |
| **3-Attempt Maximum** | DMT Practical Trial | Maximum **3 trial attempts** permitted. If all 3 attempts fail, the system enforces re-registration. |
| **2-Year Light Vehicle Rule** | Heavy Vehicle (Bus) | Applicants for the Heavy Vehicle / Bus package must hold a valid Light Vehicle license for **at least 2 full years**. |
| **2+2 Bonus Lessons Bundle** | Course Packages | Enrolling in the **Car Full Package** automatically grants **2 free Bike** and **2 free Three-Wheeler** practical sessions. |
| **Double-Booking Prevention** | Scheduling Engine | Compound database check prevents assigning an instructor or student to overlapping branch slots. |
| **Branch Daily Sessions** | Branch Time Slots | Each branch operates **3 daily 1-hour sessions** (08:30–09:30, 10:00–11:00, 14:00–15:00) with 6 certified instructors. |
| **Multilingual Practice Exam** | DMT Exam Practice | Practice quiz available in **Sinhala (සිංහල)**, **Tamil (தமிழ்)**, and **English** with an 80% passing benchmark. |

---

## 🚀 Implemented Epics & Core Modules

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
- **In-App Notification Center**: High-visibility liquid glass notification bell with unread counters & in-app alerts.

### 🟣 EPIC-04: Multilingual Practice Quiz & Analytics
- **Multilingual Exam Module**: 3-language selector (English, Sinhala, Tamil) and Light/Heavy vehicle categories.
- **Interactive Quiz Stepper**: Real-time progress bar, 4 multiple-choice options, and server-side scoring engine.
- **Results & Score Review**: Color-coded score cards (≥80% Pass, 50-79% Needs Practice, <50% Failed) with question-by-question explanations.
- **Recharts Performance Chart**: Score progression over time line chart.
- **Staff Question Bank Manager**: CRUD for adding, filtering, and deleting questions per language.

### 📊 Executive Admin Dashboard & Business Intelligence Reports
- **Executive Admin Dashboard**: Real-time KPI summary cards, branch registration bar charts, and live activity streams.
- **Reports & Analytics Page (`/staff/reports`)**: Complete revenue breakdown, DMT milestone conversion funnel, trial success rate statistics, and one-click CSV export and print summary.

---

## 🎨 Design Aesthetics: Dark Liquid Glass & WebGL

- **Dark Veil WebGL Background**: Animated WebGL CPPN shader canvas running continuously behind the application using `ogl`.
- **Floating Liquid Glass Navbar**: Frosted glass capsule with top specular light highlight, glowing brand logo, and active glowing navigation pills.
- **Dark Glassmorphism**: Frosted translucent dark surfaces (`bg-slate-900/65 backdrop-blur-2xl border border-white/10 text-slate-100`) with luminous status badges and neon accents.

---

## 🗺️ Complete Page Sitemap

| Page Route | Description | User Access |
| :--- | :--- | :--- |
| `/` | Public Landing Page with Branch & Package showcase | Public |
| `/register` | 4-Step Student Self-Registration Wizard | Public |
| `/login` | User Portal Authentication & Role Switcher | Public |
| `/student/dashboard` | Student Dashboard & DMT Milestone Stepper | Student |
| `/student/profile` | Student Digital ID & Printable Learner Pass | Student |
| `/student/lessons/book` | Interactive Session Booking Grid | Student |
| `/student/lessons` | My Booked Lessons & Free Weekly Class Booking | Student |
| `/student/payments/upload` | Bank Deposit Slip Upload & Verification History | Student |
| `/student/quiz` | Multilingual Practice Exam Setup | Student |
| `/student/quiz/take` | Interactive Practice Quiz Session | Student |
| `/student/quiz/result` | Quiz Score Card & Detailed Answer Explanations | Student |
| `/student/quiz/history` | Score Progression History & Recharts Line Graph | Student |
| `/staff/students` | Staff Student Directory & DMT Management Drawer | Staff / Admin |
| `/staff/slots` | Branch Slot Scheduling & Instructor Dispatch | Staff / Admin |
| `/staff/packages` | Course Package Catalog & Pricing Management | Staff / Admin |
| `/staff/quiz` | Trilingual Question Bank Management | Staff / Admin |
| `/staff/payments` | Bank Payment Slip Verification Queue | Staff / Admin |
| `/staff/reports` | Business Intelligence & Regulatory Reports | Staff / Admin |
| `/admin/dashboard` | Executive Management Dashboard | Admin Only |
| `/instructor/schedule` | Instructor Daily Assigned Sessions | Instructor / Staff |
| `/notifications` | Filterable In-App Notifications Center | All Roles |

---

## 👥 Demo User Accounts

| Role | Email Address | Password | Enrolled / Assigned Branch |
| :--- | :--- | :--- | :--- |
| **Student** | `student.kasun@gmail.com` | `password123` | Maharagama Branch (Type 1, Car Full) |
| **Staff (Data Entry)** | `staff.maharagama@sithma.lk` | `password123` | Maharagama Branch |
| **Instructor** | `instructor.sunil@sithma.lk` | `password123` | Maharagama Branch |
| **Administrator** | `admin@sithma.lk` | `admin123` | All Branches (Executive Access) |

---

## 💻 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Installation & Running

```bash
# 1. Install Backend Dependencies
npm install

# 2. Install Frontend Dependencies
npm install --prefix client

# 3. Seed Database with Realistic Data
node server/seed/seedAll.js

# 4. Start the Express Backend Server (Port 5001)
node server.js

# 5. Start the Vite Frontend Client (Port 5173)
npm run dev --prefix client
```

Open **`http://localhost:5173`** in your browser.

---

## 🗄️ Master Database Seeder

Run the comprehensive master seeder to populate realistic demonstration data:
```bash
node server/seed/seedAll.js
```
This script seeds:
- 3 Operating Branches (Maharagama, Werahara, Delgoda)
- 5 Standard Course Packages (with the +2 bike and +2 three-wheeler bonus rule)
- 6 Certified Instructors
- Staff and Admin accounts
- 15+ Students across various DMT progress stages
- 25+ Daily Session Slots
- Verified and Pending Bank Payment Records
- 30+ Multilingual Exam Questions in Sinhala, Tamil, and English

---

## ☁️ Deployment Configurations

- **Client**: Pre-configured for deployment on **Vercel** (`vercel.json`).
- **Server**: Pre-configured for deployment on **Render** (`render.yaml`).
