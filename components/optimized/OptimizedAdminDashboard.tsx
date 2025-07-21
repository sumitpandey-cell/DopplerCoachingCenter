'use client';

import React, { memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated, getAdminUser } from '@/firebase/admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Bell,
  RefreshCw
} from 'lucide-react';
import { useOptimizedDashboardStats, useOptimizedStudents, useOptimizedSubjects, useOptimizedAnnouncements } from '@/hooks/use-optimized-data';
import { usePerformanceMonitor } from '@/lib/performance-utils';
import OptimizedDashboardCards from './OptimizedDashboardCards';

// Memoized activity item component
const ActivityItem = memo<{ 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  color: string; 
}>(({ icon: Icon, title, description, color }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <div className={`p-2 ${color} rounded-full`}>
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  </div>
));

ActivityItem.displayName = 'ActivityItem';

// Memoized quick action component
const QuickAction = memo<{ 
  icon: React.ElementType; 
  title: string; 
  color: string; 
  onClick?: () => void; 
}>(({ icon: Icon, title, color, onClick }) => (
  <div 
    className={`p-4 ${color} rounded-lg hover:opacity-80 transition-opacity cursor-pointer`}
    onClick={onClick}
  >
    <Icon className="h-8 w-8 text-white mb-2" />
    <p className="font-medium text-white">{title}</p>
  </div>
));

QuickAction.displayName = 'QuickAction';

const OptimizedAdminDashboard = memo(() => {
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const router = useRouter();
  const monitor = usePerformanceMonitor('AdminDashboard');

  // Optimized data fetching with React Query
  const { 
    data: dashboardStats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useOptimizedDashboardStats();
  
  const { 
    data: studentsData, 
    isLoading: studentsLoading,
    refetch: refetchStudents 
  } = useOptimizedStudents({ limit: 5 });
  
  const { 
    data: subjects, 
    isLoading: subjectsLoading,
    refetch: refetchSubjects 
  } = useOptimizedSubjects();
  
  const { 
    data: announcementsData, 
    isLoading: announcementsLoading,
    refetch: refetchAnnouncements 
  } = useOptimizedAnnouncements(undefined, { limit: 5 });

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/');
      return;
    }
    setAdminUser(getAdminUser());
    setLoading(false);
  }, [router]);

  // Memoized dashboard cards data
  const dashboardCards = useMemo(() => {
    if (!dashboardStats) return [];
    
    return [
      {
        label: 'Total Students',
        value: dashboardStats.students?.toLocaleString() || '0',
        icon: Users,
        href: '/admin/students',
        color: 'text-blue-500',
        bgColor: 'from-blue-100 to-indigo-100',
        borderColor: 'border-blue-200',
      },
      {
        label: 'Active Students',
        value: dashboardStats.activeStudents?.toLocaleString() || '0',
        icon: Users,
        href: '/admin/students',
        color: 'text-green-500',
        bgColor: 'from-green-100 to-emerald-100',
        borderColor: 'border-green-200',
      },
      {
        label: 'Faculty',
        value: dashboardStats.faculty?.toLocaleString() || '0',
        icon: Users,
        href: '/admin/faculty',
        color: 'text-purple-500',
        bgColor: 'from-purple-100 to-pink-100',
        borderColor: 'border-purple-200',
      },
      {
        label: 'Monthly Revenue',
        value: dashboardStats.revenueFormatted || '₹0',
        icon: DollarSign,
        href: '/admin/fees',
        color: 'text-orange-500',
        bgColor: 'from-orange-100 to-yellow-100',
        borderColor: 'border-orange-200',
      },
    ];
  }, [dashboardStats]);

  // Memoized activity items
  const activityItems = useMemo(() => {
    const items = [];
    
    if (studentsData?.data?.length > 0) {
      items.push({
        icon: Users,
        title: 'Students Data Loaded',
        description: `${studentsData.data.length} students in system`,
        color: 'bg-blue-100',
      });
    }
    
    if (subjects?.length > 0) {
      items.push({
        icon: BookOpen,
        title: 'Subjects Available',
        description: `${subjects.length} subjects configured`,
        color: 'bg-green-100',
      });
    }
    
    if (announcementsData?.announcements?.length > 0) {
      items.push({
        icon: Bell,
        title: 'Announcements Active',
        description: `${announcementsData.announcements.length} announcements posted`,
        color: 'bg-orange-100',
      });
    }
    
    return items;
  }, [studentsData, subjects, announcementsData]);

  // Loading state
  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {adminUser.email}. Here's your system overview.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={statsLoading ? 'secondary' : 'default'}>
                {statsLoading ? 'loading' : 'online'}
              </Badge>
              <Button 
                onClick={() => {
                  refetchStats();
                  refetchStudents();
                  refetchSubjects();
                  refetchAnnouncements();
                }}
                disabled={statsLoading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {statsError && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <Bell className="h-4 w-4" />
                <p>Failed to load dashboard data</p>
                <Button onClick={() => refetchStats()} size="sm" variant="outline">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optimized Dashboard Cards */}
        {dashboardCards.length > 0 && (
          <OptimizedDashboardCards cards={dashboardCards} />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityItems.map((item, index) => (
                  <ActivityItem
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    color={item.color}
                  />
                ))}
                
                {activityItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Loading system activities...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used admin functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction
                  icon={Users}
                  title="Manage Users"
                  color="bg-blue-500"
                  onClick={() => router.push('/admin/students')}
                />
                <QuickAction
                  icon={BookOpen}
                  title="Content"
                  color="bg-green-500"
                  onClick={() => router.push('/admin/materials')}
                />
                <QuickAction
                  icon={Calendar}
                  title="Schedule"
                  color="bg-purple-500"
                  onClick={() => router.push('/admin/timetables')}
                />
                <QuickAction
                  icon={TrendingUp}
                  title="Analytics"
                  color="bg-orange-500"
                  onClick={() => router.push('/admin/analytics')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-medium">Database</h3>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-medium">API Services</h3>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-medium">Performance</h3>
                <p className="text-sm text-gray-600">Optimized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

OptimizedAdminDashboard.displayName = 'OptimizedAdminDashboard';

export default OptimizedAdminDashboard;