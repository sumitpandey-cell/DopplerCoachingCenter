import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { studentId } = req.query;
  if (!studentId || typeof studentId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid studentId' });
  }
  try {
    const enrollmentsSnap = await adminDb.collection('studentEnrollments')
      .where('studentId', '==', studentId)
      .get();
    const enrollments = await Promise.all(
      enrollmentsSnap.docs.map(async (doc) => {
        const data = doc.data();
        const subjectSnap = await adminDb.collection('subjects').doc(data.subjectId).get();
        return {
          ...data,
          id: doc.id,
          subject: subjectSnap.exists ? { id: subjectSnap.id, ...subjectSnap.data() } : null,
        };
      })
    );
    const totalCredits = enrollments.reduce((sum, e) => sum + (e.credits || 0), 0);
    res.status(200).json({ enrollments, totalCredits });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student enrollments' });
  }
} 