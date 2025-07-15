'use client';

import React, { useEffect, useState } from 'react';
import { getTimetable, TimetableEntry } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Search, Plus, Edit, Trash2, Clock, MapPin, User } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminTimetables() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [filteredTimetable, setFilteredTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  const [newEntry, setNewEntry] = useState({
    subject: '',
    time: '',
    day: '',
    faculty: '',
    room: '',
  });

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await getTimetable();
        setTimetable(data);
        setFilteredTimetable(data);
      } catch (error) {
        console.error('Error fetching timetable:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  useEffect(() => {
    let filtered = timetable;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dayFilter !== 'all') {
      filtered = filtered.filter(entry => entry.day === dayFilter);
    }

    setFilteredTimetable(filtered);
  }, [timetable, searchTerm, dayFilter]);

  const handleAddEntry = () => {
    const entry: TimetableEntry = {
      id: `TT${Date.now()}`,
      ...newEntry,
    };

    setTimetable(prev => [...prev, entry]);
    setNewEntry({
      subject: '',
      time: '',
      day: '',
      faculty: '',
      room: '',
    });
    setShowAddModal(false);
  };

  const handleEditEntry = (entry: TimetableEntry) => {
    setEditingEntry(entry);
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;

    setTimetable(prev =>
      prev.map(e => e.id === editingEntry.id ? editingEntry : e)
    );
    setEditingEntry(null);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
      setTimetable(prev => prev.filter(e => e.id !== entryId));
    }
  };

  const groupedTimetable = daysOfWeek.reduce((acc, day) => {
    acc[day] = filteredTimetable
      .filter(entry => entry.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Timetable Management</h1>
            <p className="text-gray-600">Manage class schedules and timetables</p>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogDescription>Schedule a new class session</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={newEntry.subject}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="day">Day</Label>
                    <select
                      id="day"
                      value={newEntry.day}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, day: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Day</option>
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEntry.time}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input
                    id="faculty"
                    value={newEntry.faculty}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, faculty: e.target.value }))}
                    placeholder="Enter faculty name"
                  />
                </div>
                <div>
                  <Label htmlFor="room">Room/Location</Label>
                  <Input
                    id="room"
                    value={newEntry.room}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, room: e.target.value }))}
                    placeholder="Enter room number or location"
                  />
                </div>
                <Button onClick={handleAddEntry} className="w-full">
                  Add Class
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
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Days</option>
          {daysOfWeek.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold">{timetable.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="text-2xl font-bold">{new Set(timetable.map(t => t.subject)).size}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Faculty</p>
                <p className="text-2xl font-bold">{new Set(timetable.map(t => t.faculty)).size}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rooms</p>
                <p className="text-2xl font-bold">{new Set(timetable.map(t => t.room)).size}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {daysOfWeek.map((day) => (
          <Card key={day} className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {day}
              </CardTitle>
              <CardDescription>
                {groupedTimetable[day].length} classes scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupedTimetable[day].length > 0 ? (
                <div className="space-y-3">
                  {groupedTimetable[day].map((entry) => (
                    <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{entry.subject}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{entry.time}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {entry.faculty}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {entry.room}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No classes scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>Update class information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-subject">Subject</Label>
                <select
                  id="edit-subject"
                  value={editingEntry.subject}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, subject: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-day">Day</Label>
                  <select
                    id="edit-day"
                    value={editingEntry.day}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, day: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingEntry.time}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, time: e.target.value } : null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-faculty">Faculty</Label>
                <Input
                  id="edit-faculty"
                  value={editingEntry.faculty}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, faculty: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-room">Room/Location</Label>
                <Input
                  id="edit-room"
                  value={editingEntry.room}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, room: e.target.value } : null)}
                />
              </div>
              <Button onClick={handleUpdateEntry} className="w-full">
                Update Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}