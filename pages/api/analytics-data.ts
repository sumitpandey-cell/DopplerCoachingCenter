import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [testResultsSnap, materialsSnap, announcementsSnap] = await Promise.all([
      adminDb.collection('testResults').get(),
      adminDb.collection('studyMaterials').get(),
      adminDb.collection('announcements').get(),
    ]);
    const testResults = testResultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const materials = materialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const announcements = announcementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ testResults, materials, announcements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
} 