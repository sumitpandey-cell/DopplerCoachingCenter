'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/firebase/admin-auth';
import AdminSidebar from '@/components/AdminSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Enhanced Fee Components
import EnhancedFeeStructureForm from '@/components/fees/EnhancedFeeStructureForm';
import DiscountManagement from '@/components/fees/DiscountManagement';
import EnhancedFeeAnalytics from '@/components/fees/EnhancedFeeAnalytics';
import FeeReminderSystem from '@/components/fees/FeeReminderSystem';

// Existing components
import BulkFeeAssignment from '@/components/fees/BulkFeeAssignment';
import FeePaymentTable from '@/components/fees/FeePaymentTable';
import FeeStatistics from '@/components/fees/FeeStatistics';

import { 
  Calculator, 
  BarChart3, 
  Bell, 
  Gift, 
  Users, 
  CreditCard, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function EnhancedFeesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  // Check admin authentication
  React.useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/');
      return;
    }
  }, [router]);

  if (!isAdminAuthenticated()) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Fee Management</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive fee management system with advanced analytics and automation
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="structures" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Structures
            </TabsTrigger>
            <TabsTrigger value="discounts" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Discounts
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Collection Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold text-green-600">₹2,45,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="font-semibold text-orange-600">₹45,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overdue</span>
                      <span className="font-semibold text-red-600">₹12,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('structures')}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Create Fee Structure
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('assignments')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Bulk Assignment
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('reminders')}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Reminders
                  </Button>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Gateway</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Service</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Service</span>
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto Reminders</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest fee-related activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Payment Received</p>
                      <p className="text-xs text-gray-600">John Doe paid ₹5,000 for Monthly Tuition</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Reminder Sent</p>
                      <p className="text-xs text-gray-600">Email reminder sent to 15 students</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">Fee Overdue</p>
                      <p className="text-xs text-gray-600">Jane Smith's exam fee is now overdue</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">3 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fee Structures Tab */}
          <TabsContent value="structures">
            <EnhancedFeeStructureForm />
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts">
            <DiscountManagement />
          </TabsContent>

          {/* Bulk Assignments Tab */}
          <TabsContent value="assignments">
            <BulkFeeAssignment />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <FeeStatistics />
            <FeePaymentTable />
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <FeeReminderSystem />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <EnhancedFeeAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}