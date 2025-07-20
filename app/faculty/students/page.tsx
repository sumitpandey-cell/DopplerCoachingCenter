'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentsByFacultySubjects, getFacultyProfileByUID, StudentAccount } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, Mail, Phone, GraduationCap, User, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentDisplayData {
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  courses: string[];
  batches: string[];
  subjects: string[];
  createdAt: Date;
}

export default function Students() {
  const { user, userProfile } = useAuth();
  const [students, setStudents] = useState<StudentDisplayData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [facultySubjects, setFacultySubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchFacultyStudents = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        
        // Get faculty profile to get assigned subjects
        const facultyProfile = await getFacultyProfileByUID(user.uid);
        
        if (!facultyProfile) {
          console.error('Faculty profile not found');
          return;
        }

        setFacultySubjects(facultyProfile.subjects || []);

        if (facultyProfile.subjects && facultyProfile.subjects.length > 0) {
          // Get students for faculty's subjects
          const studentAccounts = await getStudentsByFacultySubjects(facultyProfile.subjects);
          
          // Transform data for display
          const displayData: StudentDisplayData[] = studentAccounts.map(student => ({
            studentId: student.studentId,
            fullName: student.fullName,
            email: student.email,
            phone: student.phone,
            courses: student.courses || [],
            batches: student.batches || [],
            subjects: student.subjects || [],
            createdAt: student.createdAt
          }));

          setStudents(displayData);
          setFilteredStudents(displayData);
        } else {
          setStudents([]);
          setFilteredStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyStudents();
  }, [user]);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Students
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Students enrolled in your subjects: {facultySubjects.join(', ')}
        </p>
      </motion.div>

      {/* Search */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Students Count */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found</span>
      </div>
      </motion.div>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.studentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {student.fullName}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          ID: {student.studentId}
                        </CardDescription>
                      </div>
                    </div>
                </div>
              </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{student.phone}</span>
                    </div>
                  </div>
                  
                  {/* Courses */}
                  {student.courses.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <GraduationCap className="h-4 w-4" />
                        <span>Courses</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {student.courses.slice(0, 3).map((course) => (
                          <Badge key={course} variant="secondary" className="text-xs">
                            {course}
                          </Badge>
                        ))}
                        {student.courses.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{student.courses.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Batches */}
                  {student.batches.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Users className="h-4 w-4" />
                        <span>Batches</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {student.batches.slice(0, 2).map((batch) => (
                          <Badge key={batch} variant="outline" className="text-xs">
                            {batch}
                          </Badge>
                        ))}
                        {student.batches.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{student.batches.length - 2} more
                          </Badge>
                        )}
                    </div>
                  </div>
                  )}

                  {/* Enrolled Subjects */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <BookOpen className="h-4 w-4" />
                      <span>Enrolled Subjects</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.slice(0, 3).map((subject) => (
                        <Badge 
                          key={subject} 
                          variant={facultySubjects.includes(subject) ? "default" : "outline"}
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                      {student.subjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.subjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Enrollment Date */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enrolled: {student.createdAt.toLocaleDateString()}
                    </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? 'No students found' : 'No students enrolled'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : facultySubjects.length > 0 
                ? 'Students will appear here once they enroll in your subjects'
                : 'No subjects assigned. Please contact admin to assign subjects.'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}