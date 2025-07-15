'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Search, Plus, Edit, Trash2, Calendar, User, MapPin, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'class' | 'exam' | 'meeting' | 'event';
  startTime: Date;
  endTime: Date;
  faculty: string;
  room: string;
  description: string;
  attendees: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export default function AdminScheduling() {
  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: '1',
      title: 'Physics Lecture - Mechanics',
      type: 'class',
      startTime: new Date(2024, 11, 25, 9, 0),
      endTime: new Date(2024, 11, 25, 10, 30),
      faculty: 'Dr. Rajesh Kumar',
      room: 'Room 101',
      description: 'Introduction to Mechanics and Newton\'s Laws',
      attendees: 45,
      status: 'scheduled',
    },
    {
      id: '2',
      title: 'Mathematics Test',
      type: 'exam',
      startTime: new Date(2024, 11, 26, 14, 0),
      endTime: new Date(2024, 11, 26, 16, 0),
      faculty: 'Prof. Priya Sharma',
      room: 'Exam Hall A',
      description: 'Algebra and Trigonometry Test',
      attendees: 38,
      status: 'scheduled',
    },
    {
      id: '3',
      title: 'Faculty Meeting',
      type: 'meeting',
      startTime: new Date(2024, 11, 27, 11, 0),
      endTime: new Date(2024, 11, 27, 12, 0),
      faculty: 'All Faculty',
      room: 'Conference Room',
      description: 'Monthly faculty meeting to discuss curriculum updates',
      attendees: 12,
      status: 'scheduled',
    },
  ]);

  const [filteredEvents, setFilteredEvents] = useState<ScheduleEvent[]>(events);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'class' as const,
    startTime: '',
    endTime: '',
    faculty: '',
    room: '',
    description: '',
    attendees: 0,
  });

  React.useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, typeFilter]);

  const handleAddEvent = () => {
    const event: ScheduleEvent = {
      id: `EVT${Date.now()}`,
      ...newEvent,
      startTime: new Date(newEvent.startTime),
      endTime: new Date(newEvent.endTime),
      status: 'scheduled',
    };

    setEvents(prev => [...prev, event]);
    setNewEvent({
      title: '',
      type: 'class',
      startTime: '',
      endTime: '',
      faculty: '',
      room: '',
      description: '',
      attendees: 0,
    });
    setShowAddModal(false);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent) return;

    setEvents(prev =>
      prev.map(e => e.id === editingEvent.id ? editingEvent : e)
    );
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'class':
        return <Badge variant="default">Class</Badge>;
      case 'exam':
        return <Badge variant="destructive">Exam</Badge>;
      case 'meeting':
        return <Badge variant="secondary">Meeting</Badge>;
      case 'event':
        return <Badge variant="outline">Event</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'ongoing':
        return <Badge variant="default">Ongoing</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Scheduling</h1>
            <p className="text-gray-600">Schedule and manage classes, exams, and events</p>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Event</DialogTitle>
                <DialogDescription>Create a new class, exam, meeting, or event</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="class">Class</option>
                    <option value="exam">Exam</option>
                    <option value="meeting">Meeting</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="faculty">Faculty/Instructor</Label>
                    <Input
                      id="faculty"
                      value={newEvent.faculty}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, faculty: e.target.value }))}
                      placeholder="Enter faculty name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room">Room/Location</Label>
                    <Input
                      id="room"
                      value={newEvent.room}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, room: e.target.value }))}
                      placeholder="Enter room or location"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="attendees">Expected Attendees</Label>
                  <Input
                    id="attendees"
                    type="number"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, attendees: parseInt(e.target.value) || 0 }))}
                    placeholder="Number of attendees"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddEvent} className="w-full">
                  Schedule Event
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
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Types</option>
          <option value="class">Classes</option>
          <option value="exam">Exams</option>
          <option value="meeting">Meetings</option>
          <option value="event">Events</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Classes</p>
                <p className="text-2xl font-bold">{events.filter(e => e.type === 'class').length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Exams</p>
                <p className="text-2xl font-bold">{events.filter(e => e.type === 'exam').length}</p>
              </div>
              <Bell className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => {
                    const now = new Date();
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return e.startTime >= now && e.startTime <= weekFromNow;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(event.startTime, 'MMM dd, yyyy • h:mm a')} - {format(event.endTime, 'h:mm a')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeBadge(event.type)}
                    {getStatusBadge(event.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700">{event.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {event.faculty}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.room}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {Math.round((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60))} minutes
                    </span>
                    <span>Attendees: {event.attendees}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Schedule your first event to get started'
            }
          </p>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>Update event information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <select
                  id="edit-type"
                  value={editingEvent.type}
                  onChange={(e) => setEditingEvent(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="class">Class</option>
                  <option value="exam">Exam</option>
                  <option value="meeting">Meeting</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-faculty">Faculty/Instructor</Label>
                  <Input
                    id="edit-faculty"
                    value={editingEvent.faculty}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, faculty: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-room">Room/Location</Label>
                  <Input
                    id="edit-room"
                    value={editingEvent.room}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, room: e.target.value } : null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={editingEvent.status}
                  onChange={(e) => setEditingEvent(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <Button onClick={handleUpdateEvent} className="w-full">
                Update Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}