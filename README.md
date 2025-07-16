# DopplerCoachingCenter

A modern, full-featured coaching center management platform built with Next.js, React, Firebase, and TailwindCSS. It provides dedicated portals for Admins, Faculty, and Students, supporting features like scheduling, announcements, materials, performance tracking, and a comprehensive fees management system.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Authentication](#authentication)
- [Fees Management System](#fees-management-system)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Role-based Portals:** Separate dashboards and features for Admin, Faculty, and Students.
- **Scheduling & Timetables:** Manage and view class/test schedules.
- **Announcements:** Post and receive announcements.
- **Materials Management:** Upload and access study materials.
- **Performance Tracking:** Enter and visualize student scores.
- **Enquiries:** Handle and track student/faculty enquiries.
- **Finance Management:** (Admin) Manage financial records.
- **Modern UI:** Built with reusable, accessible components and TailwindCSS.
- **Comprehensive Fees Management System:** (see below)

---

## Tech Stack

- **Frontend:** Next.js 13, React 18, TypeScript
- **Styling:** TailwindCSS, Radix UI, Shadcn UI, Lucide Icons
- **State Management:** React Context API, Custom Hooks
- **Backend/Database:** Firebase (Auth, Firestore, Storage)
- **Charts:** Recharts
- **Form Handling:** React Hook Form, Zod (validation)
- **Other:** Date-fns, Embla Carousel, Sonner (toasts), Vaul (UI)

---

## Project Structure

```
DopplerCoachingCenter/
│
├── app/
│   ├── admin/
│   │   ├── fees/                  # Fees management (overview, structure, payments, reports, student)
│   │   └── ...
│   ├── student/
│   │   ├── fees/                 # Student fee dashboard, payments, receipt
│   │   └── ...
│   └── ...
├── components/
│   ├── fees/                     # Fee management components (forms, tables, receipt, bulk assignment)
│   └── ...
├── firebase/                     # Firebase integration (auth, firestore, storage, fees)
├── lib/
│   ├── payment-gateway.ts        # Payment gateway abstraction (Razorpay, Stripe, etc.)
│   └── ...
└── ...
```

---

## Setup & Installation

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

3. **Configure Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Set up Authentication, Firestore, and Storage.
   - Copy your Firebase config to `firebase/config.ts` (see the file for structure).

4. **Environment Variables:**
   - Add any required environment variables (e.g., Firebase keys) in a `.env.local` file.

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Usage

- **Admin Portal:** `/admin/dashboard`
- **Faculty Portal:** `/faculty/dashboard`
- **Student Portal:** `/student/dashboard`
- **Login/Signup:** `/login/[role]`, `/signup/[role]`
- **Other Features:** Accessible via sidebars/navigation in each portal.

---

## Authentication

- Uses Firebase Authentication for secure login/signup.
- Role-based access is enforced via context and route protection.
- Admin, Faculty, and Student have separate login/signup flows.

---

## Fees Management System

A robust, extensible system for managing all aspects of student fees:

- **Fee Structure Management:** Define and manage various fee types (monthly, admission, exam, etc.).
- **Bulk Fee Assignment:** Assign fees to multiple students at once using an intuitive admin UI and Firestore batch writes.
- **Payment Tracking:** Track all student payments, payment methods, and statuses (pending, paid, overdue, partially paid).
- **Receipt Generation:** Generate and print/download receipts for each payment (PDF/print support).
- **Reporting & Analytics:** Visualize collections, dues, and payment trends with interactive charts (Recharts).
- **Payment Reminders:** Automated email reminders for overdue fees (via Firebase Cloud Functions and email service).
- **Payment Gateway Integration:** Easily switch between gateways (Razorpay, Stripe, etc.) for online payments using a flexible abstraction layer.
- **Admin & Student Views:** Dedicated pages for admins to manage all fees and for students to view/pay their own fees and receipts.

---

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request.

---

## License

[MIT](LICENSE) (or specify your license here)

---

### Notes

- For deployment, the app uses Next.js static export (`output: 'export'` in `next.config.js`).
- Images are unoptimized by default (`images: { unoptimized: true }`).
- ESLint is configured to ignore errors during build.
