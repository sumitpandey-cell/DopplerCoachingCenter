"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FeeStructureForm from '@/components/fees/FeeStructureForm';
import BulkFeeAssignment from '@/components/fees/BulkFeeAssignment';
import { getFeeStructures } from '@/firebase/fees';

export default function FeeStructureManagementPage() {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    const structures = await getFeeStructures();
    setFeeStructures(structures);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Fee Structures</h1>
      <FeeStructureForm onSuccess={loadStructures} />
      <BulkFeeAssignment />
      <Card>
        <CardHeader>
          <CardTitle>Existing Fee Structures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeStructures.length === 0 && (
              <div className="text-center text-gray-500 py-8">No fee structures found</div>
            )}
            {feeStructures.map((structure) => (
              <div key={structure.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{structure.name}</h3>
                  <p className="text-sm text-gray-600">{structure.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={structure.type === 'monthly' ? 'default' : 'secondary'}>
                    {structure.type}
                  </Badge>
                  <span className="font-semibold">₹{structure.amount}</span>
                  <Badge variant={structure.isActive ? 'default' : 'destructive'}>
                    {structure.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 