import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize default values
    let studentsCount = 0;
    let facultyCount = 0;
    let monthlyRevenue = 0;
    let pendingInquiries = 0;

    try {
      // Students count (all)
      const studentsCountSnap = await adminDb.collection('studentAccounts').count().get();
      studentsCount = studentsCountSnap.data().count;
      console.log('Students count:', studentsCount);
    } catch (error) {
      console.log('studentAccounts collection not found or empty:', error);
    }

    let activeStudents = 0;
    try {
      // Active students count (status == 'active')
      const activeStudentsSnap = await adminDb.collection('studentAccounts').where('isActive', '==', true).count().get();
      activeStudents = activeStudentsSnap.data().count;
      console.log('Active students count:', activeStudents);
    } catch (error) {
      console.log('active studentAccounts collection not found or empty:', error);
    }

    try {
      // Faculty count
      const facultyCountSnap = await adminDb.collection('facultyAccounts').count().get();
      facultyCount = facultyCountSnap.data().count;
      console.log('Faculty count:', facultyCount);
    } catch (error) {
      console.log('facultyAccounts collection not found or empty:', error);
    }

    try {
      // Revenue (sum of all payments for this month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const paymentsSnap = await adminDb.collection('feePayments')
        .where('paymentDate', '>=', startOfMonth)
        .where('paymentDate', '<', endOfMonth)
        .get();
      monthlyRevenue = paymentsSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      console.log('Monthly revenue:', monthlyRevenue);
    } catch (error) {
      console.log('feePayments collection not found or empty:', error);
    }

    try {
      // Pending inquiries count
      const pendingInquiriesSnap = await adminDb.collection('inquiries').where('status', '==', 'pending').count().get();
      pendingInquiries = pendingInquiriesSnap.data().count;
      console.log('Pending inquiries:', pendingInquiries);
    } catch (error) {
      console.log('inquiries collection not found or empty:', error);
    }

    res.status(200).json({
      students: studentsCount,
      activeStudents: activeStudents, // Now only active students
      faculty: facultyCount,
      revenue: monthlyRevenue,
      pendingInquiries
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 