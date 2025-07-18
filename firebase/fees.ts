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
  limit,
  startAfter,
  DocumentSnapshot,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';

// Enhanced Fee Structure with more fields
export type FeeStructure = {
  id: string;
  name: string;
  amount: number;
  type: 'monthly' | 'quarterly' | 'yearly' | 'one-time' | 'admission' | 'exam' | 'lab' | 'library' | 'transport' | 'hostel';
  description: string;
  isActive: boolean;
  category: 'tuition' | 'non-tuition' | 'miscellaneous';
  applicableFor: string[]; // courses/batches this fee applies to
  dueDay?: number; // day of month when due (for recurring fees)
  lateFeeAmount?: number; // late fee penalty
  lateFeeGracePeriod?: number; // grace period in days
  discountEligible: boolean;
  taxable: boolean;
  taxRate?: number; // tax percentage
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
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

// Enhanced Student Fee with more comprehensive tracking
export type StudentFee = {
  id: string;
  studentId: string;
  studentName: string;
  feeStructureId: string;
  feeStructureName: string;
  amount: number;
  originalAmount: number; // before any discounts
  discountAmount?: number;
  discountReason?: string;
  taxAmount?: number;
  lateFeeAmount?: number;
  totalAmount: number; // final amount after discounts/taxes/late fees
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid' | 'cancelled' | 'waived';
  paidAmount: number;
  remainingAmount: number;
  paymentHistory: string[]; // array of payment IDs
  remindersSent: number;
  lastReminderDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
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

// Enhanced Fee Payment with comprehensive tracking
export type FeePayment = {
  id: string;
  studentId: string;
  studentName: string;
  studentFeeId: string;
  feeStructureName: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque' | 'online' | 'dd' | 'neft' | 'rtgs';
  paymentDate: Date;
  transactionId?: string;
  receiptNumber: string;
  bankReference?: string;
  chequeNumber?: string;
  chequeDate?: Date;
  bankName?: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'refunded';
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
  notes?: string;
  attachments?: string[]; // file URLs for receipts, cheque images, etc.
  createdBy: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
};

// Discount and Scholarship types
export type FeeDiscount = {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  eligibilityCriteria: string;
  maxUsage?: number;
  currentUsage: number;
  validFrom: Date;
  validTo?: Date;
  applicableFor: string[]; // fee structure IDs
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
};

export type StudentDiscount = {
  id: string;
  studentId: string;
  discountId: string;
  discountName: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  appliedAmount: number;
  appliedDate: Date;
  reason: string;
  approvedBy: string;
  isActive: boolean;
};

// Fee Reminder types
export type FeeReminder = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  feeId: string;
  feeName: string;
  amount: number;
  dueDate: Date;
  reminderType: 'email' | 'sms' | 'whatsapp' | 'call';
  reminderDate: Date;
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  template: string;
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

// ============= ENHANCED FEE MANAGEMENT FUNCTIONS =============

// Advanced Fee Structure Management
export const updateFeeStructure = async (id: string, updates: Partial<FeeStructure>) => {
  const docRef = doc(db, 'feeStructures', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteFeeStructure = async (id: string) => {
  await deleteDoc(doc(db, 'feeStructures', id));
};

export const getFeeStructureById = async (id: string): Promise<FeeStructure | null> => {
  const docRef = doc(db, 'feeStructures', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as FeeStructure;
  }
  return null;
};

// Bulk Fee Assignment with Enhanced Logic
export const bulkAssignFees = async (
  studentIds: string[],
  feeStructureId: string,
  dueDate: Date,
  createdBy: string,
  options?: {
    applyDiscount?: boolean;
    discountId?: string;
    customAmount?: number;
    notes?: string;
  }
) => {
  const batch = writeBatch(db);
  const feeStructure = await getFeeStructureById(feeStructureId);
  
  if (!feeStructure) {
    throw new Error('Fee structure not found');
  }

  const assignments = [];
  
  for (const studentId of studentIds) {
    // Get student details
    const studentDoc = await getDoc(doc(db, 'studentAccounts', studentId));
    if (!studentDoc.exists()) continue;
    
    const studentData = studentDoc.data();
    let finalAmount = options?.customAmount || feeStructure.amount;
    let discountAmount = 0;
    let taxAmount = 0;

    // Apply discount if specified
    if (options?.applyDiscount && options?.discountId) {
      const discount = await getDiscountById(options.discountId);
      if (discount) {
        discountAmount = discount.type === 'percentage' 
          ? (finalAmount * discount.value) / 100 
          : discount.value;
        finalAmount -= discountAmount;
      }
    }

    // Calculate tax if applicable
    if (feeStructure.taxable && feeStructure.taxRate) {
      taxAmount = (finalAmount * feeStructure.taxRate) / 100;
      finalAmount += taxAmount;
    }

    const studentFee: Omit<StudentFee, 'id'> = {
      studentId,
      studentName: studentData.fullName,
      feeStructureId,
      feeStructureName: feeStructure.name,
      amount: finalAmount,
      originalAmount: feeStructure.amount,
      discountAmount,
      taxAmount,
      totalAmount: finalAmount,
      dueDate,
      status: 'pending',
      paidAmount: 0,
      remainingAmount: finalAmount,
      paymentHistory: [],
      remindersSent: 0,
      notes: options?.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    const docRef = doc(collection(db, 'studentFees'));
    batch.set(docRef, {
      ...studentFee,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      dueDate: Timestamp.fromDate(dueDate)
    });

    assignments.push({ studentId, amount: finalAmount });
  }

  await batch.commit();
  return assignments;
};

// Advanced Payment Processing
export const processPayment = async (
  paymentData: Omit<FeePayment, 'id' | 'createdAt' | 'receiptNumber'>,
  generateReceipt = true
) => {
  const receiptNumber = await generateReceiptNumber();
  
  const payment: Omit<FeePayment, 'id'> = {
    ...paymentData,
    receiptNumber,
    status: 'completed',
    createdAt: new Date()
  };

  const docRef = await addDoc(collection(db, 'feePayments'), {
    ...payment,
    createdAt: Timestamp.now(),
    paymentDate: Timestamp.fromDate(payment.paymentDate)
  });

  // Update student fee
  await updateStudentFeeAfterPayment(paymentData.studentFeeId, paymentData.amount);
  
  // Add payment to history
  await addPaymentToHistory(paymentData.studentFeeId, docRef.id);

  return { id: docRef.id, ...payment };
};

// Payment History Management
export const addPaymentToHistory = async (studentFeeId: string, paymentId: string) => {
  const studentFeeRef = doc(db, 'studentFees', studentFeeId);
  const studentFeeDoc = await getDoc(studentFeeRef);
  
  if (studentFeeDoc.exists()) {
    const currentData = studentFeeDoc.data();
    const paymentHistory = currentData.paymentHistory || [];
    paymentHistory.push(paymentId);
    
    await updateDoc(studentFeeRef, {
      paymentHistory,
      updatedAt: Timestamp.now()
    });
  }
};

// Receipt Number Generation
export const generateReceiptNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Get the last receipt number for this month
  const q = query(
    collection(db, 'feePayments'),
    where('receiptNumber', '>=', `RCP${year}${month}000001`),
    where('receiptNumber', '<=', `RCP${year}${month}999999`),
    orderBy('receiptNumber', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  let nextNumber = 1;
  
  if (!querySnapshot.empty) {
    const lastReceipt = querySnapshot.docs[0].data().receiptNumber;
    const lastNumber = parseInt(lastReceipt.slice(-6));
    nextNumber = lastNumber + 1;
  }
  
  return `RCP${year}${month}${String(nextNumber).padStart(6, '0')}`;
};

// Discount Management
export const createDiscount = async (discount: Omit<FeeDiscount, 'id' | 'createdAt' | 'currentUsage'>) => {
  const docRef = await addDoc(collection(db, 'feeDiscounts'), {
    ...discount,
    currentUsage: 0,
    createdAt: Timestamp.now(),
    validFrom: Timestamp.fromDate(discount.validFrom),
    validTo: discount.validTo ? Timestamp.fromDate(discount.validTo) : null
  });
  return docRef.id;
};

export const getDiscounts = async () => {
  const querySnapshot = await getDocs(
    query(collection(db, 'feeDiscounts'), orderBy('createdAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDiscountById = async (id: string): Promise<FeeDiscount | null> => {
  const docRef = doc(db, 'feeDiscounts', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as FeeDiscount;
  }
  return null;
};

export const applyDiscountToStudent = async (
  studentId: string,
  discountId: string,
  reason: string,
  approvedBy: string
) => {
  const discount = await getDiscountById(discountId);
  if (!discount) {
    throw new Error('Discount not found');
  }

  if (discount.maxUsage && discount.currentUsage >= discount.maxUsage) {
    throw new Error('Discount usage limit exceeded');
  }

  const studentDiscount: Omit<StudentDiscount, 'id'> = {
    studentId,
    discountId,
    discountName: discount.name,
    discountValue: discount.value,
    discountType: discount.type,
    appliedAmount: 0, // Will be calculated when applied to specific fees
    appliedDate: new Date(),
    reason,
    approvedBy,
    isActive: true
  };

  const docRef = await addDoc(collection(db, 'studentDiscounts'), {
    ...studentDiscount,
    appliedDate: Timestamp.now()
  });

  // Update discount usage
  await updateDoc(doc(db, 'feeDiscounts', discountId), {
    currentUsage: discount.currentUsage + 1
  });

  return docRef.id;
};

// Fee Reminder System
export const createFeeReminder = async (reminder: Omit<FeeReminder, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'feeReminders'), {
    ...reminder,
    createdAt: Timestamp.now(),
    reminderDate: Timestamp.fromDate(reminder.reminderDate),
    dueDate: Timestamp.fromDate(reminder.dueDate)
  });
  return docRef.id;
};

export const getOverdueFees = async (): Promise<StudentFee[]> => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const q = query(
    collection(db, 'studentFees'),
    where('status', 'in', ['pending', 'partially_paid']),
    where('dueDate', '<', Timestamp.fromDate(today))
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentFee));
};

export const sendFeeReminders = async (overdueFeesIds: string[], reminderType: 'email' | 'sms' | 'whatsapp') => {
  const batch = writeBatch(db);
  const reminders = [];

  for (const feeId of overdueFeesIds) {
    const feeDoc = await getDoc(doc(db, 'studentFees', feeId));
    if (!feeDoc.exists()) continue;

    const feeData = feeDoc.data() as StudentFee;
    
    // Get student details
    const studentDoc = await getDoc(doc(db, 'studentAccounts', feeData.studentId));
    if (!studentDoc.exists()) continue;
    
    const studentData = studentDoc.data();

    const reminder: Omit<FeeReminder, 'id'> = {
      studentId: feeData.studentId,
      studentName: feeData.studentName,
      studentEmail: studentData.email,
      studentPhone: studentData.phone,
      feeId,
      feeName: feeData.feeStructureName,
      amount: feeData.remainingAmount,
      dueDate: feeData.dueDate instanceof Date ? feeData.dueDate : feeData.dueDate.toDate(),
      reminderType,
      reminderDate: new Date(),
      status: 'sent',
      template: `fee_reminder_${reminderType}`,
      createdAt: new Date()
    };

    const reminderRef = doc(collection(db, 'feeReminders'));
    batch.set(reminderRef, {
      ...reminder,
      createdAt: Timestamp.now(),
      reminderDate: Timestamp.now(),
      dueDate: feeData.dueDate
    });

    // Update fee reminder count
    const feeRef = doc(db, 'studentFees', feeId);
    batch.update(feeRef, {
      remindersSent: (feeData.remindersSent || 0) + 1,
      lastReminderDate: Timestamp.now()
    });

    reminders.push(reminder);
  }

  await batch.commit();
  return reminders;
};

// Advanced Analytics and Reporting
export const getFeeAnalytics = async (dateRange?: { from: Date; to: Date }) => {
  let paymentsQuery = query(collection(db, 'feePayments'), orderBy('paymentDate', 'desc'));
  
  if (dateRange) {
    paymentsQuery = query(
      collection(db, 'feePayments'),
      where('paymentDate', '>=', Timestamp.fromDate(dateRange.from)),
      where('paymentDate', '<=', Timestamp.fromDate(dateRange.to)),
      orderBy('paymentDate', 'desc')
    );
  }

  const [paymentsSnapshot, feesSnapshot, overdueSnapshot] = await Promise.all([
    getDocs(paymentsQuery),
    getDocs(collection(db, 'studentFees')),
    getDocs(query(
      collection(db, 'studentFees'),
      where('status', 'in', ['pending', 'partially_paid', 'overdue'])
    ))
  ]);

  const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const fees = feesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const overdueFees = overdueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Calculate analytics
  const totalCollected = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalDue = fees.reduce((sum, fee) => sum + (fee.remainingAmount || 0), 0);
  const totalOverdue = overdueFees.reduce((sum, fee) => sum + (fee.remainingAmount || 0), 0);

  // Payment method breakdown
  const paymentMethodBreakdown = payments.reduce((acc, payment) => {
    acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  // Monthly collection trend
  const monthlyTrend = payments.reduce((acc, payment) => {
    const date = payment.paymentDate instanceof Date ? payment.paymentDate : payment.paymentDate.toDate();
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalCollected,
    totalDue,
    totalOverdue,
    collectionRate: totalDue > 0 ? ((totalCollected / (totalCollected + totalDue)) * 100) : 0,
    paymentMethodBreakdown,
    monthlyTrend,
    totalStudentsWithDues: overdueFees.length,
    averagePaymentAmount: payments.length > 0 ? totalCollected / payments.length : 0
  };
};

// Real-time Fee Updates
export const subscribeToStudentFees = (
  studentId: string,
  callback: (fees: StudentFee[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'studentFees'),
    where('studentId', '==', studentId),
    orderBy('dueDate', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const fees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentFee));
    callback(fees);
  });
};

export const subscribeToFeePayments = (
  studentId: string,
  callback: (payments: FeePayment[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'feePayments'),
    where('studentId', '==', studentId),
    orderBy('paymentDate', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeePayment));
    callback(payments);
  });
};

// Fee Installment Management
export const createInstallmentPlan = async (
  studentFeeId: string,
  installments: { amount: number; dueDate: Date }[],
  createdBy: string
) => {
  const batch = writeBatch(db);
  const installmentIds = [];

  for (let i = 0; i < installments.length; i++) {
    const installment = installments[i];
    const installmentRef = doc(collection(db, 'feeInstallments'));
    
    batch.set(installmentRef, {
      studentFeeId,
      installmentNumber: i + 1,
      amount: installment.amount,
      dueDate: Timestamp.fromDate(installment.dueDate),
      status: 'pending',
      paidAmount: 0,
      createdAt: Timestamp.now(),
      createdBy
    });

    installmentIds.push(installmentRef.id);
  }

  // Update the main fee to indicate it has installments
  const feeRef = doc(db, 'studentFees', studentFeeId);
  batch.update(feeRef, {
    hasInstallments: true,
    installmentIds,
    updatedAt: Timestamp.now()
  });

  await batch.commit();
  return installmentIds;
}; 