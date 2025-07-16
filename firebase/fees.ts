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
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// Fee Structure operations
type FeeStructure = {
  id: string;
  name: string;
  amount: number;
  type: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const createFeeStructure = async (feeStructure: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'feeStructures'), {
    ...feeStructure,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getFeeStructures = async () => {
  const querySnapshot = await getDocs(
    query(collection(db, 'feeStructures'), orderBy('createdAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Student Fee operations
type StudentFee = {
  id: string;
  studentId: string;
  feeStructureId: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paidAmount: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

export const createStudentFee = async (studentFee: Omit<StudentFee, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'studentFees'), {
    ...studentFee,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getStudentFees = async (studentId: string) => {
  const q = query(
    collection(db, 'studentFees'),
    where('studentId', '==', studentId),
    orderBy('dueDate', 'asc')
  );
  console.log(q)
  const querySnapshot = await getDocs(q);
  console.log("999999999",querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fee Payment operations
type FeePayment = {
  id: string;
  studentId: string;
  studentFeeId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';
  paymentDate: Date;
  transactionId?: string;
  receiptNumber: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
};

export const createFeePayment = async (payment: Omit<FeePayment, 'id' | 'createdAt'>) => {
  // Fetch the related StudentFee to get the subject
  const studentFeeRef = doc(db, 'studentFees', payment.studentFeeId);
  const studentFeeSnap = await getDoc(studentFeeRef);
  let subject = '';
  if (studentFeeSnap.exists()) {
    const feeData = studentFeeSnap.data();
    subject = feeData.subject || feeData.course || '';
  }
  const docRef = await addDoc(collection(db, 'feePayments'), {
    ...payment,
    subject, // Store the subject
    createdAt: Timestamp.now()
  });
  // Update student fee status
  await updateStudentFeeAfterPayment(payment.studentFeeId, payment.amount);
  return docRef.id;
};

export const updateStudentFeeAfterPayment = async (studentFeeId: string, paidAmount: number) => {
  const studentFeeRef = doc(db, 'studentFees', studentFeeId);
  const studentFeeDoc = await getDoc(studentFeeRef);
  if (studentFeeDoc.exists()) {
    const currentData = studentFeeDoc.data();
    const newPaidAmount = (currentData.paidAmount || 0) + paidAmount;
    const remainingAmount = currentData.amount - newPaidAmount;
    let status = 'pending';
    if (remainingAmount <= 0) {
      status = 'paid';
    } else if (newPaidAmount > 0) {
      status = 'partially_paid';
    }
    await updateDoc(studentFeeRef, {
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, remainingAmount),
      status,
      updatedAt: Timestamp.now()
    });
  }
};

export const getFeePayments = async (studentId?: string) => {
  let q = query(collection(db, 'feePayments'), orderBy('paymentDate', 'desc'));
  if (studentId) {
    q = query(collection(db, 'feePayments'),
      where('studentId', '==', studentId),
      orderBy('paymentDate', 'desc')
    );
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}; 