import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subjectId, subjectName } = req.query;
  if (!subjectId && !subjectName) {
    return res.status(400).json({ 
      error: 'Missing subjectId or subjectName',
      message: 'Please provide either subjectId or subjectName as a query parameter',
      examples: [
        '/api/fees-by-subject?subjectId=eJddWpKaE6kvZPQTV5Km',
        '/api/fees-by-subject?subjectName=Biology'
      ]
    });
  }
  try {
    // Query by subjectId
    const feesByIdSnap = subjectId
      ? await adminDb.collection('studentFees').where('subjectId', '==', subjectId).get()
      : { docs: [] };
    // Query by subject name (for legacy data)
    const feesByNameSnap = subjectName
      ? await adminDb.collection('studentFees').where('subject', '==', subjectName).get()
      : { docs: [] };
    // Merge and deduplicate
    const feesMap = new Map();
    for (const doc of feesByIdSnap.docs) feesMap.set(doc.id, { id: doc.id, ...doc.data() });
    for (const doc of feesByNameSnap.docs) feesMap.set(doc.id, { id: doc.id, ...doc.data() });
    const fees = Array.from(feesMap.values());
    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
} 