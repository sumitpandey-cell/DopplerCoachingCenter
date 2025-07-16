import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default async function handler(req, res) {
  try {
    const snap = await getDocs(collection(db, 'studentAccounts'));
    let updated = 0;
    for (const d of snap.docs) {
      const data = d.data();
      let update = {};
      if (typeof data.course === 'string' && !Array.isArray(data.courses)) update.courses = [data.course];
      if (typeof data.batch === 'string' && !Array.isArray(data.batches)) update.batches = [data.batch];
      if (Object.keys(update).length) {
        await updateDoc(doc(db, 'studentAccounts', d.id), update);
        updated++;
      }
    }
    res.status(200).json({ message: `Migration complete. Updated ${updated} students.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} 