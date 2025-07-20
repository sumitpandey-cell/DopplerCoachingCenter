import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { faculty } = req.body;
    const docRef = await adminDb.collection('facultyAccounts').add(faculty);
    res.status(200).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add faculty' });
  }
} 