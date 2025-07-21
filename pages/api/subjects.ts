import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const snapshot = await adminDb.collection('subjects').get();
      const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(subjects);
    } else if (req.method === 'POST') {
      const { subject } = req.body;
      if (!subject) {
        return res.status(400).json({ error: 'Missing subject data' });
      }
      const { id, ...newSubject } = subject;
      const docRef = await adminDb.collection('subjects').add(newSubject);
      res.status(201).json({ id: docRef.id });
    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing subject ID' });
      }
      await adminDb.collection('subjects').doc(id).delete();
      res.status(200).json({ success: true });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
}
