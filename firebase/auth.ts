import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from './config';
import { getStudentByStudentId } from './firestore';

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