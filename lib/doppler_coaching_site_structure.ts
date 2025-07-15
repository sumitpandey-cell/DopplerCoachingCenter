// 📁 doppler/

// 🗂️ app/
app/
├── layout.tsx                        // Global layout
├── page.tsx                          // Landing/Home page
│
├── login/
│   ├── student/page.tsx              // Student login page
│   └── faculty/page.tsx              // Faculty login page
│
├── signup/
│   ├── student/page.tsx              // Student signup page
│   └── faculty/page.tsx              // Faculty signup page
│
├── student/
│   ├── dashboard/page.tsx            // Student dashboard
│   ├── performance/page.tsx          // Performance board
│   ├── materials/page.tsx            // Study materials
│   ├── timetable/page.tsx            // Timetable
│   ├── announcements/page.tsx        // Notices & announcements
│   └── tests/[id]/page.tsx           // Individual test result
│
├── faculty/
│   ├── dashboard/page.tsx            // Faculty dashboard
│   ├── students/page.tsx             // View students
│   ├── upload-materials/page.tsx     // Upload study materials
│   ├── schedule-tests/page.tsx       // Schedule a test
│   ├── post-announcements/page.tsx   // Create announcement
│   └── enter-scores/page.tsx         // Enter test scores
│
├── api/
│   └── auth/
│       ├── student.ts                // Firebase login/signup logic
│       └── faculty.ts


// 🧩 components/
components/
├── Navbar.tsx
├── Footer.tsx
├── AuthForm.tsx                      // Shared login/signup form
├── StudentSidebar.tsx
├── FacultySidebar.tsx
├── PerformanceChart.tsx             // Chart.js or Recharts
├── FileUpload.tsx                   // Upload PDFs/files


// 🔥 firebase/
firebase/
├── config.ts                         // Firebase config/init
├── auth.ts                           // Firebase auth utils
├── firestore.ts                      // Firestore read/write helpers
├── storage.ts                        // Firebase Storage helpers


// ⚙️ lib/
lib/
└── utils.ts                          // Helper functions


// 🌐 public/
public/
└── logo.png


// 🎨 styles/
styles/
└── globals.css


// ⚙️ config & env
.env.local                            // Firebase API keys
postcss.config.js
package.json
tailwind.config.js
tsconfig.json
