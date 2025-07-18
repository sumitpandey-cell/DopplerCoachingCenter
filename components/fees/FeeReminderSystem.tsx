'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getOverdueFees, sendFeeReminders, StudentFee } from '@/firebase/fees';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ReminderTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'whatsapp';
}

const defaultTemplates: ReminderTemplate[] = [
  {
    id: 'email_gentle',
    name: 'Gentle Email Reminder',
    subject: 'Fee Payment Reminder - {studentName}',
    type: 'email',
    content: `Dear {studentName},

This is a gentle reminder that your {feeName} of ₹{amount} was due on {dueDate}.

Please make the payment at your earliest convenience to avoid any late fees.

If you have already made the payment, please ignore this message.

Thank you,
Doppler Coaching Center`
  },
  {
    id: 'email_urgent',
    name: 'Urgent Email Reminder',
    subject: 'URGENT: Overdue Fee Payment - {studentName}',
    type: 'email',
    content: `Dear {studentName},

Your {feeName} of ₹{amount} is now {daysOverdue} days overdue.

Please make the payment immediately to avoid additional late fees and potential suspension of services.

Contact us if you need assistance with payment arrangements.

Regards,
Doppler Coaching Center`
  },
  {
    id: 'sms_reminder',
    name: 'SMS Reminder',
    subject: '',
    type: 'sms',
    content: `Hi {studentName}, your {feeName} of ₹{amount} is overdue. Please pay soon to avoid late fees. - Doppler Coaching`
  }
];

export default function FeeReminderSystem() {
  const [overdueFees, setOverdueFees] = useState<StudentFee[]>([]);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  // Remove reminderType and template selection, always use email
  const [customMessage, setCustomMessage] = useState('');
  const [filterDays, setFilterDays] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOverdueFees();
  }, []);

  const fetchOverdueFees = async () => {
    try {
      const fees = await getOverdueFees();
      setOverdueFees(fees);
    } catch (error) {
      console.error('Error fetching overdue fees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch overdue fees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFees(filteredFees.map(fee => fee.id!));
    } else {
      setSelectedFees([]);
    }
  };

  const handleSelectFee = (feeId: string, checked: boolean) => {
    if (checked) {
      setSelectedFees([...selectedFees, feeId]);
    } else {
      setSelectedFees(selectedFees.filter(id => id !== feeId));
    }
  };

  // Remove reminderType and template selection, always use email
  const handleSendReminder = async (feeId: string) => {
    setSending(true);
    try {
      await sendFeeReminders([feeId], 'email');
      toast({
        title: 'Success',
        description: 'Reminder sent successfully',
      });
      fetchOverdueFees();
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getDaysOverdue = (dueDate: Date | any) => {
    const due = dueDate instanceof Date ? dueDate : dueDate.toDate();
    return differenceInDays(new Date(), due);
  };

  const getOverdueBadge = (days: number) => {
    if (days <= 7) return <Badge variant="outline" className="text-yellow-600">Recently Due</Badge>;
    if (days <= 30) return <Badge variant="destructive">Overdue</Badge>;
    return <Badge variant="destructive" className="bg-red-700">Critical</Badge>;
  };

  const getReminderStatusIcon = (remindersSent: number) => {
    if (remindersSent === 0) return <XCircle className="h-4 w-4 text-gray-400" />;
    if (remindersSent <= 2) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  // Filter fees based on days overdue
  const filteredFees = overdueFees.filter(fee => {
    const days = getDaysOverdue(fee.dueDate);
    switch (filterDays) {
      case '7': return days <= 7;
      case '30': return days <= 30;
      case '30+': return days > 30;
      default: return true;
    }
  });

  const totalOverdueAmount = filteredFees.reduce((sum, fee) => sum + fee.remainingAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fee Reminder System</h2>
          <p className="text-gray-600">Send automated reminders for overdue fees</p>
        </div>
        <div className="flex gap-3">
          <Select value={filterDays} onValueChange={setFilterDays}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Overdue</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="30+">30+ Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOverdueFees} variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalOverdueAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredFees.length} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Due</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {overdueFees.filter(fee => getDaysOverdue(fee.dueDate) <= 7).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Within 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueFees.filter(fee => getDaysOverdue(fee.dueDate) > 30).length}
            </div>
            <p className="text-xs text-muted-foreground">
              30+ days overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {selectedFees.length}
            </div>
            <p className="text-xs text-muted-foreground">
              For reminders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Overdue Fees</CardTitle>
          <CardDescription>Send email reminders to students with overdue fees.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reminders Sent</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map(fee => (
                <TableRow key={fee.id}>
                  <TableCell>{fee.studentName || fee.studentId}</TableCell>
                  <TableCell>{fee.feeStructureName}</TableCell>
                  <TableCell>₹{fee.remainingAmount}</TableCell>
                  <TableCell>{fee.dueDate && (fee.dueDate.toDate ? fee.dueDate.toDate().toLocaleDateString() : new Date(fee.dueDate).toLocaleDateString())}</TableCell>
                  <TableCell>{getOverdueBadge(getDaysOverdue(fee.dueDate))}</TableCell>
                  <TableCell>{fee.remindersSent || 0}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleSendReminder(fee.id!)} disabled={sending}>
                      Send Reminder
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}