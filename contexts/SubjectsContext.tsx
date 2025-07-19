"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSubjects } from "@/firebase/subjects";

export type Subject = {
  id: string;
  name: string;
  // Add other fields if needed
};

interface SubjectsContextType {
  subjects: Subject[];
  loading: boolean;
  refreshSubjects: () => Promise<void>;
}

const SubjectsContext = createContext<SubjectsContextType>({
  subjects: [],
  loading: true,
  refreshSubjects: async () => {},
});

export const useSubjects = () => useContext(SubjectsContext);

export const SubjectsProvider = ({ children }: { children: React.ReactNode }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getSubjects(false);
      setSubjects(data);
    } catch (e) {
      setSubjects([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <SubjectsContext.Provider value={{ subjects, loading, refreshSubjects: fetchSubjects }}>
      {children}
    </SubjectsContext.Provider>
  );
}; 