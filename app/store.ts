import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Students Slice (already present)
export const fetchStudents = createAsyncThunk('students/fetchStudents', async () => {
  const res = await fetch('/api/all-students');
  if (!res.ok) throw new Error('Failed to fetch students');
  return await res.json();
});

const studentsSlice = createSlice({
  name: 'students',
  initialState: {
    data: [],
    status: 'idle',
    error: null as string | null,
  },
  reducers: {},
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

// Fees Slice
export const fetchFees = createAsyncThunk('fees/fetchFees', async () => {
  const res = await fetch('/api/all-student-fees');
  if (!res.ok) throw new Error('Failed to fetch fees');
  return await res.json();
});

const feesSlice = createSlice({
  name: 'fees',
  initialState: {
    data: [],
    status: 'idle',
    error: null as string | null,
  },
  reducers: {},
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
  return await res.json();
});

const materialsSlice = createSlice({
  name: 'materials',
  initialState: {
    data: [],
    status: 'idle',
    error: null as string | null,
  },
  reducers: {},
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

// Subjects Slice
export const fetchSubjects = createAsyncThunk('subjects/fetchSubjects', async () => {
  const res = await fetch('/api/subjects');
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return await res.json();
});

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState: {
    data: [],
    status: 'idle',
    error: null as string | null,
  },
  reducers: {},
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
    status: 'idle',
    error: null as string | null,
  },
  reducers: {},
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

const store = configureStore({
  reducer: {
    students: studentsSlice.reducer,
    fees: feesSlice.reducer,
    materials: materialsSlice.reducer,
    subjects: subjectsSlice.reducer,
    analytics: analyticsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 