import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  });
}
const db = getFirestore();

async function migrateStudentFeesAddSubjectId() {
  const feesSnap = await db.collection('studentFees').get();
  let updatedCount = 0;

  for (const doc of feesSnap.docs) {
    const fee = doc.data();
    if (fee.subjectId) continue; // Already has subjectId

    let subjectId = null;

    // Try to infer from feeStructure
    if (fee.feeStructureId) {
      const feeStructureSnap = await db.collection('feeStructures').doc(fee.feeStructureId).get();
      if (feeStructureSnap.exists) {
        const feeStructure = feeStructureSnap.data();
        // If only one subject in applicableFor, use it
        if (Array.isArray(feeStructure.applicableFor) && feeStructure.applicableFor.length === 1) {
          subjectId = feeStructure.applicableFor[0];
        }
      }
    }

    // If still not found, try to infer from studentEnrollments
    if (!subjectId && fee.studentId) {
      const enrollmentsSnap = await db.collection('studentEnrollments')
        .where('studentId', '==', fee.studentId)
        .where('status', '==', 'enrolled')
        .get();
      if (!enrollmentsSnap.empty) {
        // Use the first enrollment's subjectId
        subjectId = enrollmentsSnap.docs[0].data().subjectId;
      }
    }

    if (subjectId) {
      await doc.ref.update({ subjectId });
      updatedCount++;
      console.log(`Updated fee ${doc.id} with subjectId ${subjectId}`);
    } else {
      console.warn(`Could not determine subjectId for fee ${doc.id}`);
    }
  }
  console.log(`Migration complete. Updated ${updatedCount} studentFees.`);
}

migrateStudentFeesAddSubjectId().catch(console.error); 