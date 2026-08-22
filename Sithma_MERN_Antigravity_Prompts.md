# Sithma Driving School Management System — Antigravity Build Prompts (MERN)

Built from your Sprint 0 report + System Description Document. The original doc specifies MySQL, but since you're building MERN, these prompts use **MongoDB** instead — everything else (Epics, user stories, business rules) is unchanged.

**How to use this:** Paste each part into Antigravity **one at a time, in order**, and let it finish/verify before moving to the next. Don't paste all 8 at once — each part depends on the previous one existing in the codebase.

---

## Design system to reuse in every prompt

Paste this block once at the very top of Part 0, and Antigravity will carry it forward. Keep referencing "the design system" in later parts so styling stays consistent.

```
DESIGN SYSTEM:
- Primary: #0B5FA5 (trust blue — used for nav, primary buttons, links)
- Primary Dark: #073B68 (hover states, headers)
- Accent: #F2A93B (amber — CTAs like "Book Lesson", highlights, badges)
- Success: #2E9E6B (payment confirmed, exam passed)
- Warning: #E0A32E (pending payment, date approaching)
- Danger: #D64545 (failed exam/trial, overdue)
- Neutral background: #F7F9FB
- Card background: #FFFFFF with soft shadow (0 2px 8px rgba(0,0,0,0.06)), 12px border radius
- Text: #1A2433 (headings), #5A6779 (body/secondary)
- Font: "Inter" or "Plus Jakarta Sans" for UI, weight 600+ for headings
- Style: clean SaaS dashboard look (not a marketing site) — rounded cards, generous whitespace,
  left sidebar navigation for staff/instructor views, top navbar for student view, subtle
  color-coded status pills (e.g. green "Confirmed", amber "Pending", red "Overdue")
- Use lucide-react icons throughout, consistent icon sizing (18-20px)
- Fully responsive: sidebar collapses to bottom/hamburger nav on mobile
```

---

## Part 0 — Project Setup & Architecture

```
Set up a new MERN stack project called "sithma-driving-school" with this structure:

/client — React app (Vite), Tailwind CSS, React Router v6
/server — Node.js + Express REST API
MongoDB Atlas (or local Mongo) as the database, connected via Mongoose

Install and configure:
- Server: express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, multer (for payment slip uploads), express-validator
- Client: react-router-dom, axios, tailwindcss, lucide-react, react-hook-form, date-fns, recharts (for admin dashboard charts), react-hot-toast (notifications)

Create the base folder structure:
server/
  models/
  routes/
  controllers/
  middleware/
  config/db.js
  server.js
client/src/
  pages/
  components/
  layouts/
  context/
  api/
  App.jsx

Set up:
- .env.example files for both client and server (MONGO_URI, JWT_SECRET, PORT, VITE_API_URL)
- CORS configured to allow the client dev server
- A basic Express server that connects to MongoDB and logs success/failure
- Apply the DESIGN SYSTEM above as Tailwind theme extensions (colors, font family) in tailwind.config.js

This is a management system for Sithma Driving School (3 branches: Maharagama, Werahara,
Delgoda; 6 instructors) that digitizes student registration, DMT (Department of Motor
Traffic) milestone tracking, lesson booking, payment verification, and a multilingual
exam-practice quiz. There are three user roles: Student, Data Entry Officer (staff), and
Instructor.

Don't build any features yet — just confirm the project runs (client + server) with a
placeholder "Sithma Driving School" landing page styled with the design system.
```

---

## Part 1 — Database Models & Auth

```
Using the existing sithma-driving-school MERN project, create the Mongoose models and
authentication system.

MODELS (server/models/):

1. User — shared base for Student, Staff (Data Entry Officer), Instructor, Admin
   - name, email, phone, passwordHash, role (enum: student/staff/instructor/admin),
     branch (enum: Maharagama/Werahara/Delgoda — not required for student until registration),
     createdAt

2. Student (references User)
   - studentType (enum: "Type1_NewLearner" / "Type2_TrialReady")
   - branch
   - dmtDates: { medicalExamDate, learnerRegistrationDate, learnerExamDate,
     learnerExamPassed (bool), learnerExamPassedDate }
   - trial: { attempts: [{ date, result: pending/passed/failed }], attemptsUsed (max 3),
     eligibleFromDate (auto-set 3 months after learnerExamPassedDate),
     deadlineDate (auto-set 1.5 years after learnerExamPassedDate), licenseObtained (bool) }
   - heavyVehicleEligible (bool, requires 2+ years on a light vehicle license)
   - package: { type: enum(Car_Full/Car_Refresher/Bike/ThreeWheeler/HeavyVehicle_Bus),
     lessonsTotal, lessonsUsed, priceTotal, bonusLessons: { bike, threeWheeler } }

3. Package (reference pricing table, seed-able)
   - name, vehicleCategory (Light/Heavy), lessons, price, notes
   - Seed data: Car Full (15 lessons, Rs 45,000, +2 bike +2 three-wheeler bonus),
     Car Refresher (6 lessons, Rs 15,000), Bike (Rs 850/lesson, flexible qty),
     Three-Wheeler (Rs 1,000/lesson, flexible qty), Heavy Vehicle Bus (15 lessons, Rs 65,000)

4. Branch — name, address, instructorIds[], dailySessionSlots (default: 3 sessions/day, 1hr each)

5. TimeSlot — branch, date, startTime, instructorId, vehicleCategory, capacity,
   bookedBy (studentId or null), status (available/booked)

6. Booking — studentId, timeSlotId, vehicleType, lessonType (regular/free-weekly-class), status

7. Payment — studentId, slipImageUrl, amount, uploadedAt, verifiedBy (staffId), status
   (pending/confirmed/rejected), verifiedAt

8. Notification — recipientId, recipientRole, message, type (dmt-date/payment/booking),
   read (bool), createdAt

9. QuizQuestion — questionText, options[4], correctAnswerIndex, language (Sinhala/Tamil/English),
   vehicleCategory (Light/Heavy)

10. QuizAttempt — studentId, language, vehicleCategory, answers[], score, totalQuestions, takenAt

AUTH (server/routes/auth.js + controllers/authController.js):
- POST /api/auth/register (student self-registration: choose Type 1 or Type 2, branch,
  package selection)
- POST /api/auth/register-staff (admin-only, creates staff/instructor accounts)
- POST /api/auth/login — returns JWT with role + userId
- Middleware: authenticate (verify JWT), authorize(...roles) (role-based route guards)
- Passwords hashed with bcryptjs

Business rules to encode as Mongoose pre-save hooks or model methods (not just frontend
validation):
- Trial deadline = learnerExamPassedDate + 1.5 years; eligible-from date = +3 months
- Max 3 trial attempts enforced server-side, not just UI
- Heavy Vehicle registration blocked unless heavyVehicleEligible is true
- Type 2 students skip DMT medical/learner tracking entirely (already completed)

Return a short summary of all models and routes created so I can verify before continuing.
```

---

## Part 2 — EPIC-01: Registration, DMT Milestone Tracking & Profile/Package Management

```
Building on the existing sithma-driving-school MERN project (models and auth already exist),
implement EPIC-01 end to end — backend routes + React pages — styled with the DESIGN SYSTEM.

BACKEND (server/routes/students.js + controllers/studentController.js):
- POST /api/students/register — Type 1 or Type 2 registration flow, package selection
- GET /api/students/:id — full profile incl. DMT milestones, trial status, package
- PATCH /api/students/:id/dmt-dates — update medical/registration/exam dates
  (allowed for student themselves OR staff)
- PATCH /api/students/:id/trial — record a trial attempt result (staff only), auto-enforce
  3-attempt max and set licenseObtained on pass
- GET /api/students/:id/heavy-vehicle-eligibility — check 2+ year rule
- GET /api/students (staff/admin only) — list/filter/search all students by branch, type,
  status
- PATCH /api/students/:id/package — assign/change vehicle package

FRONTEND PAGES (client/src/pages/):

1. RegisterPage — multi-step form: choose Type 1 vs Type 2 (with a clear plain-language
   explanation of the difference), pick branch, pick package (show the pricing table from
   the Sprint 0 doc as selectable cards), account details

2. StudentDashboard — for logged-in students:
   - A timeline/stepper component showing DMT milestone progress (Registered → Medical →
     Learner Exam → Trial → Licensed), color-coded (done/pending/overdue) using the design
     system status pills
   - Trial attempts remaining (visual counter, e.g. 3 dots, filled/empty) and the 1.5-year
     deadline countdown
   - Current package card (lessons used/remaining as a progress bar)
   - Heavy Vehicle upgrade eligibility badge if applicable

3. StaffStudentListPage — for staff/admin:
   - Searchable/filterable table (branch, student type, status) of all students
   - Row click opens a detail drawer/modal to update DMT dates and record trial results
   - Use the design system's amber/red pills for "date approaching" / "deadline overdue"

4. PackageManagementPage — staff/admin CRUD for the Package model (pricing table)

Make sure UI enforces & clearly explains the business rules from the doc (max 3 trial
attempts, 1.5-year window, Heavy Vehicle needs 2+ years Light Vehicle license, Type 2
skips DMT tracking). Use empty states, loading states, and toast notifications
(react-hot-toast) for all actions.
```

---

## Part 3 — EPIC-02: Lesson & Time-Slot Management

```
Continuing the same project, implement EPIC-02 — lesson booking and scheduling —
backend + frontend, matching the DESIGN SYSTEM already in use.

BACKEND (server/routes/slots.js, bookings.js):
- GET /api/slots?branch=&date=&vehicleCategory= — available time slots
- POST /api/slots (staff only) — create/adjust slots for a branch (default: 3 sessions/day,
  1 hour each, but staff can add/edit/remove)
- POST /api/bookings — student books a slot for their vehicle type (checks: student has
  remaining lessons in package, slot not already booked, prevents double-booking same
  instructor/time/branch)
- GET /api/bookings/student/:id — student's upcoming + past lessons
- GET /api/bookings/branch/:branchId — staff view of all bookings at a branch
- PATCH /api/bookings/:id/assign-instructor (staff only)
- POST /api/bookings/free-class — book the free weekly theory/practical class (no package
  deduction)
- POST /api/students/:id/additional-lessons — request extra lessons beyond original package

FRONTEND:

1. BookLessonPage (student) — calendar/date picker + branch selector, shows available slots
   as a clean grid of time cards (green = available, grey = full), vehicle type tabs
   (Car/Bike/Three-Wheeler/Bus). Confirm booking in a modal showing remaining lessons in
   package before/after.

2. MyLessonsPage (student) — upcoming lessons list + past lesson history, "Book Free Weekly
   Class" card, "Request Additional Lessons" button

3. SlotManagementPage (staff) — calendar/grid view per branch to add/edit/remove time slots
   and assign instructors to booked sessions; clearly flag any unassigned bookings needing
   an instructor

4. InstructorSchedulePage (instructor) — read-only view of their assigned sessions grouped
   by day, with student name and vehicle type

Enforce no-double-booking at the API level (unique constraint or transaction check on
instructor+time+branch), not just in the UI. Use the design system's amber pill for
"instructor not yet assigned" and green for "confirmed."
```

---

## Part 4 — EPIC-03: Payment Management, Verification & Notifications

```
Continuing the same project, implement EPIC-03 — payment slip upload/verification and
in-app notifications — backend + frontend, styled with the DESIGN SYSTEM.

BACKEND (server/routes/payments.js, notifications.js):
- POST /api/payments/upload (student, multer file upload) — uploads payment slip
  image/scan, creates Payment record with status "pending"
- GET /api/payments/student/:id — student's payment history + current status
- GET /api/payments/pending (staff) — queue of unverified slips
- PATCH /api/payments/:id/verify (staff only) — mark confirmed/rejected, triggers a
  notification to the student
- Notification triggers (server-side, not just frontend toasts) for:
  - Any DMT date set/updated → notify student
  - Payment slip uploaded → notify staff
  - Payment verified → notify student
  - Trial date set/updated → notify student
- GET /api/notifications/:userId — fetch a user's notifications
- PATCH /api/notifications/:id/read — mark as read
- Consider a lightweight polling endpoint (GET /api/notifications/:userId/unread-count)
  since this doesn't need real-time websockets for an academic project — but structure the
  code so Socket.io could be swapped in later.

FRONTEND:

1. UploadPaymentPage (student) — drag-and-drop / file picker for slip image, shows
   package price due, submits and shows "Pending Verification" status card

2. PaymentStatusCard (component, used on student dashboard) — color-coded pill
   (pending=amber, confirmed=green, rejected=red) + amount + date

3. PaymentVerificationQueuePage (staff) — list of pending slips with thumbnail preview,
   approve/reject buttons, links back to the student's booking/package

4. NotificationBell (component, in navbar for all roles) — dropdown showing recent
   notifications, unread count badge, mark-as-read on click. Poll every 30s or on page
   focus.

5. NotificationsPage (full list, filterable by type)

Use the design system's success/warning/danger colors consistently for status. Slip images
should be stored server-side under /server/uploads/slips and served statically (fine for an
academic project — no need for S3).
```

---

## Part 5 — EPIC-04: Multilingual Exam Practice Module

```
Continuing the same project, implement EPIC-04 — the multilingual (Sinhala/Tamil/English)
DMT exam practice quiz — backend + frontend, styled with the DESIGN SYSTEM.

BACKEND (server/routes/quiz.js):
- GET /api/quiz/questions?language=&vehicleCategory= — fetch a randomized set of questions
  (e.g. 20) filtered by language and Light/Heavy vehicle category
- POST /api/quiz/attempt — submit answers, server calculates score (don't trust
  client-calculated scores), saves QuizAttempt
- GET /api/quiz/attempts/student/:id — past attempt history with scores
- POST /api/quiz/questions (staff/admin only) — add/edit question bank entries
  (question text + 4 options + correct answer, per language, per vehicle category)
- Seed script: server/seed/quizSeed.js with ~10 sample questions per language as
  placeholders (Sinhala/Tamil text can be placeholder strings — I'll replace with real
  DMT questions later)

FRONTEND:

1. QuizSetupPage (student) — pick language (Sinhala/Tamil/English toggle) and vehicle
   category (Light/Heavy), "Start Practice" button. Make clear this is informal practice,
   not a scored/official assessment (per the source doc).

2. QuizTakingPage — one question at a time or scrollable list (your choice — pick
   whichever is cleaner), progress indicator ("Question 5 of 20"), submit button at the end

3. QuizResultPage — score out of total, color-coded (green ≥ 80%, amber 50-79%, red < 50%),
   review answers (correct vs. selected), "Try Again" button

4. QuizHistoryPage — student's past attempts as a simple table/chart (use recharts for a
   small score-over-time line chart)

5. QuestionBankManagementPage (staff/admin) — CRUD table for quiz questions, filterable by
   language and vehicle category

Font note: make sure the app's font stack includes fallback fonts that render Sinhala and
Tamil script correctly (e.g. add "Noto Sans Sinhala" and "Noto Sans Tamil" from Google
Fonts as fallbacks in the Tailwind font config) — Inter/Plus Jakarta Sans alone won't
render those scripts.
```

---

## Part 6 — Dashboards, Navigation Shell & Role-Based Layouts

```
Now tie everything together into a cohesive app shell, using the DESIGN SYSTEM.

1. Three distinct layouts (client/src/layouts/):
   - StudentLayout — top navbar (logo, NotificationBell, profile menu), simpler nav since
     students have fewer sections: Dashboard, My Lessons, Payments, Exam Practice, Notifications
   - StaffLayout — left sidebar nav (Students, Slot Management, Payment Verification,
     Question Bank, Reports) + top bar with NotificationBell and branch selector
   - InstructorLayout — minimal: My Schedule, Profile

2. Route protection: wrap routes with the authorize() logic from Part 1 so each role only
   reaches its own pages; redirect unauthenticated users to /login

3. AdminDashboard / staff landing page — summary cards (total students by type, pending
   payments count, upcoming trials this month, bookings today) + a recharts bar chart of
   registrations per branch (Maharagama/Werahara/Delgoda) — this maps to "Better
   decision-making via reports" from the Key Benefits section

4. Global 404 page, loading skeletons (not blank spinners) for all data-fetching pages,
   and a consistent empty-state illustration/message pattern for lists with no data

5. Landing/marketing page (public, pre-login) — brief hero explaining Sithma Driving School,
   the 3 branches, and a "Register" / "Login" CTA, styled distinctly from the dashboard
   (can be slightly more visual/marketing-toned, still using the same color palette)

Make sure mobile responsiveness is solid throughout — sidebar collapses to a bottom nav or
hamburger menu on small screens, tables become stacked cards on mobile.
```

---

## Part 7 — Polish, Testing & Deployment Prep

```
Final pass on the existing sithma-driving-school MERN project:

1. Add form validation everywhere with react-hook-form + clear inline error messages
   (styled with the danger color from the design system)
2. Add a global error boundary and toast-based error handling for failed API calls
3. Add loading/disabled states to every button that triggers an async action
4. Write a README.md covering: project overview, tech stack, folder structure, how to run
   locally (client + server), environment variables needed, and seed script instructions
5. Add a server/seed/seedAll.js script that seeds sample data: 3 branches, 6 instructors,
   the 5 packages, ~15 sample students (mix of Type 1/Type 2, various DMT progress stages),
   some time slots, and quiz questions — so the demo/exhibition has realistic data to show
6. Double check all business rules from the source spec are enforced server-side, not just
   in the UI: max 3 trial attempts, 1.5-year trial deadline, Heavy Vehicle 2-year
   eligibility, no double-booked instructor slots, payments only "confirmed" after explicit
   staff action
7. Prepare for deployment: client on Vercel/Netlify, server on Render, MongoDB on Atlas.
   Add a vercel.json / render.yaml if needed and document the deployment steps in the README

Give me a final checklist of everything implemented against the four Epics and 36 user
stories from the Sprint 0 backlog, flagging anything not yet covered.
```

---

### Notes
- These map directly to your four Epics (EPIC-01 to EPIC-04) and the 36 user stories in your Sprint 0 backlog, so you can screenshot the working features straight into your Sprint 1/2 reports.
- If Antigravity drifts on styling in a later part, just re-paste the "Design system" block at the top of that prompt.
- The doc lists MySQL — I switched the data layer to MongoDB/Mongoose since you said MERN. If your supervisor expects MySQL specifically per the architecture diagram, let me know and I'll redo these as a MEN(MySQL) stack instead (Node/Express/React + MySQL/Sequelize).
