import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types
interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  status: string;
  subjects: string[];
  [key: string]: any;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  monthlyFeeAmount?: number;
  [key: string]: any;
}

interface Fee {
  id: string;
  studentId: string;
  subjectId: string;
  amount: number;
  status: string;
  [key: string]: any;
}

interface Material {
  id: string;
  title: string;
  subject: string;
  fileUrl: string;
  [key: string]: any;
}

interface Test {
  id: string;
  name: string;
  subjectId: string;
  maxScore: number;
  status: string;
  [key: string]: any;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  [key: string]: any;
}

// Students Slice
export const fetchStudents = createAsyncThunk('students/fetchStudents', async () => {
  const res = await fetch('/api/all-students');
  if (!res.ok) throw new Error('Failed to fetch students');
  return await res.json() as Student[];
});

const studentsSlice = createSlice({
  name: 'students',
  initialState: {
    data: [] as Student[],
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearStudents: (state) => {
      state.data = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch students';
      });
  },
});

// Subjects Slice
export const fetchSubjects = createAsyncThunk('subjects/fetchSubjects', async () => {
  const res = await fetch('/api/subjects');
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return await res.json() as Subject[];
});

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState: {
    data: [] as Subject[],
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearSubjects: (state) => {
      state.data = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch subjects';
      });
  },
});

// Fees Slice
export const fetchFees = createAsyncThunk('fees/fetchFees', async () => {
  const res = await fetch('/api/all-student-fees');
  if (!res.ok) throw new Error('Failed to fetch fees');
  return await res.json() as Fee[];
});

const feesSlice = createSlice({
  name: 'fees',
  initialState: {
    data: [] as Fee[],
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearFees: (state) => {
      state.data = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFees.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchFees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch fees';
      });
  },
});

// Materials Slice
export const fetchMaterials = createAsyncThunk('materials/fetchMaterials', async () => {
  const res = await fetch('/api/study-materials');
  if (!res.ok) throw new Error('Failed to fetch materials');
  return await res.json() as Material[];
});

const materialsSlice = createSlice({
  name: 'materials',
  initialState: {
    data: [] as Material[],
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearMaterials: (state) => {
      state.data = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch materials';
      });
  },
});

// Tests Slice
export const fetchTests = createAsyncThunk('tests/fetchTests', async () => {
  const res = await fetch('/api/all-tests');
  if (!res.ok) throw new Error('Failed to fetch tests');
  return await res.json() as Test[];
});

const testsSlice = createSlice({
  name: 'tests',
  initialState: {
    data: [] as Test[],
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearTests: (state) => {
      state.data = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tests';
      });
  },
});

// Announcements Slice
export const fetchAnnouncements = createAsyncThunk('announcements/fetchAnnouncements', async () => {
  const res = await fetch('/api/announcements');
  if (!res.ok) throw new Error('Failed to fetch announcements');
  return await res.json() as Announcement[];
});

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState: {
    data: [] as Announcement[],
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearAnnouncements: (state) => {
      state.data = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch announcements';
      });
  },
});

// Analytics Slice
export const fetchAnalytics = createAsyncThunk('analytics/fetchAnalytics', async () => {
  const res = await fetch('/api/analytics-data');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return await res.json();
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    data: null as any,
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearAnalytics: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch analytics';
      });
  },
});

// Dashboard Stats Slice
export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
  const res = await fetch('/api/dashboard-stats');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return await res.json();
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null as any,
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearDashboard: (state) => {
      state.stats = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      });
  },
});

const store = configureStore({
  reducer: {
    students: studentsSlice.reducer,
    subjects: subjectsSlice.reducer,
    fees: feesSlice.reducer,
    materials: materialsSlice.reducer,
    tests: testsSlice.reducer,
    announcements: announcementsSlice.reducer,
    analytics: analyticsSlice.reducer,
    dashboard: dashboardSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export actions
export const {
  clearStudents,
  clearSubjects,
  clearFees,
  clearMaterials,
  clearTests,
  clearAnnouncements,
  clearAnalytics,
  clearDashboard,
} = {
  clearStudents: studentsSlice.actions.clearStudents,
  clearSubjects: subjectsSlice.actions.clearSubjects,
  clearFees: feesSlice.actions.clearFees,
  clearMaterials: materialsSlice.actions.clearMaterials,
  clearTests: testsSlice.actions.clearTests,
  clearAnnouncements: announcementsSlice.actions.clearAnnouncements,
  clearAnalytics: analyticsSlice.actions.clearAnalytics,
  clearDashboard: dashboardSlice.actions.clearDashboard,
};

export default store; 