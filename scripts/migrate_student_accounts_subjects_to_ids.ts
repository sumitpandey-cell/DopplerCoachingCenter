import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

if (!getApps().length) {
  initializeApp({
    credential: cert(process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
  });
}
const db = getFirestore();

async function migrateStudentAccountsSubjectsToIds() {
  const subjectsSnap = await db.collection('subjects').get();
  const nameToIdMap = new Map();
  subjectsSnap.docs.forEach(doc => {
    const data = doc.data();
    if (data.name) nameToIdMap.set(data.name, doc.id);
  });

  const studentsSnap = await db.collection('studentAccounts').get();
  let updatedCount = 0;

  for (const doc of studentsSnap.docs) {
    const student = doc.data();
    if (!Array.isArray(student.subjects) || student.subjects.length === 0) continue;
    // Only migrate if at least one subject is a name (not an ID)
    const newSubjects = student.subjects.map((nameOrId: string) => nameToIdMap.get(nameOrId) || nameOrId);
    if (JSON.stringify(newSubjects) !== JSON.stringify(student.subjects)) {
      await doc.ref.update({ subjects: newSubjects });
      updatedCount++;
      console.log(`Updated student ${doc.id}:`, newSubjects);
    }
  }
  console.log(`Migration complete. Updated ${updatedCount} studentAccounts.`);
}

migrateStudentAccountsSubjectsToIds().catch(console.error); 