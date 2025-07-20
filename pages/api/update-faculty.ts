import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { id, updates } = req.body;
    await adminDb.collection('facultyAccounts').doc(id).update(updates);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update faculty' });
  }
} 