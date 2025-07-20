import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const snap = await adminDb.collection('studentAccounts').get();
    const studentsArray = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.fullName || data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        studentId: data.studentId || '',
        course: data.course || '',
        batch: data.batch || '',
        joinDate: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : data.createdAt || new Date(),
        status: data.status || 'active',
        totalTests: data.totalTests || 0,
        averageScore: data.averageScore || 0,
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
      };
    });
    res.status(200).json(studentsArray);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
} 