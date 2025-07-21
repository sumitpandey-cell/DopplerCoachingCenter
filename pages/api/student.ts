import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { studentId } = req.query;
  if (!studentId || typeof studentId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid studentId' });
  }
  try {
    // Fetch student profile
    const studentSnap = await adminDb.collection('studentAccounts').where('studentId', '==', studentId).get();
    if (studentSnap.empty) return res.status(404).json({ error: 'Student not found' });
    const student: any = { id: studentSnap.docs[0].id, ...studentSnap.docs[0].data() };

    // Fetch related data
    const [testResultsSnap, announcementsSnap, feesSnap, enrollmentsSnap] = await Promise.all([
      adminDb.collection('testResults').where('studentId', '==', studentId).get(),
      adminDb.collection('announcements').where('studentId', '==', studentId).get(),
      adminDb.collection('studentFees').where('studentId', '==', studentId).get(),
      adminDb.collection('studentEnrollments').where('studentId', '==', studentId).get(),
    ]);

    student.testResults = testResultsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    student.announcements = announcementsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    student.fees = feesSnap.docs.map(d => ({ ...d.data(), id: d.id }));

    const enrollments = await Promise.all(
      enrollmentsSnap.docs.map(async (doc) => {
        const data = doc.data();
        if (!data.subjectId) return { ...data, id: doc.id, subject: null };
        const subjectSnap = await adminDb.collection('subjects').doc(data.subjectId).get();
        return {
          ...data,
          id: doc.id,
          subject: subjectSnap.exists ? { id: subjectSnap.id, ...subjectSnap.data() } : null,
        };
      })
    );
    student.enrollments = enrollments;

    // Fetch timetable based on enrolled subjects
    const enrolledSubjectIds = student.enrollments.map((e: any) => e.subjectId).filter(Boolean);

    if (enrolledSubjectIds.length > 0) {
      const timetableSnap = await adminDb.collection('timetables').where('subjectId', 'in', enrolledSubjectIds).get();
      student.timetable = timetableSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    } else {
      student.timetable = [];
    }

    res.status(200).json(student);
  } catch (error: any) {
    console.error('Failed to fetch student data:', error);
    res.status(500).json({ error: 'Failed to fetch student data', details: error.message });
  }
} 