'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Users, 
  Globe, 
  Save,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { getSubjects, addSubject, updateSubject, deleteSubject, Subject } from '@/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    instituteName: 'Doppler Coaching Center',
    instituteEmail: 'info@dopplercoaching.com',
    institutePhone: '+91 98765 43210',
    instituteAddress: '123 Education Street, Learning City, State 123456',
    website: 'https://dopplercoaching.com',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    announcementNotifications: true,
    paymentReminders: true,
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 3,
    
    // System Settings
    backupFrequency: 'daily',
    maintenanceMode: false,
    debugMode: false,
    dataRetention: 365,
  });

  const [saved, setSaved] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch (error) {
        setSubjectError('Failed to fetch subjects');
      }
    };
    fetchSubjects();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    //
    // In a real app, you would save these settings to a database.
    // For this example, we'll just simulate a save.
    // 
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "Your changes have been successfully saved.",
    });
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      await addSubject(newSubject.trim());
      setNewSubject('');
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      setSubjectError('Failed to add subject');
    }
  };

  const handleEditSubject = (id: string, name: string) => {
    setEditingSubjectId(id);
    setEditingSubjectName(name);
  };

  const handleUpdateSubject = async () => {
    if (!editingSubjectName.trim() || !editingSubjectId) return;
    try {
      await updateSubject(editingSubjectId, editingSubjectName.trim());
      setEditingSubjectId(null);
      setEditingSubjectName('');
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      setSubjectError('Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await deleteSubject(id);
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      setSubjectError('Failed to delete subject');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure system preferences and administrative settings</p>
      </div>

      {saved && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>Basic institute information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="instituteName">Institute Name</Label>
                  <Input
                    id="instituteName"
                    value={settings.instituteName}
                    onChange={(e) => handleSettingChange('instituteName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="instituteEmail">Email Address</Label>
                  <Input
                    id="instituteEmail"
                    type="email"
                    value={settings.instituteEmail}
                    onChange={(e) => handleSettingChange('instituteEmail', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="institutePhone">Phone Number</Label>
                  <Input
                    id="institutePhone"
                    value={settings.institutePhone}
                    onChange={(e) => handleSettingChange('institutePhone', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    value={settings.website}
                    onChange={(e) => handleSettingChange('website', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instituteAddress">Address</Label>
                <Textarea
                  id="instituteAddress"
                  value={settings.instituteAddress}
                  onChange={(e) => handleSettingChange('instituteAddress', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how and when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Send browser push notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="announcementNotifications">Announcement Notifications</Label>
                    <p className="text-sm text-gray-600">Notify users of new announcements</p>
                  </div>
                  <Switch
                    id="announcementNotifications"
                    checked={settings.announcementNotifications}
                    onCheckedChange={(checked) => handleSettingChange('announcementNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paymentReminders">Payment Reminders</Label>
                    <p className="text-sm text-gray-600">Send payment due reminders</p>
                  </div>
                  <Switch
                    id="paymentReminders"
                    checked={settings.paymentReminders}
                    onCheckedChange={(checked) => handleSettingChange('paymentReminders', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security policies and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">Auto-logout after inactivity</p>
                </div>
                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">Force password change after</p>
                </div>
              </div>

              <div>
                <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  className="mt-1 w-32"
                />
                <p className="text-sm text-gray-600 mt-1">Lock account after failed attempts</p>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Security settings affect all users. Changes take effect immediately.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription>Configure system behavior and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <select
                  id="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">Automatic database backup schedule</p>
              </div>

              <div>
                <Label htmlFor="dataRetention">Data Retention (days)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                  className="mt-1 w-32"
                />
                <p className="text-sm text-gray-600 mt-1">How long to keep deleted data</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Temporarily disable user access</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debugMode">Debug Mode</Label>
                    <p className="text-sm text-gray-600">Enable detailed error logging</p>
                  </div>
                  <Switch
                    id="debugMode"
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                  />
                </div>
              </div>

              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  System changes may require a restart to take effect. Schedule maintenance during off-hours.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">Subjects Management</CardTitle>
              <CardDescription>Manage the list of available subjects for students and faculty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <Input
                  placeholder="Add new subject"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full md:w-1/2"
                />
                <Button onClick={handleAddSubject}>Add Subject</Button>
              </div>
              {subjectError && <Alert variant="destructive"><AlertDescription>{subjectError}</AlertDescription></Alert>}
              <div className="mt-4">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border">Subject Name</th>
                      <th className="py-2 px-4 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => (
                      <tr key={subject.id}>
                        <td className="py-2 px-4 border">
                          {editingSubjectId === subject.id ? (
                            <Input
                              value={editingSubjectName}
                              onChange={e => setEditingSubjectName(e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            subject.name
                          )}
                        </td>
                        <td className="py-2 px-4 border space-x-2">
                          {editingSubjectId === subject.id ? (
                            <>
                              <Button size="sm" onClick={handleUpdateSubject}>Save</Button>
                              <Button size="sm" variant="secondary" onClick={() => setEditingSubjectId(null)}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="secondary" onClick={() => handleEditSubject(subject.id!, subject.name)}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteSubject(subject.id!)}>Delete</Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} className="px-8" disabled={isSaving}>
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}