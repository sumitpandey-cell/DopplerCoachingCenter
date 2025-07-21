import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

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

export const addSubject = createAsyncThunk('subjects/addSubject', async (subject: Omit<Subject, 'id'>) => {
  const res = await fetch('/api/subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to add subject');
  }
  const { id } = await res.json();
  return { ...subject, id };
});

export const deleteSubject = createAsyncThunk('subjects/deleteSubject', async (id: string) => {
  const res = await fetch('/api/subjects', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete subject');
  }
  return id;
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
      })
      .addCase(addSubject.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.data = state.data.filter(s => s.id !== action.payload);
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

// Enquiries Slice
export const fetchEnquiries = createAsyncThunk('enquiries/fetchEnquiries', async () => {
  const res = await fetch('/api/enquiries');
  if (!res.ok) throw new Error('Failed to fetch enquiries');
  return await res.json() as any[];
});

const enquiriesSlice = createSlice({
  name: 'enquiries',
  initialState: {
    data: [] as any[],
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearEnquiries: (state) => {
      state.data = [];
      state.status = 'idle';
      state.error = null;
    },
    updateEnquiryStatus: (state, action) => {
      const { id, status, studentId } = action.payload;
      const enquiry = state.data.find(e => e.id === id);
      if (enquiry) {
        enquiry.status = status;
        if (studentId) enquiry.studentId = studentId;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch enquiries';
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

export const addAnnouncement = createAsyncThunk('announcements/addAnnouncement', async (announcement: Omit<Announcement, 'id'>) => {
  const res = await fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ announcement }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to add announcement');
  }
  const { id } = await res.json();
  return { ...announcement, id };
});

export const deleteAnnouncement = createAsyncThunk('announcements/deleteAnnouncement', async (id: string) => {
  const res = await fetch(`/api/announcements?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete announcement');
  return id;
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
      })
      .addCase(addAnnouncement.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.data = state.data.filter(a => a.id !== action.payload);
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

// Faculty Slice
export const fetchFaculty = createAsyncThunk('faculty/fetchFaculty', async () => {
  const res = await fetch('/api/all-faculty');
  if (!res.ok) throw new Error('Failed to fetch faculty');
  return await res.json() as any[];
});

export const addFaculty = createAsyncThunk('faculty/addFaculty', async (faculty: any) => {
  const res = await fetch('/api/add-faculty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ faculty }),
  });
  if (!res.ok) throw new Error('Failed to add faculty');
  const { id } = await res.json();
  return { ...faculty, id };
});

export const updateFaculty = createAsyncThunk('faculty/updateFaculty', async ({ id, updates }: { id: string, updates: any }) => {
  const res = await fetch('/api/update-faculty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, updates }),
  });
  if (!res.ok) throw new Error('Failed to update faculty');
  return { id, updates };
});

export const deleteFaculty = createAsyncThunk('faculty/deleteFaculty', async (id: string) => {
  const res = await fetch('/api/delete-faculty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete faculty');
  return id;
});

const facultySlice = createSlice({
  name: 'faculty',
  initialState: {
    data: [] as any[],
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {
    clearFaculty: (state) => {
      state.data = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaculty.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFaculty.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchFaculty.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch faculty';
      })
      .addCase(addFaculty.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateFaculty.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const idx = state.data.findIndex(f => f.id === id);
        if (idx !== -1) {
          state.data[idx] = { ...state.data[idx], ...updates };
        }
      })
      .addCase(deleteFaculty.fulfilled, (state, action) => {
        state.data = state.data.filter(f => f.id !== action.payload);
      });
  },
});

// Single Student Slice (for student portal)
export const fetchCurrentStudent = createAsyncThunk(
  'student/fetchCurrentStudent',
  async (studentId: string) => {
    const res = await fetch(`/api/student?studentId=${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch student');
    return await res.json();
  }
);

const singleStudentSlice = createSlice({
  name: 'student',
  initialState: {
    data: null as any,
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentStudent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentStudent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCurrentStudent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch student';
      });
  },
});

const store = configureStore({
  reducer: {
    students: studentsSlice.reducer,
    student: singleStudentSlice.reducer, // <-- add this line
    subjects: subjectsSlice.reducer,
    fees: feesSlice.reducer,
    materials: materialsSlice.reducer,
    enquiries: enquiriesSlice.reducer,
    tests: testsSlice.reducer,
    announcements: announcementsSlice.reducer,
    analytics: analyticsSlice.reducer,
    dashboard: dashboardSlice.reducer,
    faculty: facultySlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Export actions
export const {
  clearStudents,
  clearSubjects,
  clearFees,
  clearMaterials,
  clearEnquiries,
  updateEnquiryStatus,
  clearTests,
  clearAnnouncements,
  clearAnalytics,
  clearDashboard,
  clearFaculty,
} = {
  clearStudents: studentsSlice.actions.clearStudents,
  clearSubjects: subjectsSlice.actions.clearSubjects,
  clearFees: feesSlice.actions.clearFees,
  clearMaterials: materialsSlice.actions.clearMaterials,
  clearEnquiries: enquiriesSlice.actions.clearEnquiries,
  updateEnquiryStatus: enquiriesSlice.actions.updateEnquiryStatus,
  clearTests: testsSlice.actions.clearTests,
  clearAnnouncements: announcementsSlice.actions.clearAnnouncements,
  clearAnalytics: analyticsSlice.actions.clearAnalytics,
  clearDashboard: dashboardSlice.actions.clearDashboard,
  clearFaculty: facultySlice.actions.clearFaculty,
};

export default store; 