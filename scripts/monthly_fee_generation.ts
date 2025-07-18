import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string),
  });
}
const db = getFirestore();

async function generateMonthlyFees() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Get all active student enrollments
  const enrollmentsSnap = await db.collection('studentEnrollments').where('status', '==', 'enrolled').get();
  const enrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // 2. Get all fee structures
  const feeStructuresSnap = await db.collection('feeStructures').get();
  const feeStructures = feeStructuresSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let createdCount = 0;

  for (const enrollment of enrollments) {
    const subjectId = enrollment.subjectId;
    const studentId = enrollment.studentId;
    // Find the monthly fee structure for this subject
    const monthlyFee = feeStructures.find(f => f.type === 'monthly' && f.applicableFor?.includes(subjectId));
    if (!monthlyFee) continue;

    // Check if a StudentFee for this student/subject/month already exists
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const feesSnap = await db.collection('studentFees')
      .where('studentId', '==', studentId)
      .where('feeStructureId', '==', monthlyFee.id)
      .where('subjectId', '==', subjectId)
      .where('dueDate', '>=', Timestamp.fromDate(startOfMonth))
      .where('dueDate', '<=', Timestamp.fromDate(endOfMonth))
      .get();
    if (!feesSnap.empty) continue; // Already exists

    // Create StudentFee for this month
    await db.collection('studentFees').add({
      studentId,
      studentName: '', // Optionally fetch student name
      feeStructureId: monthlyFee.id,
      feeStructureName: monthlyFee.name,
      amount: monthlyFee.amount,
      originalAmount: monthlyFee.amount,
      totalAmount: monthlyFee.amount,
      dueDate: Timestamp.fromDate(startOfMonth),
      status: 'pending',
      paidAmount: 0,
      remainingAmount: monthlyFee.amount,
      paymentHistory: [],
      remindersSent: 0,
      createdBy: 'system',
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      subjectId,
    });
    createdCount++;
  }
  console.log(`Monthly fee generation complete. Created ${createdCount} new StudentFee records.`);
}

generateMonthlyFees().catch(console.error); 