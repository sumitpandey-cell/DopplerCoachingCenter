import { useCallback } from 'react';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';
import {
  fetchStudents,
  fetchSubjects,
  fetchFees,
  fetchMaterials,
  fetchTests,
  fetchAnnouncements,
  fetchAnalytics,
  fetchDashboardStats,
  fetchEnquiries,
  fetchFaculty,
  clearStudents,
  clearSubjects,
  clearFees,
  clearMaterials,
  clearTests,
  clearAnnouncements,
  clearAnalytics,
  clearDashboard,
  clearEnquiries,
  clearFaculty,
} from '@/app/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for each slice
export const useStudents = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state) => state.students);
  
  const refetch = useCallback(() => dispatch(fetchStudents()), [dispatch]);
  const clear = useCallback(() => dispatch(clearStudents()), [dispatch]);
  
  return {
    ...students,
    refetch,
    clear,
  };
};

export const useSubjects = () => {
  const dispatch = useAppDispatch();
  const subjects = useAppSelector((state) => state.subjects);
  
  const refetch = useCallback(() => dispatch(fetchSubjects()), [dispatch]);
  const clear = useCallback(() => dispatch(clearSubjects()), [dispatch]);
  
  return {
    ...subjects,
    refetch,
    clear,
  };
};

export const useFees = () => {
  const dispatch = useAppDispatch();
  const fees = useAppSelector((state) => state.fees);
  
  const refetch = useCallback(() => dispatch(fetchFees()), [dispatch]);
  const clear = useCallback(() => dispatch(clearFees()), [dispatch]);
  
  return {
    ...fees,
    refetch,
    clear,
  };
};

export const useMaterials = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.materials);
  
  const refetch = useCallback(() => dispatch(fetchMaterials()), [dispatch]);
  const clear = useCallback(() => dispatch(clearMaterials()), [dispatch]);
  
  return {
    ...materials,
    refetch,
    clear,
  };
};

export const useTests = () => {
  const dispatch = useAppDispatch();
  const tests = useAppSelector((state) => state.tests);
  
  const refetch = useCallback(() => dispatch(fetchTests()), [dispatch]);
  const clear = useCallback(() => dispatch(clearTests()), [dispatch]);
  
  return {
    ...tests,
    refetch,
    clear,
  };
};

export const useAnnouncements = () => {
  const dispatch = useAppDispatch();
  const announcements = useAppSelector((state) => state.announcements);
  
  const refetch = useCallback(() => dispatch(fetchAnnouncements()), [dispatch]);
  const clear = useCallback(() => dispatch(clearAnnouncements()), [dispatch]);
  
  return {
    ...announcements,
    refetch,
    clear,
  };
};

export const useAnalytics = () => {
  const dispatch = useAppDispatch();
  const analytics = useAppSelector((state) => state.analytics);
  
  const refetch = useCallback(() => dispatch(fetchAnalytics()), [dispatch]);
  const clear = useCallback(() => dispatch(clearAnalytics()), [dispatch]);
  
  return {
    ...analytics,
    refetch,
    clear,
  };
};

export const useEnquiries = () => {
  const dispatch = useAppDispatch();
  const enquiries = useAppSelector((state) => state.enquiries);
  
  const refetch = useCallback(() => dispatch(fetchEnquiries()), [dispatch]);
  const clear = useCallback(() => dispatch(clearEnquiries()), [dispatch]);
  
  return {
    ...enquiries,
    refetch,
    clear,
  };
};

export const useFaculty = () => {
  const dispatch = useAppDispatch();
  const faculty = useAppSelector((state) => state.faculty);

  const refetch = useCallback(() => dispatch(fetchFaculty()), [dispatch]);
  const clear = useCallback(() => dispatch(clearFaculty()), [dispatch]);

  return {
    ...faculty,
    refetch,
    clear,
  };
};

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector((state) => state.dashboard);
  
  const refetch = useCallback(() => dispatch(fetchDashboardStats()), [dispatch]);
  const clear = useCallback(() => dispatch(clearDashboard()), [dispatch]);
  
  return {
    ...dashboard,
    refetch,
    clear,
  };
}; 