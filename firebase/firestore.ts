import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

export interface StudyMaterial {
  id?: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: Date;
  subject: string;
}

export interface TestResult {
  id?: string;
  studentId: string;
  studentName: string;
  testName: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  testDate: Date;
  enteredBy: string;
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface TimetableEntry {
  id?: string;
  subject: string;
  time: string;
  day: string;
  faculty: string;
  room: string;
}

export interface StudentInquiry {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  address: string;
  previousSchool: string;
  interestedCourses: string;
  preferredBatch: string;
  message: string;
  submittedAt: Date;
  status: 'pending' | 'contacted' | 'admitted' | 'rejected';
}

export interface StudentEnquiry {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  subjects: string[];
  submittedAt: Date;
  status: 'pending' | 'id_generated' | 'contacted' | 'rejected';
  studentId?: string;
}

export interface StudentAccount {
  studentId: string;
  email: string;
  fullName: string;
  phone: string;
  courses: string[];
  batches?: string[];
  password: string;
  role: 'student';
  createdAt: Date;
  enquiryId: string;
  isActive: boolean;
  hasSignedUp: boolean;
  signedUpAt?: Date;
  subjects: string[]; // Add subjects field
}

export interface FacultyEnquiry {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  subjects: string;
  previousInstitution: string;
  notes: string;
  submittedAt: Date;
  status: 'pending' | 'id_generated' | 'approved' | 'rejected';
  facultyId?: string;
}

export interface FacultyAccount {
  facultyId: string;
  email: string;
  fullName: string;
  phone: string;
  qualification: string;
  subjects: string[];
  role: 'faculty';
  createdAt: Date;
  enquiryId: string;
  isActive: boolean;
  hasSignedUp: boolean;
  signedUpAt?: Date;
}

export interface Notification {
  id?: string;
  studentId: string;
  title: string;
  description: string;
  createdAt: Date;
  isRead: boolean;
  type: string;
}

// Study Materials
export const addStudyMaterial = async (material: Omit<StudyMaterial, 'id'>) => {
  const docRef = await addDoc(collection(db, 'studyMaterials'), {
    ...material,
    uploadedAt: Timestamp.fromDate(material.uploadedAt)
  });
  return docRef.id;
};

export const getStudyMaterials = async (): Promise<StudyMaterial[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'studyMaterials'), orderBy('uploadedAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    uploadedAt: doc.data().uploadedAt.toDate()
  })) as StudyMaterial[];
};

export const updateStudyMaterial = async (materialId: string, updates: Partial<StudyMaterial>) => {
  const docRef = doc(db, 'studyMaterials', materialId);
  await updateDoc(docRef, {
    ...updates,
    uploadedAt: updates.uploadedAt ? Timestamp.fromDate(updates.uploadedAt) : undefined
  });
};

export const deleteStudyMaterial = async (materialId: string) => {
  const docRef = doc(db, 'studyMaterials', materialId);
  await deleteDoc(docRef);
};

// Test Results
export const addTestResult = async (result: Omit<TestResult, 'id'>) => {
  const docRef = await addDoc(collection(db, 'testResults'), {
    ...result,
    testDate: Timestamp.fromDate(result.testDate)
  });
  return docRef.id;
};

export const getTestResultsByStudent = async (studentId: string): Promise<TestResult[]> => {
  const q = query(
    collection(db, 'testResults'), 
    where('studentId', '==', studentId),
    orderBy('testDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    testDate: doc.data().testDate.toDate()
  })) as TestResult[];
};

export const getAllTestResults = async (): Promise<TestResult[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'testResults'), orderBy('testDate', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    testDate: doc.data().testDate.toDate()
  })) as TestResult[];
};

// Announcements
export const addAnnouncement = async (announcement: Omit<Announcement, 'id'>) => {
  const docRef = await addDoc(collection(db, 'announcements'), {
    ...announcement,
    createdAt: Timestamp.fromDate(announcement.createdAt)
  });
  return docRef.id;
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as Announcement[];
};

// Timetable
export const getTimetable = async (): Promise<TimetableEntry[]> => {
  const querySnapshot = await getDocs(collection(db, 'timetable'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TimetableEntry[];
};

export const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id'>) => {
  const docRef = await addDoc(collection(db, 'timetable'), entry);
  return docRef.id;
};

// Student Inquiries
export const addInquiry = async (inquiry: Omit<StudentInquiry, 'id'>) => {
  const docRef = await addDoc(collection(db, 'inquiries'), {
    ...inquiry,
    submittedAt: Timestamp.fromDate(inquiry.submittedAt)
  });
  return docRef.id;
};

export const getInquiries = async (): Promise<StudentInquiry[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'inquiries'), orderBy('submittedAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: doc.data().submittedAt.toDate()
  })) as StudentInquiry[];
};

// Student Enquiries (New Join Form)
export const addStudentEnquiry = async (enquiry: Omit<StudentEnquiry, 'id'>) => {
  const docRef = await addDoc(collection(db, 'studentEnquiries'), {
    ...enquiry,
    submittedAt: Timestamp.fromDate(enquiry.submittedAt)
  });
  return docRef.id;
};

export const getStudentEnquiries = async (): Promise<StudentEnquiry[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'studentEnquiries'), orderBy('submittedAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    subjects: Array.isArray(doc.data().subjects) ? doc.data().subjects : [],
    submittedAt: doc.data().submittedAt.toDate()
  })) as StudentEnquiry[];
};

export const updateEnquiryStatus = async (
  enquiryId: string, 
  status: StudentEnquiry['status'], 
  studentId?: string
) => {
  const docRef = doc(db, 'studentEnquiries', enquiryId);
  const updateData: any = { status };
  if (studentId) {
    updateData.studentId = studentId;
  }
  await updateDoc(docRef, updateData);
};

export const generateStudentAccount = async (accountData: Omit<StudentAccount, 'createdAt' | 'isActive'>) => {
  // Convert subject names to IDs
  let subjectIds: string[] = [];
  if (Array.isArray(accountData.subjects) && accountData.subjects.length > 0) {
    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    const nameToIdMap = new Map();
    subjectsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.name) nameToIdMap.set(data.name, doc.id);
    });
    subjectIds = accountData.subjects.map(name => nameToIdMap.get(name) || name); // fallback to name if not found
  }
  const docRef = doc(db, 'studentAccounts', accountData.studentId);
  await setDoc(docRef, {
    ...accountData,
    createdAt: Timestamp.fromDate(new Date()),
    isActive: true,
    hasSignedUp: false,
    subjects: subjectIds,
  });
  return accountData.studentId;
};

export const getStudentByStudentId = async (studentId: string): Promise<StudentAccount | null> => {
  const docRef = doc(db, 'studentAccounts', studentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    // Backward compatibility: convert single course/batch to arrays if needed
    let courses: string[] = [];
    let batches: string[] = [];
    if (Array.isArray(data.courses)) {
      courses = data.courses;
    } else if (typeof data.course === 'string') {
      courses = [data.course];
    }
    if (Array.isArray(data.batches)) {
      batches = data.batches;
    } else if (typeof data.batch === 'string') {
      batches = [data.batch];
    }
    return {
      ...data,
      courses,
      batches,
      subjects: Array.isArray(data.subjects) ? data.subjects : [], // Always return subjects array
      createdAt: data.createdAt.toDate()
    } as StudentAccount;
  }
  return null;
};

// Get students by faculty's assigned subjects
export const getStudentsByFacultySubjects = async (facultySubjects: string[]): Promise<StudentAccount[]> => {
  if (!facultySubjects || facultySubjects.length === 0) {
    return [];
  }

  const students: StudentAccount[] = [];
  
  // Query students for each subject the faculty teaches
  for (const subject of facultySubjects) {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'studentAccounts'),
        where('subjects', 'array-contains', subject),
        where('isActive', '==', true)
      )
    );
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Backward compatibility: convert single course/batch to arrays if needed
      let courses: string[] = [];
      let batches: string[] = [];
      if (Array.isArray(data.courses)) {
        courses = data.courses;
      } else if (typeof data.course === 'string') {
        courses = [data.course];
      }
      if (Array.isArray(data.batches)) {
        batches = data.batches;
      } else if (typeof data.batch === 'string') {
        batches = [data.batch];
      }
      
      const student = {
        ...data,
        courses,
        batches,
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
        createdAt: data.createdAt.toDate(),
        signedUpAt: data.signedUpAt ? data.signedUpAt.toDate() : undefined
      } as StudentAccount;
      
      // Avoid duplicates
      if (!students.find(s => s.studentId === student.studentId)) {
        students.push(student);
      }
    });
  }
  
  return students;
};

// Faculty Enquiries
export const addFacultyEnquiry = async (enquiry: Omit<FacultyEnquiry, 'id'>) => {
  const docRef = await addDoc(collection(db, 'facultyEnquiries'), {
    ...enquiry,
    submittedAt: Timestamp.fromDate(enquiry.submittedAt)
  });
  return docRef.id;
};

export const getFacultyEnquiries = async (): Promise<FacultyEnquiry[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'facultyEnquiries'), orderBy('submittedAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: doc.data().submittedAt.toDate()
  })) as FacultyEnquiry[];
};

export const updateFacultyEnquiryStatus = async (
  enquiryId: string, 
  status: FacultyEnquiry['status'], 
  facultyId?: string
) => {
  const docRef = doc(db, 'facultyEnquiries', enquiryId);
  const updateData: any = { status };
  if (facultyId) {
    updateData.facultyId = facultyId;
  }
  await updateDoc(docRef, updateData);
};

export const generateFacultyAccount = async (accountData: Omit<FacultyAccount, 'createdAt' | 'isActive' | 'hasSignedUp'>) => {
  const docRef = doc(db, 'facultyAccounts', accountData.facultyId);
  await setDoc(docRef, {
    ...accountData,
    createdAt: Timestamp.fromDate(new Date()),
    isActive: true,
    hasSignedUp: false
  });
  return accountData.facultyId;
};

export const getFacultyByFacultyId = async (facultyId: string): Promise<FacultyAccount | null> => {
  const docRef = doc(db, 'facultyAccounts', facultyId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      signedUpAt: data.signedUpAt ? data.signedUpAt.toDate() : undefined
    } as FacultyAccount;
  }
  return null;
};

// Get faculty profile by user UID (for authenticated faculty)
export const getFacultyProfileByUID = async (uid: string): Promise<FacultyAccount | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.role === 'faculty' && userData.facultyId) {
      return await getFacultyByFacultyId(userData.facultyId);
    }
  }
  return null;
};

export const getAllTests = async () => {
  const querySnapshot = await getDocs(
    query(collection(db, 'tests'), orderBy('scheduledDate', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), scheduledDate: doc.data().scheduledDate?.toDate?.() || doc.data().scheduledDate }));
};

export const addTest = async (test: any) => {
  const docRef = await addDoc(collection(db, 'tests'), {
    ...test,
    scheduledDate: Timestamp.fromDate(new Date(test.scheduledDate)),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateTest = async (testId: string, updates: any) => {
  const docRef = doc(db, 'tests', testId);
  await updateDoc(docRef, {
    ...updates,
    ...(updates.scheduledDate ? { scheduledDate: Timestamp.fromDate(new Date(updates.scheduledDate)) } : {}),
    updatedAt: Timestamp.now(),
  });
};

export const deleteTest = async (testId: string) => {
  const docRef = doc(db, 'tests', testId);
  await deleteDoc(docRef);
};

export const addStudent = async (student: StudentAccount) => {
  const docRef = doc(db, 'studentAccounts', student.studentId);
  await setDoc(docRef, {
    ...student,
    createdAt: Timestamp.fromDate(new Date()),
    isActive: true,
    hasSignedUp: false,
  });
  return student.studentId;
};

export const updateStudent = async (studentId: string, updates: Partial<StudentAccount>) => {
  const docRef = doc(db, 'studentAccounts', studentId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteStudent = async (studentId: string) => {
  const docRef = doc(db, 'studentAccounts', studentId);
  await updateDoc(docRef, { isActive: false, status: 'inactive', updatedAt: Timestamp.now() });
};

export const restoreStudent = async (studentId: string) => {
  const docRef = doc(db, 'studentAccounts', studentId);
  await updateDoc(docRef, { isActive: true, updatedAt: Timestamp.now() });
};

export const activateStudent = async (studentId: string) => {
  const docRef = doc(db, 'studentAccounts', studentId);
  await updateDoc(docRef, { 
    isActive: true, 
    status: 'active', 
    updatedAt: Timestamp.now() 
  });
};

// Subject Management
export interface Subject {
  id?: string;
  name: string;
}

export const getSubjects = async (): Promise<Subject[]> => {
  const querySnapshot = await getDocs(collection(db, 'subjects'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[];
};

export const addSubject = async (name: string) => {
  const docRef = await addDoc(collection(db, 'subjects'), { name });
  return docRef.id;
};

export const updateSubject = async (id: string, name: string) => {
  const docRef = doc(db, 'subjects', id);
  await updateDoc(docRef, { name });
};

export const deleteSubject = async (id: string) => {
  const docRef = doc(db, 'subjects', id);
  await deleteDoc(docRef);
};

// Update student profile in both users and studentAccounts collections
export const updateStudentProfile = async (
  uid: string,
  studentId: string,
  updates: { name: string; phone?: string }
) => {
  // Update in users collection
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    name: updates.name,
    ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
    updatedAt: Timestamp.now(),
  });
  // Update in studentAccounts collection
  if (studentId) {
    const studentRef = doc(db, 'studentAccounts', studentId);
    await updateDoc(studentRef, {
      fullName: updates.name,
      ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
      updatedAt: Timestamp.now(),
    });
  }
};

export const addNotification = async (notification: Omit<Notification, 'id'>) => {
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...notification,
    createdAt: Timestamp.fromDate(notification.createdAt),
  });
  return docRef.id;
};

export const getNotificationsByStudent = async (studentId: string): Promise<Notification[]> => {
  const querySnapshot = await getDocs(
    query(
      collection(db, 'notifications'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    )
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Notification[];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const docRef = doc(db, 'notifications', notificationId);
  await updateDoc(docRef, { isRead: true });
};

// Update/Announcement/Test Model
export interface FacultyUpdate {
  id?: string;
  title: string;
  content: string;
  subjectId: string;
  facultyId: string;
  type: 'announcement' | 'result' | 'test' | string;
  createdAt: Date;
  notifyAllFacultyStudents?: boolean;
}

// Add a new update/announcement/test
export const addFacultyUpdate = async (update: Omit<FacultyUpdate, 'id' | 'createdAt'> & { createdAt?: Date }) => {
  const docRef = await addDoc(collection(db, 'facultyUpdates'), {
    ...update,
    createdAt: update.createdAt ? Timestamp.fromDate(update.createdAt) : Timestamp.now(),
    notifyAllFacultyStudents: !!update.notifyAllFacultyStudents,
  });
  return docRef.id;
};

// Fetch updates for a student based on subject and faculty association
export const getUpdatesForStudent = async (studentId: string): Promise<FacultyUpdate[]> => {
  // 1. Get student account
  const student = await getStudentByStudentId(studentId);
  if (!student) return [];
  const studentSubjects = student.subjects || [];

  // 2. Get all facultyIds for student's subjects
  // (Assume you have a way to get faculty for a subject, e.g., subject-faculty mapping)
  // For now, let's fetch all facultyIds from all subjects the student is enrolled in
  // (You may want to optimize this based on your schema)
  const facultyIdsSet = new Set<string>();
  for (const subject of studentSubjects) {
    // Assume you have a function getFacultyIdsBySubject(subjectId)
    // For now, let's fetch all faculty accounts and filter
    const facultyQuery = await getDocs(collection(db, 'facultyAccounts'));
    facultyQuery.docs.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.subjects) && data.subjects.includes(subject)) {
        facultyIdsSet.add(data.facultyId);
      }
    });
  }
  const facultyIds = Array.from(facultyIdsSet);

  // 3. Fetch all updates by these faculty
  const updatesQuery = await getDocs(collection(db, 'facultyUpdates'));
  const updates: FacultyUpdate[] = [];
  updatesQuery.docs.forEach(doc => {
    const data = doc.data();
    const update: FacultyUpdate = {
      id: doc.id,
      title: data.title || '',
      content: data.content || '',
      subjectId: data.subjectId || '',
      facultyId: data.facultyId || '',
      type: data.type || 'announcement',
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      notifyAllFacultyStudents: !!data.notifyAllFacultyStudents,
    };
    // Visibility logic
    if (
      studentSubjects.includes(update.subjectId) ||
      update.notifyAllFacultyStudents ||
      (facultyIds.includes(update.facultyId) && !studentSubjects.includes(update.subjectId))
    ) {
      updates.push(update);
    }
  });
  // Sort by date desc
  updates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return updates;
};