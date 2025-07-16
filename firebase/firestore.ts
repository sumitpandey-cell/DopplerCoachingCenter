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
  const docRef = doc(db, 'studentAccounts', accountData.studentId);
  await setDoc(docRef, {
    ...accountData,
    createdAt: Timestamp.fromDate(new Date()),
    isActive: true,
    hasSignedUp: false
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

export const getAllTests = async () => {
  const querySnapshot = await getDocs(
    query(collection(db, 'tests'), orderBy('scheduledDate', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), scheduledDate: doc.data().scheduledDate?.toDate?.() || doc.data().scheduledDate }));
};

export const addTest = async (test) => {
  const docRef = await addDoc(collection(db, 'tests'), {
    ...test,
    scheduledDate: Timestamp.fromDate(new Date(test.scheduledDate)),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateTest = async (testId, updates) => {
  const docRef = doc(db, 'tests', testId);
  await updateDoc(docRef, {
    ...updates,
    ...(updates.scheduledDate ? { scheduledDate: Timestamp.fromDate(new Date(updates.scheduledDate)) } : {}),
    updatedAt: Timestamp.now(),
  });
};

export const deleteTest = async (testId) => {
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
  await updateDoc(docRef, { isActive: false, updatedAt: Timestamp.now() });
};

export const restoreStudent = async (studentId: string) => {
  const docRef = doc(db, 'studentAccounts', studentId);
  await updateDoc(docRef, { isActive: true, updatedAt: Timestamp.now() });
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