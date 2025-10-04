
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';
import { firebaseConfig } from './firebase-config'; // Import the centralized config

// Initialize Firebase with the imported config
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

// It's safe to check for window here because this module will only be imported
// in client-side components. The service worker has its own initialization.
const messaging = (typeof window !== "undefined") ? getMessaging(app) : undefined;

export { app, auth, db, messaging };
