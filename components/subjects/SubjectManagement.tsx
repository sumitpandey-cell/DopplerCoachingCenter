'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Users, Clock, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { addSubject, deleteSubject, fetchSubjects } from '@/app/store';
import { Subject } from '@/firebase/subjects';

export default function SubjectManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: subjects, status } = useSelector((state: RootState) => state.subjects);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    description: '',
    faculty: '',
    schedule: [{
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      room: ''
    }],
    isActive: true,
    addDropDeadline: ''
  });

  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.code) {
      toast({
        title: 'Error',
        description: 'Subject name and code are required.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await dispatch(addSubject({
        ...newSubject,
        addDropDeadline: new Date(newSubject.addDropDeadline)
      })).unwrap();
      setNewSubject({
        name: '', code: '', description: '', credits: 3, maxCapacity: 30, prerequisites: [], faculty: '', schedule: [{ day: 'Monday', startTime: '09:00', endTime: '10:30', room: '' }], isActive: true, addDropDeadline: ''
      });
      setShowAddDialog(false);
      toast({
        title: 'Success',
        description: 'Subject added successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subject.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    setDeletingId(id);
    try {
      await dispatch(deleteSubject(id)).unwrap();
      toast({
        title: 'Success',
        description: 'Subject deleted successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subject.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const addScheduleSlot = () => {
    setNewSubject(prev => ({
      ...prev,
      schedule: [...prev.schedule, {
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        room: ''
      }]
    }));
  };

  const updateScheduleSlot = (index: number, field: string, value: string) => {
    setNewSubject(prev => ({
      ...prev,
      schedule: prev.schedule.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const removeScheduleSlot = (index: number) => {
    setNewSubject(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Subject Management
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                  <DialogDescription>
                    Create a new subject for student enrollment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Subject Name</Label>
                      <Input
                        id="name"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Advanced Mathematics"
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Subject Code</Label>
                      <Input
                        id="code"
                        value={newSubject.code}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="e.g., MATH301"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSubject.description}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Subject description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-0">
                    <div>
                      <Label htmlFor="faculty">Faculty</Label>
                      <Input
                        id="faculty"
                        value={newSubject.faculty}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, faculty: e.target.value }))}
                        placeholder="Faculty name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addDropDeadline">Add/Drop Deadline</Label>
                    <Input
                      id="addDropDeadline"
                      type="date"
                      value={newSubject.addDropDeadline}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, addDropDeadline: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Schedule</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Slot
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {newSubject.schedule.map((slot, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 items-end">
                          <div>
                            <Label className="text-xs">Day</Label>
                            <select
                              value={slot.day}
                              onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs">Start</Label>
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">End</Label>
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Room</Label>
                            <Input
                              value={slot.room}
                              onChange={(e) => updateScheduleSlot(index, 'room', e.target.value)}
                              placeholder="Room"
                              className="text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeScheduleSlot(index)}
                            disabled={newSubject.schedule.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddSubject} className="w-full">
                    Create Subject
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Found</h3>
              <p className="text-gray-500">Create your first subject to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card key={subject.id} className="border rounded-lg bg-white hover:shadow p-2 flex flex-col justify-between min-h-[90px]">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-base text-blue-900 leading-tight">{subject.name}</h3>
                      <span className="text-[11px] text-gray-500">{subject.code}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-100 p-1"
                      onClick={() => handleDeleteSubject(subject.id)}
                      disabled={deletingId === subject.id}
                      title="Delete Subject"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="font-medium">Faculty:</span>
                    <span>{subject.faculty}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}