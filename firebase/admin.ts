import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

if (!getApps().length) {
  // Check if required environment variables are present
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin SDK environment variables:');
    console.error('- FIREBASE_PROJECT_ID:', !!projectId);
    console.error('- FIREBASE_CLIENT_EMAIL:', !!clientEmail);
    console.error('- FIREBASE_PRIVATE_KEY:', !!privateKey);
    throw new Error('Firebase Admin SDK credentials not found in environment variables. Please check your .env.local file.');
  }

  // Properly format the private key for Firebase Admin SDK
  // Remove any surrounding quotes and handle newline characters
  const formattedPrivateKey = privateKey
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\\n/g, '\n') // Convert \\n to actual newlines
    .trim();

  console.log('Firebase Admin SDK initialization details:');
  console.log('- Project ID:', projectId);
  console.log('- Client Email:', clientEmail);
  console.log('- Private Key Length:', formattedPrivateKey.length);
  console.log('- Private Key Starts With:', formattedPrivateKey.substring(0, 30) + '...');

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: formattedPrivateKey,
    }),
  });
  
  console.log('Firebase Admin SDK initialized successfully with environment variables');
} else {
  adminApp = getApps()[0];
  console.log('Firebase Admin SDK already initialized, reusing existing instance');
}

export const adminDb = getFirestore(adminApp);
export default adminApp; 