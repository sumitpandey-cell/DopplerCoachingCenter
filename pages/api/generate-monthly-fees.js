import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  });
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const enrollmentsSnap = await db.collection('studentEnrollments').where('status', '==', 'enrolled').get();
    const enrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const feeStructuresSnap = await db.collection('feeStructures').get();
    const feeStructures = feeStructuresSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    let createdCount = 0;
    for (const enrollment of enrollments) {
      const subjectId = enrollment.subjectId;
      const studentId = enrollment.studentId;
      const monthlyFee = feeStructures.find(f => f.type === 'monthly' && f.applicableFor?.includes(subjectId));
      if (!monthlyFee) continue;
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      const feesSnap = await db.collection('studentFees')
        .where('studentId', '==', studentId)
        .where('feeStructureId', '==', monthlyFee.id)
        .where('subjectId', '==', subjectId)
        .where('dueDate', '>=', Timestamp.fromDate(startOfMonth))
        .where('dueDate', '<=', Timestamp.fromDate(endOfMonth))
        .get();
      if (!feesSnap.empty) continue;
      await db.collection('studentFees').add({
        studentId,
        studentName: '',
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
    return res.status(200).json({ message: `Monthly fee generation complete. Created ${createdCount} new StudentFee records.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 