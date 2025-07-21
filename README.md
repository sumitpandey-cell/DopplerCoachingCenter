# Doppler Coaching Center Management Platform

A modern, full-stack platform for managing coaching centers, supporting **role-based portals** for Students, Faculty, and Admins. The platform streamlines admissions, subject and batch management, attendance, performance tracking, fee management, material uploads, and more.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
  - [Macro Functionalities](#macro-functionalities)
  - [Micro Functionalities (Role-Specific)](#micro-functionalities-role-specific)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [API Routes](#api-routes)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Future Scope](#future-scope)

---

## Project Overview

**Doppler Coaching Center** is a robust management platform designed for coaching institutes to digitize and automate their operations. It solves the problem of fragmented management by providing a unified portal for students, faculty, and admins, each with tailored access and features.

- **Problem Solved:** Manual, error-prone management of admissions, batches, fees, materials, and performance.
- **Role-based Access:** 
  - **Student:** View schedules, performance, materials, and fees.
  - **Faculty:** Manage batches, upload materials, mark attendance, schedule tests.
  - **Admin:** Oversee all operations, approve admissions, assign faculty, manage finances.

---

## Key Features

### Macro Functionalities

- **Role-based Authentication:** Secure login/signup for Student, Faculty, and Admin (via Firebase Auth or JWT).
- **Dedicated Dashboards:** Custom dashboards for each role.
- **Subject & Batch Management:** Create, assign, and manage subjects and batches.
- **Attendance Tracking:** Faculty can mark and view attendance.
- **Performance Tracking:** Upload and analyze test/exam results.
- **Material Uploads:** Upload/download study materials (PDF, video, etc.).
- **Student Enrollment & Approval:** Admin reviews and approves new admissions.
- **Fees Management:** Assign, track, and collect fees; overdue tracking and reminders.

### Micro Functionalities (Role-Specific)

#### Student
- View timetable, performance reports, and fee status.
- Download study materials.
- Raise doubts/questions to faculty.

#### Faculty
- Upload materials and mark attendance.
- Schedule and manage tests.
- View batch-wise performance and student interactions.

#### Admin
- Approve/reject student admissions.
- Assign faculty to batches/subjects.
- Track all payments and overdue fees.
- Create/manage subjects and assign to batches.

---

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS, ShadCN UI, Lucide Icons, Redux Toolkit (if used)
- **Backend:** Node.js + Express.js or Firebase (Firestore, Auth, Storage)
- **Database:** MongoDB (with Prisma/Mongoose) or Firebase Firestore
- **Authentication:** Firebase Auth or JWT
- **File Uploads:** Firebase Storage or Multer
- **State Management:** Redux Toolkit, React Context API
- **Other:** Recharts (charts), React Hook Form, Zod, Date-fns, Sonner (toasts)

---

## Folder Structure

```bash
/DopplerCoachingCenter
├── app/
│   ├── admin/
│   │   ├── analytics/
│   │   ├── announcements/
│   │   ├── dashboard/
│   │   ├── enquiries/
│   │   ├── faculty/
│   │   ├── faculty-enquiries/
│   │   ├── fees/
│   │   ├── finance/
│   │   ├── materials/
│   │   ├── settings/
│   │   ├── students/
│   │   ├── subjects/
│   │   ├── tests/
│   │   └── timetables/
│   ├── faculty/
│   │   ├── dashboard/
│   │   ├── enter-scores/
│   │   ├── post-announcements/
│   │   ├── schedule-tests/
│   │   ├── students/
│   │   └── upload-materials/
│   ├── student/
│   │   ├── announcements/
│   │   ├── dashboard/
│   │   ├── fees/
│   │   ├── materials/
│   │   ├── performance/
│   │   ├── profile/
│   │   ├── subjects/
│   │   ├── tests/
│   │   └── timetable/
│   ├── inquiry/
│   ├── join/
│   ├── login/
│   ├── signup/
│   ├── store.ts
│   └── providers.tsx
├── components/
│   ├── fees/
│   ├── subjects/
│   ├── ui/
│   └── (other shared components)
├── contexts/
├── firebase/
├── hooks/
├── lib/
├── pages/
│   └── api/
├── scripts/
├── public/
├── tailwind.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/DopplerCoachingCenter.git
   cd DopplerCoachingCenter
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env.local` and fill in your Firebase or backend credentials.

4. **Firebase Setup (if used):**
   - Create a Firebase project.
   - Enable Authentication, Firestore, and Storage.
   - Add your Firebase config to `firebase/config.ts`.

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## API Routes

If using Next.js API routes or Express.js backend, main endpoints may include:

| Endpoint                       | Method | Description                        | Access         |
|---------------------------------|--------|------------------------------------|----------------|
| `/api/login`                   | POST   | Login (role-based)                 | Public         |
| `/api/signup`                  | POST   | Signup (role-based)                | Public         |
| `/api/students`                | GET    | List all students                  | Admin, Faculty |
| `/api/students`                | POST   | Add new student                    | Admin          |
| `/api/faculty`                 | GET    | List all faculty                   | Admin          |
| `/api/subjects`                | GET    | List all subjects                  | Admin, Faculty |
| `/api/subjects`                | POST   | Create subject                     | Admin          |
| `/api/fees`                    | GET    | Get fee details                    | Admin, Student |
| `/api/fees/pay`                | POST   | Pay fees                           | Student        |
| `/api/materials`               | GET    | List/download materials            | All roles      |
| `/api/materials/upload`        | POST   | Upload material                    | Faculty, Admin |
| `/api/attendance`              | POST   | Mark attendance                    | Faculty        |
| `/api/performance`             | POST   | Upload test scores                 | Faculty        |
| `/api/performance`             | GET    | View performance                   | Student, Admin |
| `/api/announcements`           | GET    | List announcements                 | All roles      |
| `/api/announcements`           | POST   | Post announcement                  | Faculty, Admin |

- **Protected routes**: Most routes require authentication and role-based authorization.

---

## Screenshots

> _Add screenshots of the Student, Faculty, and Admin dashboards here for better context._

---

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request.

---

## License

[MIT](LICENSE)

---

## Future Scope

- **Notifications:** In-app and email notifications for events, reminders, and updates.
- **Parent Access:** Portal for parents to track student progress and fees.
- **AI-based Performance Prediction:** Analytics and suggestions for student improvement.
- **Mobile App:** React Native or Flutter app for on-the-go access.
- **Multi-branch Support:** Manage multiple coaching branches from a single admin panel.
- **Payment Gateway Integrations:** More options (Stripe, PayPal, etc.).
- **Advanced Analytics:** Deeper insights for admin and faculty.

---

_This project is actively maintained and open to contributions!_
