import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const snap = await adminDb.collection('announcements').get();
      const announcements = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(announcements);
    } else if (req.method === 'DELETE') {
      // Accept id from query or body
      const id = req.query.id || req.body.id;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid announcement ID' });
      }
      await adminDb.collection('announcements').doc(id).delete();
      res.status(200).json({ success: true });
    } else if (req.method === 'POST') {
      const { announcement } = req.body;
      if (!announcement) {
        return res.status(400).json({ error: 'Missing announcement data' });
      }
      const { id, ...newAnnouncement } = announcement;
      const docRef = await adminDb.collection('announcements').add(newAnnouncement);
      res.status(201).json({ id: docRef.id });
    } else {
      res.setHeader('Allow', ['GET', 'DELETE', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
} 