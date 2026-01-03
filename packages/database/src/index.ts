/**
 * @amu/database - Firestore database operations for AMU Platform
 */

// Firebase Admin configuration
export {
  initializeFirebaseAdmin,
  getFirestore,
  getAuth,
  getStorage,
  FieldValue,
  Timestamp,
  admin,
} from './config/firebase-admin';

// Collection operations
export * from './collections';
