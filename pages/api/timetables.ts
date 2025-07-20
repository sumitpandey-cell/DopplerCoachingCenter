import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const snap = await adminDb.collection('timetables').get();
    const timetables = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(timetables);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetables' });
  }
} 