// Optimized data fetching hooks with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { queryKeys, apiClient } from '@/lib/react-query-config';
import { useDebounce } from '@/lib/performance-utils';

// Optimized students hook with filtering and pagination
export const useOptimizedStudents = (
  filters: {
    search?: string;
    status?: string;
    subject?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  const debouncedSearch = useDebounce(filters.search || '', 300);
  
  const queryKey = useMemo(() => 
    queryKeys.students.list({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  return useQuery({
    queryKey,
    queryFn: () => apiClient.students.getAll(),
    select: useCallback((data: any[]) => {
      let filtered = data;
      
      // Apply search filter
      if (debouncedSearch) {
        filtered = filtered.filter(student =>
          student.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          student.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }
      
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(student => student.status === filters.status);
      }
      
      // Apply subject filter
      if (filters.subject && filters.subject !== 'all') {
        filtered = filtered.filter(student => 
          Array.isArray(student.subjects) && student.subjects.includes(filters.subject)
        );
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        data: filtered.slice(startIndex, endIndex),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }, [debouncedSearch, filters]),
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true, // Keep previous data while fetching new data
  });
};

// Optimized dashboard stats with background refetching
export const useOptimizedDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: apiClient.dashboard.getStats,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchIntervalInBackground: true, // Continue refetching in background
    select: useCallback((data: any) => ({
      ...data,
      // Add computed metrics
      growthRate: data.students > 0 ? ((data.activeStudents / data.students) * 100).toFixed(1) : 0,
      revenueFormatted: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(data.revenue || 0),
    }), []),
  });
};

// Optimized student details with related data
export const useOptimizedStudentDetails = (studentId: string) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.students.detail(studentId),
    queryFn: () => apiClient.students.getById(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: useCallback((data: any) => {
      // Process and optimize the data structure
      return {
        ...data,
        // Ensure arrays are always arrays
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
        testResults: Array.isArray(data.testResults) ? data.testResults : [],
        fees: Array.isArray(data.fees) ? data.fees : [],
        announcements: Array.isArray(data.announcements) ? data.announcements : [],
        // Add computed fields
        averageScore: data.testResults?.length > 0 
          ? Math.round(data.testResults.reduce((sum: number, test: any) => sum + (test.percentage || 0), 0) / data.testResults.length)
          : 0,
        totalFees: data.fees?.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0) || 0,
        pendingFees: data.fees?.filter((fee: any) => fee.status === 'pending').length || 0,
      };
    }, []),
    onSuccess: (data) => {
      // Prefetch related data
      if (data.subjects?.length > 0) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.materials.student(studentId),
          queryFn: () => apiClient.materials.getByStudent(studentId),
          staleTime: 5 * 60 * 1000,
        });
      }
    },
  });
};

// Optimized materials with subject filtering
export const useOptimizedMaterials = (
  studentId?: string,
  filters: { subject?: string; search?: string } = {}
) => {
  const debouncedSearch = useDebounce(filters.search || '', 300);
  
  const queryKey = studentId 
    ? queryKeys.materials.student(studentId)
    : queryKeys.materials.list({ ...filters, search: debouncedSearch });
    
  const queryFn = studentId 
    ? () => apiClient.materials.getByStudent(studentId)
    : apiClient.materials.getAll;

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
    select: useCallback((data: any[]) => {
      let filtered = data;
      
      // Apply search filter
      if (debouncedSearch) {
        filtered = filtered.filter(material =>
          material.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          material.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          material.subject?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }
      
      // Apply subject filter
      if (filters.subject && filters.subject !== 'all') {
        filtered = filtered.filter(material => material.subject === filters.subject);
      }
      
      // Group by subject for better organization
      const groupedBySubject = filtered.reduce((acc, material) => {
        const subject = material.subject || 'Other';
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(material);
        return acc;
      }, {} as Record<string, any[]>);
      
      return {
        all: filtered,
        bySubject: groupedBySubject,
        subjects: Object.keys(groupedBySubject),
        total: filtered.length,
      };
    }, [debouncedSearch, filters]),
  });
};

// Optimized fees with analytics
export const useOptimizedFees = (
  studentId?: string,
  filters: { status?: string; dateRange?: { from: Date; to: Date } } = {}
) => {
  const queryKey = studentId 
    ? queryKeys.fees.student(studentId)
    : queryKeys.fees.list(filters);
    
  const queryFn = studentId 
    ? () => apiClient.fees.getByStudent(studentId)
    : apiClient.fees.getAll;

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1 * 60 * 1000, // 1 minute for financial data
    select: useCallback((data: any[]) => {
      let filtered = data;
      
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(fee => fee.status === filters.status);
      }
      
      // Apply date range filter
      if (filters.dateRange) {
        filtered = filtered.filter(fee => {
          const feeDate = new Date(fee.dueDate);
          return feeDate >= filters.dateRange!.from && feeDate <= filters.dateRange!.to;
        });
      }
      
      // Calculate analytics
      const totalAmount = filtered.reduce((sum, fee) => sum + (fee.amount || 0), 0);
      const paidAmount = filtered.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
      const pendingAmount = filtered.reduce((sum, fee) => sum + (fee.remainingAmount || 0), 0);
      const overdueCount = filtered.filter(fee => {
        const dueDate = new Date(fee.dueDate);
        return dueDate < new Date() && fee.status !== 'paid';
      }).length;
      
      return {
        fees: filtered,
        analytics: {
          total: totalAmount,
          paid: paidAmount,
          pending: pendingAmount,
          overdue: overdueCount,
          collectionRate: totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0,
        },
        byStatus: filtered.reduce((acc, fee) => {
          acc[fee.status] = (acc[fee.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    }, [filters]),
  });
};

// Optimized announcements with priority sorting
export const useOptimizedAnnouncements = (
  studentId?: string,
  filters: { priority?: string; limit?: number } = {}
) => {
  const queryKey = studentId 
    ? queryKeys.announcements.student(studentId)
    : queryKeys.announcements.list(filters);

  return useQuery({
    queryKey,
    queryFn: apiClient.announcements.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: useCallback((data: any[]) => {
      let filtered = data;
      
      // Apply priority filter
      if (filters.priority && filters.priority !== 'all') {
        filtered = filtered.filter(announcement => announcement.priority === filters.priority);
      }
      
      // Sort by priority and date
      filtered.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        
        // Then sort by date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // Apply limit
      if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
      }
      
      return {
        announcements: filtered,
        byPriority: filtered.reduce((acc, announcement) => {
          acc[announcement.priority] = (acc[announcement.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recent: filtered.filter(announcement => {
          const createdAt = new Date(announcement.createdAt);
          const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
          return createdAt > threeDaysAgo;
        }),
      };
    }, [filters]),
  });
};

// Mutation hooks with optimistic updates
export const useOptimizedCreateStudent = () => {
  const queryClient = useQueryClient();
  
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
    onMutate: async (newStudent) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.students.all });
      
      // Snapshot previous value
      const previousStudents = queryClient.getQueryData(queryKeys.students.all);
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.students.all, (old: any[]) => [
        ...old,
        { ...newStudent, id: 'temp-' + Date.now() }
      ]);
      
      return { previousStudents };
    },
    onError: (err, newStudent, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.students.all, context?.previousStudents);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
};

// Prefetch utilities for better UX
export const usePrefetchRelatedData = () => {
  const queryClient = useQueryClient();
  
  const prefetchStudentDetails = useCallback((studentId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.students.detail(studentId),
      queryFn: () => apiClient.students.getById(studentId),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
  
  const prefetchDashboardData = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats(),
      queryFn: apiClient.dashboard.getStats,
      staleTime: 30 * 1000,
    });
  }, [queryClient]);
  
  return {
    prefetchStudentDetails,
    prefetchDashboardData,
  };
};