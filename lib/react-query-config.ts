// React Query configuration for optimized data fetching
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Optimized Query Client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for critical data
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent caching
export const queryKeys = {
  // Students
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.students.lists(), filters] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
  },
  
  // Subjects
  subjects: {
    all: ['subjects'] as const,
    lists: () => [...queryKeys.subjects.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.subjects.lists(), filters] as const,
    details: () => [...queryKeys.subjects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.subjects.details(), id] as const,
  },
  
  // Fees
  fees: {
    all: ['fees'] as const,
    lists: () => [...queryKeys.fees.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.fees.lists(), filters] as const,
    student: (studentId: string) => [...queryKeys.fees.all, 'student', studentId] as const,
    analytics: () => [...queryKeys.fees.all, 'analytics'] as const,
  },
  
  // Materials
  materials: {
    all: ['materials'] as const,
    lists: () => [...queryKeys.materials.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.materials.lists(), filters] as const,
    student: (studentId: string) => [...queryKeys.materials.all, 'student', studentId] as const,
  },
  
  // Announcements
  announcements: {
    all: ['announcements'] as const,
    lists: () => [...queryKeys.announcements.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.announcements.lists(), filters] as const,
    student: (studentId: string) => [...queryKeys.announcements.all, 'student', studentId] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    analytics: () => [...queryKeys.dashboard.all, 'analytics'] as const,
  },
} as const;

// API functions with React Query integration
export const apiClient = {
  // Students API
  students: {
    getAll: async (): Promise<any[]> => {
      const response = await fetch('/api/all-students');
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    
    getById: async (studentId: string): Promise<any> => {
      const response = await fetch(`/api/student?studentId=${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student');
      return response.json();
    },
  },
  
  // Subjects API
  subjects: {
    getAll: async (): Promise<any[]> => {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    },
  },
  
  // Fees API
  fees: {
    getAll: async (): Promise<any[]> => {
      const response = await fetch('/api/all-student-fees');
      if (!response.ok) throw new Error('Failed to fetch fees');
      return response.json();
    },
    
    getByStudent: async (studentId: string): Promise<any[]> => {
      const response = await fetch(`/api/student-fees?studentId=${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student fees');
      return response.json();
    },
    
    getAnalytics: async (): Promise<any> => {
      const response = await fetch('/api/fee-analytics');
      if (!response.ok) throw new Error('Failed to fetch fee analytics');
      return response.json();
    },
  },
  
  // Materials API
  materials: {
    getAll: async (): Promise<any[]> => {
      const response = await fetch('/api/study-materials');
      if (!response.ok) throw new Error('Failed to fetch materials');
      return response.json();
    },
    
    getByStudent: async (studentId: string): Promise<any[]> => {
      const response = await fetch(`/api/student-materials?studentId=${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student materials');
      return response.json();
    },
  },
  
  // Announcements API
  announcements: {
    getAll: async (): Promise<any[]> => {
      const response = await fetch('/api/announcements');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
  },
  
  // Dashboard API
  dashboard: {
    getStats: async (): Promise<any> => {
      const response = await fetch('/api/dashboard-stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    
    getAnalytics: async (): Promise<any> => {
      const response = await fetch('/api/analytics-data');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  },
};

// Custom hooks for data fetching
export const useStudents = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.students.list(filters || {}),
    queryFn: apiClient.students.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes for frequently changing data
  });
};

export const useStudent = (studentId: string) => {
  return useQuery({
    queryKey: queryKeys.students.detail(studentId),
    queryFn: () => apiClient.students.getById(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes for student details
  });
};

export const useSubjects = () => {
  return useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: apiClient.subjects.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes for relatively static data
  });
};

export const useFees = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.fees.list(filters || {}),
    queryFn: apiClient.fees.getAll,
    staleTime: 1 * 60 * 1000, // 1 minute for financial data
  });
};

export const useStudentFees = (studentId: string) => {
  return useQuery({
    queryKey: queryKeys.fees.student(studentId),
    queryFn: () => apiClient.fees.getByStudent(studentId),
    enabled: !!studentId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useMaterials = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.materials.list(filters || {}),
    queryFn: apiClient.materials.getAll,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentMaterials = (studentId: string) => {
  return useQuery({
    queryKey: queryKeys.materials.student(studentId),
    queryFn: () => apiClient.materials.getByStudent(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAnnouncements = () => {
  return useQuery({
    queryKey: queryKeys.announcements.all,
    queryFn: apiClient.announcements.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes for announcements
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: apiClient.dashboard.getStats,
    staleTime: 30 * 1000, // 30 seconds for dashboard stats
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.analytics(),
    queryFn: apiClient.dashboard.getAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes for analytics
  });
};

// Mutation hooks for data updates
export const useCreateStudent = () => {
  return useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) throw new Error('Failed to create student');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch students data
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
};

export const useUpdateStudent = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update student');
      return response.json();
    },
    onSuccess: (_, { id }) => {
      // Invalidate specific student and list
      queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
    },
  });
};

// Prefetch utilities
export const prefetchStudents = () => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.students.all,
    queryFn: apiClient.students.getAll,
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchDashboardData = () => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: apiClient.dashboard.getStats,
    staleTime: 30 * 1000,
  });
};