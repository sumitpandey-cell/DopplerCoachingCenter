import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyANRVPzRQRSPYsxz-3pXBNgPKV74wfe2Iw",
  authDomain: "myproject-3520c.firebaseapp.com",
  projectId: "myproject-3520c",
  storageBucket: "myproject-3520c.firebasestorage.app",
  messagingSenderId: "851220747268",
  appId: "1:851220747268:web:5be7b31828b07afc0f5151",
  measurementId: "G-CDX11R3W7E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;