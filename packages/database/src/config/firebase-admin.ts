/**
 * Firebase Admin SDK configuration
 */

import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 * Call this once at application startup
 */
export function initializeFirebaseAdmin(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Check if running in a Google Cloud environment (auto-initialized)
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    firebaseApp = admin.initializeApp();
    return firebaseApp;
  }

  // Initialize with service account credentials
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials not found. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY environment variables.'
    );
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: `${projectId}.appspot.com`,
  });

  return firebaseApp;
}

/**
 * Get the Firestore database instance
 */
export function getFirestore(): admin.firestore.Firestore {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
}

/**
 * Get the Firebase Auth instance
 */
export function getAuth(): admin.auth.Auth {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
}

/**
 * Get the Cloud Storage bucket
 */
export function getStorage(): admin.storage.Storage {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.storage();
}

/**
 * Get Firestore FieldValue helpers
 */
export const FieldValue = admin.firestore.FieldValue;

/**
 * Get Firestore Timestamp
 */
export const Timestamp = admin.firestore.Timestamp;

export { admin };
