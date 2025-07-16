"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFeeStructures } from "@/firebase/fees";
import { getDocs, collection, writeBatch, doc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function BulkFeeAssignment() {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedFee, setSelectedFee] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentCourseBatch, setStudentCourseBatch] = useState<Record<string, { course: string; batch: string }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFeeStructures().then(setFeeStructures);
    // Fetch students from Firestore
    getDocs(collection(db, "studentAccounts")).then((snap) =>
      setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
  }, []);

  const handleAssign = async () => {
    if (!selectedFee || selectedStudents.length === 0) return;
    setLoading(true);
    const fee = feeStructures.find((f) => f.id === selectedFee);
    const batch = writeBatch(db);

    selectedStudents.forEach((studentId) => {
      const ref = doc(collection(db, "studentFees"));
      const { course, batch: batchName } = studentCourseBatch[studentId] || {};
      batch.set(ref, {
        studentId,
        feeStructureId: fee.id,
        name: fee.name,
        amount: fee.amount,
        dueDate: Timestamp.now(), // Set as needed
        status: "pending",
        paidAmount: 0,
        remainingAmount: fee.amount,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        course: course || '',
        batch: batchName || '',
      });
    });

    await batch.commit();
    setLoading(false);
    setSelectedStudents([]);
    setStudentCourseBatch({});
    alert("Fees assigned successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Fee Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label>Fee Structure:</label>
          <select
            value={selectedFee}
            onChange={(e) => setSelectedFee(e.target.value)}
            className="ml-2 border rounded px-2 py-1"
          >
            <option value="">Select Fee</option>
            {feeStructures.map((fee) => (
              <option key={fee.id} value={fee.id}>
                {fee.name} (₹{fee.amount})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label>Select Students and Assign Course/Batch:</label>
          <div className="max-h-60 overflow-y-auto border rounded p-2">
            {students.map((student) => (
              <div key={student.id} className="mb-2 border-b pb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      setSelectedStudents((prev) =>
                        e.target.checked
                          ? [...prev, student.id]
                          : prev.filter((id) => id !== student.id)
                      );
                    }}
                  />
                  <span>{student.name || student.id}</span>
                </label>
                {selectedStudents.includes(student.id) && (
                  <div className="flex gap-4 mt-1 ml-6">
                    <div>
                      <label className="block text-xs">Course:</label>
                      <select
                        value={studentCourseBatch[student.id]?.course || ''}
                        onChange={e => setStudentCourseBatch(prev => ({
                          ...prev,
                          [student.id]: {
                            ...prev[student.id],
                            course: e.target.value
                          }
                        }))}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">Select Course</option>
                        {(student.courses || []).map((c: string) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs">Batch:</label>
                      <select
                        value={studentCourseBatch[student.id]?.batch || ''}
                        onChange={e => setStudentCourseBatch(prev => ({
                          ...prev,
                          [student.id]: {
                            ...prev[student.id],
                            batch: e.target.value
                          }
                        }))}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">Select Batch</option>
                        {(student.batches || []).map((b: string) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleAssign} disabled={loading || !selectedFee || selectedStudents.length === 0}>
          {loading ? "Assigning..." : "Assign Fee to Selected Students"}
        </Button>
      </CardContent>
    </Card>
  );
} 