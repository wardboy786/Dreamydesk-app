import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import * as admin from 'firebase-admin';

// --- Environment Variable Validation ---
// This is a critical step to ensure the server environment is set up correctly.
// We now expect a single, base64-encoded service account key.
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountBase64) {
    throw new Error(
        `Firebase Admin SDK initialization failed. The environment variable FIREBASE_SERVICE_ACCOUNT_BASE64 is missing. Please make sure it is set in your deployment environment.`
    );
}
// --- End Validation ---

// This guard ensures we don't try to initialize more than once.
let adminApp: App;

if (!getApps().length) {
  try {
    // Decode the base64 service account key and parse it as JSON
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'dreamydesk-fab2b.firebasestorage.app',
    });
  } catch (error) {
    console.error("Failed to parse or initialize Firebase Admin SDK from base64 credentials.", error);
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_BASE64 content. Ensure it is a valid, un-escaped JSON string encoded in Base64.");
  }
} else {
  adminApp = getApps()[0];
}


const db = getFirestore(adminApp);
const auth = getAuth(adminApp);
const messaging = getMessaging(adminApp);
const storage = admin.storage();

export { db, auth, messaging, storage, admin };
