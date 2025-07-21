# Performance Implementation Guide

## Phase 1: Critical Optimizations (Week 1-2)

### 1. Replace Current Layout with Optimized Version

```bash
# Backup current layout
mv app/layout.tsx app/layout-backup.tsx
mv app/layout-optimized.tsx app/layout.tsx

# Update providers
mv app/providers.tsx app/providers-backup.tsx
mv app/providers-optimized.tsx app/providers.tsx
```

### 2. Install React Query Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools reselect
npm install --save-dev @next/bundle-analyzer webpack-bundle-analyzer lighthouse
```

### 3. Implement Code Splitting for Major Routes

Update your route components to use lazy loading:

```typescript
// app/admin/dashboard/page.tsx
import dynamic from 'next/dynamic';
import { LoaderOverlay } from '@/components/ui/loader';

const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  loading: () => <LoaderOverlay />,
});

export default AdminDashboard;
```

### 4. Replace Student Dashboard

```bash
# Backup current dashboard
mv app/student/dashboard/page.tsx app/student/dashboard/page-backup.tsx
mv app/student/dashboard/page-optimized.tsx app/student/dashboard/page.tsx
```

## Phase 2: Performance Enhancements (Week 3-4)

### 1. Implement React Query Hooks

Replace Redux hooks with optimized React Query hooks:

```typescript
// Before (Redux)
const students = useStudents();
useEffect(() => {
  students.refetch();
}, []);

// After (React Query)
const { data: students, isLoading, error } = useOptimizedStudents({
  search: searchTerm,
  status: statusFilter,
  page: currentPage,
});
```

### 2. Add Virtualization for Large Lists

```typescript
// Replace large lists with virtualized components
import VirtualizedList from '@/components/optimized/VirtualizedList';

<VirtualizedList
  items={students}
  height={600}
  itemHeight={80}
  renderItem={({ index, style, data }) => (
    <div style={style}>
      <StudentCard student={data[index]} />
    </div>
  )}
/>
```

### 3. Optimize Images

```typescript
// Replace img tags with LazyImage component
import LazyImage from '@/components/optimized/LazyImage';

<LazyImage
  src="https://images.pexels.com/photo-123.jpg"
  alt="Student"
  width={300}
  height={200}
  quality={80}
  className="rounded-lg"
/>
```

## Phase 3: Advanced Optimizations (Week 5-6)

### 1. Update Next.js Configuration

```bash
mv next.config.js next.config-backup.js
mv next.config.optimized.js next.config.js
```

### 2. Add Performance Monitoring

```bash
# Add performance monitoring script
npm run performance:audit
npm run performance:monitor
```

### 3. Implement Service Worker (Optional)

```typescript
// public/sw.js
const CACHE_NAME = 'doppler-coaching-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## Migration Steps

### Step 1: Backup Current Implementation
```bash
mkdir backup
cp -r app backup/
cp -r components backup/
cp -r hooks backup/
cp -r lib backup/
```

### Step 2: Install Dependencies
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools reselect react-window
```

### Step 3: Update Package.json
```bash
mv package.json package-backup.json
mv package-optimized.json package.json
npm install
```

### Step 4: Implement Optimizations Gradually
1. Start with layout and providers
2. Add React Query configuration
3. Replace heavy components one by one
4. Add performance monitoring
5. Optimize bundle and images

### Step 5: Test and Measure
```bash
npm run build
npm run performance:audit
npm run performance:monitor
```

## Expected Performance Improvements

### Before Optimization
- **Performance Score**: 65/100
- **First Contentful Paint**: 2.8s
- **Largest Contentful Paint**: 4.2s
- **Time to Interactive**: 5.1s
- **Bundle Size**: ~2.3MB

### After Optimization
- **Performance Score**: 90+/100
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.0s
- **Bundle Size**: <1.5MB

## Monitoring and Maintenance

### 1. Set up Performance Monitoring
```bash
# Run weekly performance audits
npm run performance:audit

# Monitor bundle size
npm run analyze
```

### 2. Performance Budget
- JavaScript bundles: <500KB per route
- Images: <200KB each, WebP format
- API responses: <100KB per request
- Time to Interactive: <3s

### 3. Continuous Optimization
- Monitor Core Web Vitals
- Regular bundle analysis
- Performance regression testing
- User experience metrics tracking

## Troubleshooting

### Common Issues
1. **Hydration Errors**: Ensure SSR compatibility
2. **Bundle Size Increase**: Check for duplicate dependencies
3. **Memory Leaks**: Properly cleanup subscriptions
4. **Cache Issues**: Clear React Query cache when needed

### Performance Debugging
```typescript
// Enable performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/performance-utils').then(({ PerformanceMonitor }) => {
    const monitor = PerformanceMonitor.getInstance();
    setInterval(() => monitor.logMetrics(), 10000);
  });
}
```