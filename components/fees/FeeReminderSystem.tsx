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
  const [reminderType, setReminderType] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [selectedTemplate, setSelectedTemplate] = useState<ReminderTemplate>(defaultTemplates[0]);
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

  const handleSendReminders = async () => {
    if (selectedFees.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one fee to send reminders',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      await sendFeeReminders(selectedFees, reminderType);
      toast({
        title: 'Success',
        description: `${selectedFees.length} reminder(s) sent successfully`,
      });
      setSelectedFees([]);
      setIsDialogOpen(false);
      fetchOverdueFees(); // Refresh data
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reminders',
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Overdue Fees</CardTitle>
              <CardDescription>Select students to send payment reminders</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={selectedFees.length === 0}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminders ({selectedFees.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Fee Reminders</DialogTitle>
                  <DialogDescription>
                    Configure and send payment reminders to selected students
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Reminder Type</Label>
                    <Select value={reminderType} onValueChange={(value: 'email' | 'sms' | 'whatsapp') => {
                      setReminderType(value);
                      const template = defaultTemplates.find(t => t.type === value);
                      if (template) setSelectedTemplate(template);
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            SMS
                          </div>
                        </SelectItem>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            WhatsApp
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Template</Label>
                    <Select value={selectedTemplate.id} onValueChange={(value) => {
                      const template = defaultTemplates.find(t => t.id === value);
                      if (template) setSelectedTemplate(template);
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultTemplates.filter(t => t.type === reminderType).map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {reminderType === 'email' && (
                    <div>
                      <Label>Subject</Label>
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {selectedTemplate.subject}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Message Template</Label>
                    <Textarea
                      value={selectedTemplate.content}
                      readOnly
                      rows={6}
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Variables: {'{studentName}'}, {'{feeName}'}, {'{amount}'}, {'{dueDate}'}, {'{daysOverdue}'}
                    </p>
                  </div>

                  <div>
                    <Label>Additional Notes (Optional)</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Add any additional message..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSendReminders} disabled={sending} className="flex-1">
                      {sending ? 'Sending...' : `Send ${selectedFees.length} Reminder(s)`}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFees.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No overdue fees found</p>
              <p className="text-sm text-gray-400">All students are up to date with their payments</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedFees.length === filteredFees.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Reminders Sent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedFees.includes(fee.id!)}
                        onCheckedChange={(checked) => handleSelectFee(fee.id!, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{fee.studentName}</div>
                        <div className="text-sm text-gray-500">ID: {fee.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{fee.feeStructureName}</div>
                        <div className="text-sm text-gray-500">
                          Due: {format(fee.dueDate instanceof Date ? fee.dueDate : fee.dueDate.toDate(), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-red-600">
                        ₹{fee.remainingAmount.toLocaleString()}
                      </div>
                      {fee.paidAmount > 0 && (
                        <div className="text-sm text-gray-500">
                          Paid: ₹{fee.paidAmount.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getDaysOverdue(fee.dueDate)} days</span>
                        {getOverdueBadge(getDaysOverdue(fee.dueDate))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getReminderStatusIcon(fee.remindersSent || 0)}
                        <span>{fee.remindersSent || 0}</span>
                      </div>
                      {fee.lastReminderDate && (
                        <div className="text-xs text-gray-500">
                          Last: {format(fee.lastReminderDate instanceof Date ? fee.lastReminderDate : fee.lastReminderDate.toDate(), 'MMM dd')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={fee.status === 'overdue' ? 'destructive' : 'secondary'}>
                        {fee.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}