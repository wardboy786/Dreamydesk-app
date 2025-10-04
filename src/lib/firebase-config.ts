
// This is the public, client-side Firebase configuration object.
// It is used by the client-side Firebase SDKs.
// The VAPID key has been added here to centralize its access.
export const firebaseConfig = {
  apiKey: "AIzaSyAgtM5c8_zpSSkadjfu84emDffhvpSIN9Q",
  authDomain: "dreamydesk-fab2b.firebaseapp.com",
  databaseURL: "https://dreamydesk-fab2b-default-rtdb.firebaseio.com",
  projectId: "dreamydesk-fab2b",
  storageBucket: "dreamydesk-fab2b.firebasestorage.app",
  messagingSenderId: "807585192102",
  appId: "1:807585192102:web:2a28b8511d1499b83e3c67",
  measurementId: "G-R6QN41Y7L0",
};

// This is your VAPID key for web push notifications.
// It is a public key and is safe to be exposed on the client.
export const NEXT_PUBLIC_FCM_VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
