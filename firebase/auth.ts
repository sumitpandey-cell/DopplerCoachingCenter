import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from './config';
import { getStudentByStudentId, getFacultyByFacultyId } from './firestore';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'faculty';
  createdAt: Date;
  studentId?: string;
  facultyId?: string;
}

export const signUp = async (
  email: string, 
  password: string, 
  name: string, 
  role: 'student' | 'faculty',
  id?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    name,
    role,
    createdAt: new Date(),
    ...(role === 'student' ? { studentId: id } : { facultyId: id })
  };
  
  await setDoc(doc(db, 'users', user.uid), userProfile);
  return userProfile;
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = () => firebaseSignOut(auth);

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const signInWithStudentId = async (studentId: string, password: string) => {
  // Get student account from Firestore
  const studentAccount = await getStudentByStudentId(studentId);
  
  if (!studentAccount) {
    throw new Error('Student ID not found');
  }
  
  if (!studentAccount.isActive) {
    throw new Error('Student account is inactive');
  }
  
  // Verify password (in production, use proper password hashing)
  if (studentAccount.password !== password) {
    throw new Error('Invalid password');
  }
  
  // Create or sign in with Firebase Auth using email
  try {
    // Try to sign in first
    const userCredential = await signInWithEmailAndPassword(auth, studentAccount.email, password);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      // Create Firebase Auth user if doesn't exist
      const userCredential = await createUserWithEmailAndPassword(auth, studentAccount.email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name: studentAccount.fullName,
        role: 'student',
        createdAt: new Date(),
        studentId: studentAccount.studentId
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      return user;
    }
    throw error;
  }
};

export const signUpWithStudentId = async (studentId: string, password: string) => {
  // Get student account from Firestore
  const studentAccount = await getStudentByStudentId(studentId);
  
  if (!studentAccount) {
    throw new Error('Student ID not found. Please contact admin.');
  }
  
  if (!studentAccount.isActive) {
    throw new Error('Student account is inactive. Please contact admin.');
  }
  
  if (studentAccount.hasSignedUp) {
    throw new Error('Account already exists. Please use the login page.');
  }
  
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, studentAccount.email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name: studentAccount.fullName,
      role: 'student',
      createdAt: new Date(),
      studentId: studentAccount.studentId
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // Mark student account as signed up
    await setDoc(doc(db, 'studentAccounts', studentId), {
      ...studentAccount,
      hasSignedUp: true,
      signedUpAt: new Date()
    }, { merge: true });
    
    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email already in use. Please contact admin.');
    }
    throw error;
  }
};

export const signUpWithFacultyId = async (facultyId: string, password: string) => {
  // Get faculty account from Firestore
  const facultyAccount = await getFacultyByFacultyId(facultyId);
  
  if (!facultyAccount) {
    throw new Error('Faculty ID not found. Please contact admin.');
  }
  
  if (!facultyAccount.isActive) {
    throw new Error('Faculty account is inactive. Please contact admin.');
  }
  
  if (facultyAccount.hasSignedUp) {
    throw new Error('Account already exists. Please use the login page.');
  }
  
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, facultyAccount.email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name: facultyAccount.fullName,
      role: 'faculty',
      createdAt: new Date(),
      facultyId: facultyAccount.facultyId
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // Mark faculty account as signed up
    await setDoc(doc(db, 'facultyAccounts', facultyId), {
      ...facultyAccount,
      hasSignedUp: true,
      signedUpAt: new Date()
    }, { merge: true });
    
    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email already in use. Please contact admin.');
    }
    throw error;
  }
};

export const signInWithFacultyId = async (facultyId: string, password: string) => {
  // Get faculty account from Firestore
  const facultyAccount = await getFacultyByFacultyId(facultyId);
  
  if (!facultyAccount) {
    throw new Error('Faculty ID not found');
  }
  
  if (!facultyAccount.isActive) {
    throw new Error('Faculty account is inactive');
  }
  
  if (!facultyAccount.hasSignedUp) {
    throw new Error('Please sign up first using your Faculty ID');
  }
  
  // Sign in with Firebase Auth using email
  try {
    const userCredential = await signInWithEmailAndPassword(auth, facultyAccount.email, password);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      throw new Error('Invalid password');
    }
    throw error;
  }
};