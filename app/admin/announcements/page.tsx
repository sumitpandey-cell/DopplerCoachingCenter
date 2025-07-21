'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Search, Plus, Edit, Trash2, Calendar, User, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Loader, Skeleton } from '@/components/ui/loader';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { fetchAnnouncements, addAnnouncement, deleteAnnouncement } from '@/app/store';

function parseFirestoreDate(val: any): Date | null {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val.seconds === 'number') return new Date(val.seconds * 1000);
  if (typeof val._seconds === 'number') return new Date(val._seconds * 1000);
  // Try ISO string
  const iso = new Date(val);
  if (!isNaN(iso.getTime())) return iso;
  return null;
}

export default function AdminAnnouncements() {
  const dispatch = useDispatch<AppDispatch>();
  const announcementsState = useSelector((state: RootState) => state.announcements);
  const announcements = announcementsState.data;
  const loading = announcementsState.status === 'loading';

  const [filteredAnnouncements, setFilteredAnnouncements] = useState(announcements);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<'all' | 'today' | 'yesterday' | 'custom'>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    if (announcementsState.status === 'idle') {
      dispatch(fetchAnnouncements());
    }
  }, [dispatch, announcementsState.status]);

  useEffect(() => {
    let filtered = announcements;
    if (searchTerm) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (announcement.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(announcement => announcement.priority === priorityFilter);
    }
    // Date filter dropdown logic
    if (dateFilterType === 'today' || dateFilterType === 'yesterday' || (dateFilterType === 'custom' && filterDate)) {
      filtered = filtered.filter(announcement => {
        const date = parseFirestoreDate(announcement.createdAt);
        if (!date) return false;
        const now = new Date();
        let filter = null;
        if (dateFilterType === 'today') {
          filter = now;
        } else if (dateFilterType === 'yesterday') {
          filter = new Date(now);
          filter.setDate(now.getDate() - 1);
        } else if (dateFilterType === 'custom' && filterDate) {
          filter = new Date(filterDate);
        }
        if (!filter) return true;
        return (
          date.getFullYear() === filter.getFullYear() &&
          date.getMonth() === filter.getMonth() &&
          date.getDate() === filter.getDate()
        );
      });
    }
    setFilteredAnnouncements(filtered);
  }, [announcements, searchTerm, priorityFilter, dateFilterType, filterDate]);

  const handleAddAnnouncement = async () => {
    const announcement: Omit<any, 'id'> = {
      ...newAnnouncement,
      createdBy: 'Admin',
      createdAt: new Date(),
    };
    try {
      setButtonLoading(true);
      await dispatch(addAnnouncement(announcement)).unwrap();
    } catch (error) {
      console.error('Error adding announcement:', error);
    } finally {
      setButtonLoading(false);
    }
    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'medium',
    });
    setShowAddModal(false);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      dispatch(deleteAnnouncement(announcementId));
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      default:
        return <Badge variant="outline">Low Priority</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements Management</h1>
            <p className="text-gray-600">Create and manage announcements for students and faculty</p>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button loading={buttonLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>Share important information with students and faculty</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your announcement content here..."
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {newAnnouncement.content.length}/1000 characters
                  </p>
                </div>
                <Button loading={buttonLoading} onClick={handleAddAnnouncement} className="w-full">
                  Create Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
        <select
          value={dateFilterType}
          onChange={e => setDateFilterType(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="custom">Enter date...</option>
        </select>
        {dateFilterType === 'custom' && (
          <div>
            <Input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Filter by date"
          />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Announcements</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">{announcements.filter(a => a.priority === 'high').length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {announcements.filter(a => {
                    const now = new Date();
                    const announcementDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    return announcementDate.getMonth() === now.getMonth() && 
                           announcementDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">
                  {announcements.filter(a => {
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const announcementDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    return announcementDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getPriorityIcon(announcement.priority)}
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {(() => {
                          const date = parseFirestoreDate(announcement.createdAt);
                          return date ? format(date, 'MMM dd, yyyy • h:mm a') : 'Invalid date';
                        })()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(announcement.priority)}
                    <div className="flex space-x-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{announcement.content}</p>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    Posted by: {announcement.createdBy}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
          <p className="text-gray-500">
            {searchTerm || priorityFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first announcement to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
}