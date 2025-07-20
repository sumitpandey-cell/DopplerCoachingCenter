import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const snap = await adminDb.collection('tests').get();
    const tests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
} 