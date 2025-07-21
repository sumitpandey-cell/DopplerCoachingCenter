// Redux optimizations and selectors
import { createSelector } from 'reselect';
import type { RootState } from '@/app/store';

// Memoized selectors to prevent unnecessary re-renders
export const selectStudents = (state: RootState) => state.students.data;
export const selectStudentsStatus = (state: RootState) => state.students.status;
export const selectStudentsError = (state: RootState) => state.students.error;

export const selectSubjects = (state: RootState) => state.subjects.data;
export const selectSubjectsStatus = (state: RootState) => state.subjects.status;

export const selectFees = (state: RootState) => state.fees.data;
export const selectFeesStatus = (state: RootState) => state.fees.status;

export const selectMaterials = (state: RootState) => state.materials.data;
export const selectMaterialsStatus = (state: RootState) => state.materials.status;

export const selectAnnouncements = (state: RootState) => state.announcements.data;
export const selectAnnouncementsStatus = (state: RootState) => state.announcements.status;

export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectDashboardStatus = (state: RootState) => state.dashboard.status;

// Complex selectors with memoization
export const selectActiveStudents = createSelector(
  [selectStudents],
  (students) => students.filter(student => student.status === 'active')
);

export const selectStudentsBySubject = createSelector(
  [selectStudents, (state: RootState, subjectId: string) => subjectId],
  (students, subjectId) => 
    students.filter(student => 
      Array.isArray(student.subjects) && student.subjects.includes(subjectId)
    )
);

export const selectSubjectsByActive = createSelector(
  [selectSubjects],
  (subjects) => subjects.filter(subject => subject.isActive !== false)
);

export const selectPendingFees = createSelector(
  [selectFees],
  (fees) => fees.filter(fee => fee.status === 'pending')
);

export const selectOverdueFees = createSelector(
  [selectFees],
  (fees) => fees.filter(fee => {
    const dueDate = new Date(fee.dueDate);
    return dueDate < new Date() && fee.status !== 'paid';
  })
);

export const selectFeeAnalytics = createSelector(
  [selectFees],
  (fees) => {
    const totalAmount = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const paidAmount = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const pendingAmount = fees.reduce((sum, fee) => sum + (fee.remainingAmount || 0), 0);
    
    return {
      total: totalAmount,
      paid: paidAmount,
      pending: pendingAmount,
      collectionRate: totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0,
    };
  }
);

export const selectMaterialsBySubject = createSelector(
  [selectMaterials, (state: RootState, subjectId: string) => subjectId],
  (materials, subjectId) => 
    materials.filter(material => material.subject === subjectId)
);

export const selectRecentAnnouncements = createSelector(
  [selectAnnouncements],
  (announcements) => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return announcements
      .filter(announcement => new Date(announcement.createdAt) > threeDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

export const selectHighPriorityAnnouncements = createSelector(
  [selectAnnouncements],
  (announcements) => 
    announcements.filter(announcement => announcement.priority === 'high')
);

export const selectDashboardSummary = createSelector(
  [selectActiveStudents, selectSubjectsByActive, selectPendingFees, selectRecentAnnouncements],
  (activeStudents, activeSubjects, pendingFees, recentAnnouncements) => ({
    activeStudentsCount: activeStudents.length,
    activeSubjectsCount: activeSubjects.length,
    pendingFeesCount: pendingFees.length,
    recentAnnouncementsCount: recentAnnouncements.length,
    pendingFeesAmount: pendingFees.reduce((sum, fee) => sum + (fee.remainingAmount || 0), 0),
  })
);

// Student-specific selectors
export const selectStudentData = createSelector(
  [
    (state: RootState) => state.student.data,
    (state: RootState) => state.student.status,
    (state: RootState) => state.student.error,
  ],
  (data, status, error) => ({ data, status, error })
);

export const selectStudentTestResults = createSelector(
  [selectStudentData],
  (student) => student.data?.testResults || []
);

export const selectStudentAverageScore = createSelector(
  [selectStudentTestResults],
  (testResults) => {
    if (testResults.length === 0) return 0;
    const total = testResults.reduce((sum: number, test: any) => sum + (test.percentage || 0), 0);
    return Math.round(total / testResults.length);
  }
);

export const selectStudentSubjects = createSelector(
  [selectStudentData],
  (student) => student.data?.subjects || []
);

export const selectStudentFees = createSelector(
  [selectStudentData],
  (student) => student.data?.fees || []
);

export const selectStudentPendingFees = createSelector(
  [selectStudentFees],
  (fees) => fees.filter((fee: any) => fee.status === 'pending')
);

export const selectStudentFeeSummary = createSelector(
  [selectStudentFees],
  (fees) => {
    const totalAmount = fees.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0);
    const paidAmount = fees.reduce((sum: number, fee: any) => sum + (fee.paidAmount || 0), 0);
    const pendingAmount = fees.reduce((sum: number, fee: any) => sum + (fee.remainingAmount || 0), 0);
    
    return {
      total: totalAmount,
      paid: paidAmount,
      pending: pendingAmount,
      count: fees.length,
      pendingCount: fees.filter((fee: any) => fee.status === 'pending').length,
    };
  }
);

// Performance optimization utilities
export const createMemoizedSelector = <T, R>(
  selector: (state: RootState, ...args: T[]) => R
) => {
  const cache = new Map();
  
  return (state: RootState, ...args: T[]): R => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = selector(state, ...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// Batch selector for multiple related queries
export const selectBatchedData = createSelector(
  [
    selectStudents,
    selectSubjects,
    selectFees,
    selectMaterials,
    selectAnnouncements,
  ],
  (students, subjects, fees, materials, announcements) => ({
    students,
    subjects,
    fees,
    materials,
    announcements,
    // Computed aggregations
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    totalSubjects: subjects.length,
    totalFees: fees.length,
    totalMaterials: materials.length,
    totalAnnouncements: announcements.length,
  })
);