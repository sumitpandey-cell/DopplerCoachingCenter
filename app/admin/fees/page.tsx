'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/firebase/admin-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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

import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchFees } from '../../store';
import { getSubjects } from '@/firebase/subjects';
import { getStudentByStudentId } from '@/firebase/firestore';
import { getStudentFees, sendFeeReminders, getFeeAnalytics, getFeePayments, getFeeStructures, getAllStudentFees } from '@/firebase/fees';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Simple skeleton for analytics/payments
function FeesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

export default function EnhancedFeesPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();

    // State for analytics and recent payments
    const [analytics, setAnalytics] = useState<any>(null);
    const [recentPayments, setRecentPayments] = useState<any[]>([]);
    const [allPayments, setAllPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [subjectTab, setSubjectTab] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [feeStatusFilter, setFeeStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [studentFeeRows, setStudentFeeRows] = useState<any[]>([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
    const [newSubject, setNewSubject] = useState({
        name: '',
        code: '',
        description: '',
        isActive: true,
        maxCapacity: 50,
        addDropDeadline: '',
        monthlyFeeAmount: '',
    });

    const { toast } = useToast();

    const dispatch = useDispatch<AppDispatch>();
    const feesState = useSelector((state: RootState) => state.fees);
    const { data: fees, status: feesStatus, error: feesError } = feesState;

    React.useEffect(() => {
        if (!isAdminAuthenticated()) {
            router.push('/');
            return;
        }
    }, [router]);

    React.useEffect(() => {
        if (feesStatus === 'idle') {
            dispatch(fetchFees());
        }
    }, [dispatch, feesStatus]);

    React.useEffect(() => {
        getSubjects(false).then(setSubjects);
    }, []);

    // Set loading to false after initial data is loaded
    React.useEffect(() => {
        if (feesStatus !== 'loading' && subjects.length > 0) {
            setLoading(false);
        }
    }, [feesStatus, subjects.length]);

    // Load analytics data
    React.useEffect(() => {
        const loadAnalytics = async () => {
            try {
                // Get actual fee analytics from Firebase
                const analyticsData = await getFeeAnalytics();
                setAnalytics(analyticsData);
                
                // Get actual fee payments from Firebase
                const paymentsData = await getFeePayments();
                const recentPayments = paymentsData.slice(0, 5); // Get last 5 payments
                setRecentPayments(recentPayments);
                setAllPayments(paymentsData);
            } catch (error) {
                console.error('Failed to load analytics:', error);
                // Set default analytics to prevent loading state
                setAnalytics({
                    totalCollected: 0,
                    totalDue: 0,
                    totalOverdue: 0,
                    totalStudentsWithDues: 0,
                    paymentsThisMonth: 0
                });
                setRecentPayments([]);
                setAllPayments([]);
            }
        };
        
        if (!loading) {
            loadAnalytics();
        }
    }, [loading]);

    // Load all student fees for the selected subject (support both subjectId and subject name for legacy data)
    React.useEffect(() => {
        if (!selectedSubject) return;
        setLoadingTable(true);
        (async () => {
            try {
                // Get all student fees from Firebase using the new function
                const allFees = await getAllStudentFees();
                
                // Filter fees by selected subject
                const subjectObj = subjects.find(s => s.id === selectedSubject);
                const subjectName = subjectObj?.name;
                
                const filteredFees = allFees.filter((fee: any) => {
                    // Check if fee matches the selected subject
                    return fee.subjectId === selectedSubject || 
                           fee.subject === subjectName || 
                           fee.feeStructureName?.includes(subjectName);
                });
                
                // For each fee, get student info
                const rows = await Promise.all(filteredFees.map(async (fee: any) => {
                    const student = await getStudentByStudentId(fee.studentId);
                    let month = '-';
                    if (fee.dueDate) {
                        try {
                            const dateObj = fee.dueDate instanceof Date ? fee.dueDate : (fee.dueDate.toDate ? fee.dueDate.toDate() : new Date(fee.dueDate));
                            if (!isNaN(dateObj.getTime())) {
                                month = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                            }
                        } catch { }
                    }
                    return {
                        studentId: student?.studentId,
                        name: student?.fullName,
                        email: student?.email,
                        phone: student?.phone,
                        month,
                        feeStatus: fee.status,
                        amount: fee.amount,
                        feeId: fee.id,
                    };
                }));
                setStudentFeeRows(rows);
            } catch (error) {
                console.error('Error loading student fees:', error);
                setStudentFeeRows([]);
            } finally {
                setLoadingTable(false);
            }
        })();
    }, [selectedSubject, subjects]);

    const filteredRows = studentFeeRows.filter(row => {
        if (feeStatusFilter === 'all') return true;
        return row.feeStatus === feeStatusFilter;
    });

    const handleSendReminder = async (feeId: string) => {
        try {
            await sendFeeReminders([feeId], 'email');
            toast({ title: 'Success', description: 'Reminder sent successfully' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to send reminder', variant: 'destructive' });
        }
    };

    // Add handler for monthly fee generation
    const handleGenerateMonthlyFees = async () => {
        try {
            const res = await fetch('/api/generate-monthly-fees', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                toast({ title: 'Success', description: data.message });
            } else {
                toast({ title: 'Error', description: data.error || 'Failed to generate monthly fees', variant: 'destructive' });
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to generate monthly fees', variant: 'destructive' });
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'subjects'), {
                ...newSubject,
                monthlyFeeAmount: Number(newSubject.monthlyFeeAmount),
                currentEnrollment: 0,
                addDropDeadline: newSubject.addDropDeadline ? Timestamp.fromDate(new Date(newSubject.addDropDeadline)) : null,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
            toast({ title: 'Success', description: 'Subject added!' });
            setShowAddSubjectModal(false);
            setNewSubject({ name: '', code: '', description: '', isActive: true, maxCapacity: 50, addDropDeadline: '', monthlyFeeAmount: '' });
            getSubjects(false).then(setSubjects);
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to add subject', variant: 'destructive' });
        }
    };

    if (loading) {
        // Only show a minimal spinner while checking auth (if needed)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAdminAuthenticated()) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Removed AdminSidebar */}

            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6">Fees</h1>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payments
                        </TabsTrigger>
                        <TabsTrigger value="subject-fee-status" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Subject Fee Status
                        </TabsTrigger>
                        <TabsTrigger value="analysis" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analysis
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Monthly fee generation is now automatic via backend script or scheduled function. */}
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
                                    {loading || !analytics ? (
                                        <div>Loading...</div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">This Month</span>
                                                <span className="font-semibold text-green-600">₹{analytics.totalCollected?.toLocaleString() ?? 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Pending</span>
                                                <span className="font-semibold text-orange-600">₹{analytics.totalDue?.toLocaleString() ?? 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Overdue</span>
                                                <span className="font-semibold text-red-600">₹{analytics.totalOverdue?.toLocaleString() ?? 0}</span>
                                            </div>
                                        </div>
                                    )}
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
                                {loading ? (
                                    <div>Loading...</div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentPayments.length === 0 && (
                                            <div className="text-gray-500">No recent activity.</div>
                                        )}
                                        {recentPayments.map((payment, idx) => (
                                            <div key={payment.id || idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="font-medium text-sm">Payment Received</p>
                                                    <p className="text-xs text-gray-600">
                                                        {payment.studentName || 'Unknown'} paid ₹{payment.amount?.toLocaleString()} for {payment.feeStructureName || 'Fee'}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-500 ml-auto">
                                                    {payment.paymentDate && (payment.paymentDate.toDate ? payment.paymentDate.toDate().toLocaleString() : new Date(payment.paymentDate).toLocaleString())}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="space-y-6">
                        {loading || !analytics ? (
                            <FeesSkeleton />
                        ) : (
                            <FeeStatistics stats={{
                                totalRevenue: analytics.totalCollected ?? 0,
                                pendingAmount: analytics.totalDue ?? 0,
                                studentsWithDues: analytics.totalStudentsWithDues ?? 0,
                                paymentsThisMonth: analytics.paymentsThisMonth ?? 0 // fallback if not present
                            }} />
                        )}
                        <FeePaymentTable payments={allPayments} feeIdToSubjectMap={{}} />
                    </TabsContent>

                    {/* Subject Fee Status Tab */}
                    <TabsContent value="subject-fee-status" className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-blue-700">Subject Fee Status</h2>
                            </div>
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">Select Subject</label>
                                    <select
                                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        value={selectedSubject || ''}
                                        onChange={e => setSelectedSubject(e.target.value)}
                                    >
                                        <option value="">-- Select a subject --</option>
                                        {subjects.map(subj => (
                                            <option key={subj.id} value={subj.id}>{subj.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">Filter by Fee Status</label>
                                    <select
                                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        value={feeStatusFilter}
                                        onChange={e => setFeeStatusFilter(e.target.value as any)}
                                    >
                                        <option value="all">All</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>
                            {selectedSubject && (
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    {loadingTable ? (
                                        <div className="p-8 text-center text-gray-500">Loading...</div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-blue-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Student ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Phone</th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Month</th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Fee Status</th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Amount</th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {filteredRows.map((row, idx) => (
                                                    <tr key={row.feeId || idx} className={row.feeStatus === 'overdue' || row.feeStatus === 'pending' ? 'bg-red-50' : ''}>
                                                        <td className="px-4 py-2 text-sm">{row.studentId}</td>
                                                        <td className="px-4 py-2 text-sm">{row.name}</td>
                                                        <td className="px-4 py-2 text-sm">{row.email}</td>
                                                        <td className="px-4 py-2 text-sm">{row.phone}</td>
                                                        <td className="px-4 py-2 text-sm">{row.month}</td>
                                                        <td className="px-4 py-2 text-sm">
                                                            {row.feeStatus === 'paid' ? (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">✅ Paid</span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">⚠️ {row.feeStatus.charAt(0).toUpperCase() + row.feeStatus.slice(1)}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm">₹{row.amount}</td>
                                                        <td className="px-4 py-2 text-sm">
                                                            {row.feeStatus !== 'paid' && row.feeId && (
                                                                <Button size="sm" onClick={() => handleSendReminder(row.feeId)}>
                                                                    Send Reminder
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                        {showAddSubjectModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                                    <h3 className="text-xl font-bold mb-4">Add New Subject</h3>
                                    <form onSubmit={handleAddSubject} className="space-y-4">
                                        <div>
                                            <label className="block mb-1 font-medium">Name</label>
                                            <input className="w-full border rounded px-3 py-2" value={newSubject.name} onChange={e => setNewSubject(s => ({ ...s, name: e.target.value }))} required />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium">Code</label>
                                            <input className="w-full border rounded px-3 py-2" value={newSubject.code} onChange={e => setNewSubject(s => ({ ...s, code: e.target.value }))} required />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium">Description</label>
                                            <textarea className="w-full border rounded px-3 py-2" value={newSubject.description} onChange={e => setNewSubject(s => ({ ...s, description: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium">Max Capacity</label>
                                            <input type="number" className="w-full border rounded px-3 py-2" value={newSubject.maxCapacity} onChange={e => setNewSubject(s => ({ ...s, maxCapacity: Number(e.target.value) }))} min={1} />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium">Add/Drop Deadline</label>
                                            <input type="date" className="w-full border rounded px-3 py-2" value={newSubject.addDropDeadline} onChange={e => setNewSubject(s => ({ ...s, addDropDeadline: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium">Monthly Fee Amount</label>
                                            <input type="number" className="w-full border rounded px-3 py-2" value={newSubject.monthlyFeeAmount} onChange={e => setNewSubject(s => ({ ...s, monthlyFeeAmount: e.target.value }))} min={0} required />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={newSubject.isActive} onChange={e => setNewSubject(s => ({ ...s, isActive: e.target.checked }))} />
                                            <label className="font-medium">Active</label>
                                        </div>
                                        <div className="flex gap-2 justify-end mt-4">
                                            <Button type="button" variant="outline" onClick={() => setShowAddSubjectModal(false)}>Cancel</Button>
                                            <Button type="submit" variant="default">Add</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Analysis Tab */}
                    <TabsContent value="analysis" className="space-y-6">
                        <EnhancedFeeAnalytics />
                    </TabsContent>

                    {/* Removed Analytics Tab */}
                </Tabs>
            </div>
        </div>
    );
} 