'use client';

import React, { useEffect, useState } from 'react';
import { getTimetable, TimetableEntry } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Timetable() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await getTimetable();
        setTimetable(data);
      } catch (error) {
        console.error('Error fetching timetable:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const groupedTimetable = daysOfWeek.reduce((acc, day) => {
    acc[day] = timetable
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Timetable</h1>
        <p className="text-gray-600">Your weekly class schedule</p>
      </div>

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
                        <Badge variant="outline">{entry.time}</Badge>
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
    </div>
  );
}