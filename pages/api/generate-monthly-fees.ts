import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all active students
    const studentsSnap = await adminDb.collection('studentAccounts').get();
    const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get all subjects
    const subjectsSnap = await adminDb.collection('subjects').get();
    const subjects = subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let generatedCount = 0;
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Generate fees for each student based on their enrolled subjects
    for (const student of students) {
      if (!student.subjects || !Array.isArray(student.subjects)) continue;

      for (const subjectId of student.subjects) {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject || !subject.monthlyFeeAmount) continue;

        // Check if fee already exists for this month
        const existingFeeSnap = await adminDb.collection('studentFees')
          .where('studentId', '==', student.studentId)
          .where('subjectId', '==', subjectId)
          .where('dueDate', '>=', nextMonth)
          .get();

        if (existingFeeSnap.empty) {
          // Create new fee
          await adminDb.collection('studentFees').add({
            studentId: student.studentId,
            subjectId: subjectId,
            subject: subject.name, // For legacy compatibility
            amount: subject.monthlyFeeAmount,
            dueDate: nextMonth,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          });
          generatedCount++;
        }
      }
    }

    res.status(200).json({ 
      message: `Successfully generated ${generatedCount} monthly fees`,
      generatedCount 
    });
  } catch (error) {
    console.error('Error generating monthly fees:', error);
    res.status(500).json({ error: 'Failed to generate monthly fees' });
  }
} 