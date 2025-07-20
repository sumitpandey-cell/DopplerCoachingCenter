import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const snapshot = await adminDb.collection('subjects').get();
    const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
} 