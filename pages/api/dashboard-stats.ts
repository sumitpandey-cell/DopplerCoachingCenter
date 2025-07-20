import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Students count (all)
    const studentsCountSnap = await adminDb.collection('studentAccounts').count().get();
    const studentsCount = studentsCountSnap.data().count;
    // Active students count (if you want only active, uncomment below and comment above)
    // const activeStudentsCountSnap = await adminDb.collection('studentAccounts').where('isActive', '==', true).count().get();
    // const studentsCount = activeStudentsCountSnap.data().count;

    // Faculty count
    const facultyCountSnap = await adminDb.collection('facultyAccounts').count().get();
    const facultyCount = facultyCountSnap.data().count;

    // Revenue (sum of all payments for this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const paymentsSnap = await adminDb.collection('feePayments')
      .where('paymentDate', '>=', startOfMonth)
      .where('paymentDate', '<', endOfMonth)
      .get();
    const monthlyRevenue = paymentsSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

    // Pending inquiries count
    const pendingInquiriesSnap = await adminDb.collection('inquiries').where('status', '==', 'pending').count().get();
    const pendingInquiries = pendingInquiriesSnap.data().count;

    res.status(200).json({
      students: studentsCount,
      activeStudents: studentsCount, // For now, same as studentsCount
      faculty: facultyCount,
      revenue: monthlyRevenue,
      pendingInquiries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
} 