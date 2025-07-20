'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FacultySidebar from '@/components/FacultySidebar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';
import { addNotification, getStudentByStudentId } from '@/firebase/firestore';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";

// Fetch all students with a given subject
export const getAllStudentsWithSubject = async (subject: string) => {
  // You may need to implement this with a Firestore query
  // Example:
  const studentsSnapshot = await getDocs(
    query(collection(db, 'studentAccounts'), where('subjects', 'array-contains', subject))
  );
  return studentsSnapshot.docs.map(doc => ({ studentId: doc.data().studentId, ...doc.data() }));
};

// Send a notification to all students with a subject
export const notifyStudentsBySubject = async ({
  subject,
  title,
  description,
  type = 'announcement'
}: {
  subject: string;
  title: string;
  description: string;
  type?: string;
}) => {
  const students = await getAllStudentsWithSubject(subject);
  const now = new Date();
  for (const student of students) {
    await addNotification({
      studentId: student.studentId,
      title,
      description,
      createdAt: now,
      isRead: false,
      type,
    });
  }
};

export function useStudentMaterials(studentSubjects) {
  const [materials, setMaterials] = useState([]);
  useEffect(() => {
    if (!studentSubjects || studentSubjects.length === 0) {
      setMaterials([]);
      return;
    }
    // Firestore 'in' query supports up to 10 subjects
    const q = query(
      collection(db, "studyMaterials"),
      where("subject", "in", studentSubjects)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [studentSubjects]);
  return materials;
}

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login/faculty');
      } else if (userProfile?.role !== 'faculty') {
        router.push('/');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'faculty') {
    return null;
  }

  return (
    <div className="flex">
      <FacultySidebar />
      <div className="flex-1 bg-gray-50 dark:bg-gray-950">
        <Suspense fallback={<LoaderOverlay />}>{children}</Suspense>
        {/* Floating Profile Button */}
        <FloatingProfileButton userProfile={userProfile} />
      </div>
    </div>
  );
}

function FloatingProfileButton({ userProfile }: { userProfile: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        variant="outline"
        className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-white/90 hover:bg-blue-50 border-blue-200"
        onClick={() => setOpen((v) => !v)}
      >
        <User className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-gray-800">{userProfile?.name || 'Profile'}</span>
      </Button>
      {open && (
        <div className="mt-2 bg-white rounded-xl shadow-xl border border-blue-100 p-4 w-56 animate-fade-in">
          <div className="mb-2 text-gray-700 font-medium">{userProfile?.name}</div>
          <div className="mb-4 text-xs text-gray-500">{userProfile?.email}</div>
          <Link href="/faculty/profile" className="block text-blue-600 hover:underline mb-2">View Profile</Link>
          <Button variant="destructive" size="sm" className="w-full">Logout</Button>
        </div>
      )}
    </div>
  );
}