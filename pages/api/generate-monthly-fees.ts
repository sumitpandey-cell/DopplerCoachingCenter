import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

interface StudentData {
  id: string;
  studentId: string;
  subjects?: string[];
  [key: string]: any;
}

interface SubjectData {
  id: string;
  name: string;
  monthlyFeeAmount?: number;
  [key: string]: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all active students
    const studentsSnap = await adminDb.collection('studentAccounts').get();
    const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudentData[];

    // Get all subjects
    const subjectsSnap = await adminDb.collection('subjects').get();
    const subjects = subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubjectData[];

    let generatedCount = 0;
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Generate fees for each student based on their enrolled subjects
    for (const student of students) {
      if (!student.subjects || !Array.isArray(student.subjects)) continue;

      for (const subjectId of student.subjects) {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject || !subject.monthlyFeeAmount) continue;

        // Check if fee already exists for this month by getting all fees for this student
        // and filtering in memory to avoid complex Firestore queries
        const existingFeesSnap = await adminDb.collection('studentFees')
          .where('studentId', '==', student.studentId)
          .where('subjectId', '==', subjectId)
          .get();

        const existingFee = existingFeesSnap.docs.find(doc => {
          const data = doc.data();
          const dueDate = data.dueDate?.toDate?.() || new Date(data.dueDate?._seconds * 1000);
          return dueDate >= nextMonth;
        });

        if (!existingFee) {
          // Create new fee
          await adminDb.collection('studentFees').add({
            studentId: student.studentId,
            subjectId: subjectId,
            feeStructureName: subject.name,
            amount: subject.monthlyFeeAmount,
            originalAmount: subject.monthlyFeeAmount,
            totalAmount: subject.monthlyFeeAmount,
            dueDate: nextMonth,
            status: 'pending',
            paidAmount: 0,
            remainingAmount: subject.monthlyFeeAmount,
            paymentHistory: [],
            remindersSent: 0,
            createdBy: 'system',
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
    
    // Check if it's an index error and provide helpful message
    if (error instanceof Error && error.message.includes('index')) {
      res.status(500).json({ 
        error: 'Database index required. Please create the required Firestore index.',
        details: error.message 
      });
    } else {
      res.status(500).json({ error: 'Failed to generate monthly fees' });
    }
  }
} 