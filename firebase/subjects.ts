import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
// import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { createStudentFee } from './fees';

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  maxCapacity: number;
  currentEnrollment: number;
  prerequisites: string[]; // Subject IDs
  faculty: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }[];
  isActive: boolean;
  addDropDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
  monthlyFeeAmount?: number; // Added for fee management
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  subjectId: string;
  enrollmentDate: Date;
  status: 'enrolled' | 'dropped' | 'completed';
  grade?: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentAudit {
  id: string;
  studentId: string;
  subjectId: string;
  action: 'enroll' | 'drop' | 'complete';
  timestamp: Date;
  reason?: string;
  performedBy: string;
}

// Subject Management
export const createSubject = async (subject: Omit<Subject, 'id' | 'currentEnrollment' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'subjects'), {
    ...subject,
    currentEnrollment: 0,
    schedule: subject.schedule.map(s => ({
      ...s,
      startTime: s.startTime,
      endTime: s.endTime
    })),
    addDropDeadline: Timestamp.fromDate(subject.addDropDeadline),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getSubjects = async (activeOnly: boolean = true): Promise<Subject[]> => {
  let q = query(collection(db, 'subjects'), orderBy('name', 'asc'));
  
  if (activeOnly) {
    q = query(collection(db, 'subjects'), where('isActive', '==', true), orderBy('name', 'asc'));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      addDropDeadline: data.addDropDeadline?.toDate ? data.addDropDeadline.toDate() : data.addDropDeadline || null,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || null,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || null,
    };
  }) as Subject[];
};

export const getSubjectById = async (subjectId: string): Promise<Subject | null> => {
  const docRef = doc(db, 'subjects', subjectId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      addDropDeadline: data.addDropDeadline.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Subject;
  }
  return null;
};

export const deleteSubject = async (subjectId: string) => {
  await deleteDoc(doc(db, 'subjects', subjectId));
};

// Enrollment Management
export const enrollStudentInSubjects = async (
  studentId: string,
  subjectIds: string[],
  maxEnrollmentLimit: number = 6
): Promise<{ success: boolean; errors: string[]; enrolledSubjects: string[] }> => {
  const errors: string[] = [];
  const enrolledSubjects: string[] = [];

  console.log('Enrolling student:', studentId, subjectIds);

  try {
    const result = await runTransaction(db, async (transaction) => {
      // Check current enrollments
      const currentEnrollmentsQuery = query(
        collection(db, 'studentEnrollments'),
        where('studentId', '==', studentId),
        where('status', '==', 'enrolled')
      );
      const currentEnrollmentsSnap = await getDocs(currentEnrollmentsQuery);
      const currentEnrollments = currentEnrollmentsSnap.docs.map(doc => doc.data());
      
      // Check enrollment limit
      if (currentEnrollments.length + subjectIds.length > maxEnrollmentLimit) {
        errors.push(`Enrollment limit exceeded. Maximum ${maxEnrollmentLimit} subjects allowed.`);
        return { success: false, errors, enrolledSubjects };
      }

      // Validate each subject
      for (const subjectId of subjectIds) {
        // Check if already enrolled
        const existingEnrollment = currentEnrollments.find(e => e.subjectId === subjectId);
        if (existingEnrollment) {
          errors.push(`Already enrolled in subject ${subjectId}`);
          continue;
        }

        // Get subject details
        const subjectRef = doc(db, 'subjects', subjectId);
        const subjectSnap = await transaction.get(subjectRef);
        
        if (!subjectSnap.exists()) {
          errors.push(`Subject ${subjectId} not found`);
          continue;
        }

        const subject = subjectSnap.data() as Subject;

        // Check if subject is active
        if (!subject.isActive) {
          errors.push(`Subject ${subject.name} is not active`);
          continue;
        }

        // Check add/drop deadline
        const now = new Date();
        const deadline = subject.addDropDeadline instanceof Timestamp 
          ? subject.addDropDeadline.toDate() 
          : new Date(subject.addDropDeadline);
        
        if (now > deadline) {
          errors.push(`Add/drop deadline has passed for ${subject.name}`);
          continue;
        }

        // Check capacity
        if (subject.currentEnrollment >= subject.maxCapacity) {
          errors.push(`Subject ${subject.name} is at full capacity`);
          continue;
        }

        // Check prerequisites
        if (subject.prerequisites && subject.prerequisites.length > 0) {
          const completedSubjectsQuery = query(
            collection(db, 'studentEnrollments'),
            where('studentId', '==', studentId),
            where('status', '==', 'completed')
          );
          const completedSubjectsSnap = await getDocs(completedSubjectsQuery);
          const completedSubjectIds = completedSubjectsSnap.docs.map(doc => doc.data().subjectId);
          
          const missingPrereqs = subject.prerequisites.filter(prereq => !completedSubjectIds.includes(prereq));
          if (missingPrereqs.length > 0) {
            errors.push(`Missing prerequisites for ${subject.name}: ${missingPrereqs.join(', ')}`);
            continue;
          }
        }

        // Check schedule conflicts
        const scheduleConflict = await checkScheduleConflict(studentId, subject, currentEnrollments);
        if (scheduleConflict) {
          errors.push(`Schedule conflict with ${subject.name}`);
          continue;
        }

        // Create enrollment
        const enrollmentRef = doc(collection(db, 'studentEnrollments'));
        transaction.set(enrollmentRef, {
          studentId,
          subjectId,
          enrollmentDate: Timestamp.now(),
          status: 'enrolled',
          credits: subject.credits ?? 0, // Ensure credits is always a number
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // Update subject enrollment count
        transaction.update(subjectRef, {
          currentEnrollment: subject.currentEnrollment + 1,
          updatedAt: Timestamp.now()
        });

        // Create audit trail
        const auditRef = doc(collection(db, 'enrollmentAudits'));
        transaction.set(auditRef, {
          studentId,
          subjectId,
          action: 'enroll',
          timestamp: Timestamp.now(),
          performedBy: studentId
        });

        enrolledSubjects.push(subjectId);
      }

      return { 
        success: enrolledSubjects.length > 0, 
        errors, 
        enrolledSubjects 
      };
    });

    console.log('Enrollment result:', result);

    // After transaction, for each successfully enrolled subject, create StudentFee for the current month
    if (result.success && enrolledSubjects.length > 0) {
      const now = new Date();
      for (const subjectId of enrolledSubjects) {
        // Fetch subject details
        const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
        if (!subjectSnap.exists()) continue;
        const subject = subjectSnap.data();
        // Use the subject's monthlyFeeAmount directly
        if (!subject.monthlyFeeAmount) continue; // skip if not set
        try {
          console.log('Creating fee for:', studentId, subjectId, subject.monthlyFeeAmount);
          await createStudentFee({
            studentId,
            studentName: '', // Optionally fetch student name
            feeStructureId: '', // Not used anymore
            feeStructureName: subject.name,
            amount: subject.monthlyFeeAmount,
            originalAmount: subject.monthlyFeeAmount,
            totalAmount: subject.monthlyFeeAmount,
            dueDate: now, // Enrollment date as due date
            status: 'pending',
            paidAmount: 0,
            remainingAmount: subject.monthlyFeeAmount,
            paymentHistory: [],
            remindersSent: 0,
            createdBy: 'system',
            updatedAt: now,
            createdAt: now,
            subjectId,
          });
        } catch (feeError) {
          console.error('Error creating student fee:', feeError);
        }
      }
    }
    return result;
  } catch (error) {
    console.error('Error enrolling student:', error);
    return { success: false, errors: ['Failed to process enrollment'], enrolledSubjects: [] };
  }
};

export const dropSubject = async (
  studentId: string,
  subjectId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    return await runTransaction(db, async (transaction) => {
      // Find enrollment
      const enrollmentsQuery = query(
        collection(db, 'studentEnrollments'),
        where('studentId', '==', studentId),
        where('subjectId', '==', subjectId),
        where('status', '==', 'enrolled')
      );
      const enrollmentsSnap = await getDocs(enrollmentsQuery);
      
      if (enrollmentsSnap.empty) {
        return { success: false, error: 'Enrollment not found' };
      }

      const enrollmentDoc = enrollmentsSnap.docs[0];
      const enrollment = enrollmentDoc.data();

      // Get subject details
      const subjectRef = doc(db, 'subjects', subjectId);
      const subjectSnap = await transaction.get(subjectRef);
      
      if (!subjectSnap.exists()) {
        return { success: false, error: 'Subject not found' };
      }

      const subject = subjectSnap.data() as Subject;

      // Check add/drop deadline
      const now = new Date();
      const deadline = subject.addDropDeadline instanceof Timestamp 
        ? subject.addDropDeadline.toDate() 
        : new Date(subject.addDropDeadline);
      
      if (now > deadline) {
        return { success: false, error: 'Add/drop deadline has passed' };
      }

      // Update enrollment status
      const enrollmentRef = doc(db, 'studentEnrollments', enrollmentDoc.id);
      transaction.update(enrollmentRef, {
        status: 'dropped',
        updatedAt: Timestamp.now()
      });

      // Update subject enrollment count
      transaction.update(subjectRef, {
        currentEnrollment: Math.max(0, subject.currentEnrollment - 1),
        updatedAt: Timestamp.now()
      });

      // Create audit trail
      const auditRef = doc(collection(db, 'enrollmentAudits'));
      transaction.set(auditRef, {
        studentId,
        subjectId,
        action: 'drop',
        timestamp: Timestamp.now(),
        reason,
        performedBy: studentId
      });

      return { success: true };
    });
  } catch (error) {
    console.error('Error dropping subject:', error);
    return { success: false, error: 'Failed to drop subject' };
  }
};

export const getStudentEnrollments = async (studentId: string): Promise<{
  enrollments: (StudentEnrollment & { subject: Subject })[];
  totalCredits: number;
}> => {
  const q = query(
    collection(db, 'studentEnrollments'),
    where('studentId', '==', studentId),
    where('status', '==', 'enrolled'),
    orderBy('enrollmentDate', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const enrollments = [];
  let totalCredits = 0;

  for (const doc of querySnapshot.docs) {
    const enrollmentData = doc.data();
    const subject = await getSubjectById(enrollmentData.subjectId);
    
    if (subject) {
      enrollments.push({
        id: doc.id,
        ...enrollmentData,
        enrollmentDate: enrollmentData.enrollmentDate.toDate(),
        createdAt: enrollmentData.createdAt.toDate(),
        updatedAt: enrollmentData.updatedAt.toDate(),
        subject
      });
      totalCredits += enrollmentData.credits;
    }
  }

  return { enrollments, totalCredits };
};

export const getEnrollmentAudit = async (studentId: string): Promise<EnrollmentAudit[]> => {
  const q = query(
    collection(db, 'enrollmentAudits'),
    where('studentId', '==', studentId),
    orderBy('timestamp', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate()
  })) as EnrollmentAudit[];
};

// Helper function to check schedule conflicts
const checkScheduleConflict = async (
  studentId: string,
  newSubject: Subject,
  currentEnrollments: any[]
): Promise<boolean> => {
  // Get subjects for current enrollments
  const enrolledSubjects = await Promise.all(
    currentEnrollments.map(enrollment => getSubjectById(enrollment.subjectId))
  );

  // Check for time conflicts
  for (const enrolledSubject of enrolledSubjects) {
    if (!enrolledSubject) continue;

    for (const newSchedule of newSubject.schedule) {
      for (const existingSchedule of enrolledSubject.schedule) {
        if (newSchedule.day === existingSchedule.day) {
          const newStart = timeToMinutes(newSchedule.startTime);
          const newEnd = timeToMinutes(newSchedule.endTime);
          const existingStart = timeToMinutes(existingSchedule.startTime);
          const existingEnd = timeToMinutes(existingSchedule.endTime);

          // Check for overlap
          if (newStart < existingEnd && newEnd > existingStart) {
            return true; // Conflict found
          }
        }
      }
    }
  }

  return false; // No conflict
};

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Get available subjects for enrollment (excluding already enrolled)
export const getAvailableSubjects = async (studentId: string): Promise<Subject[]> => {
  const allSubjects = await getSubjects(true);
  const { enrollments } = await getStudentEnrollments(studentId);
  const enrolledSubjectIds = enrollments.map(e => e.subjectId);

  return allSubjects.filter(subject => 
    !enrolledSubjectIds.includes(subject.id) &&
    subject.currentEnrollment < subject.maxCapacity &&
    new Date() <= subject.addDropDeadline
  );
};