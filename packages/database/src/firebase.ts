/**
 * Firebase re-exports for compatibility
 * This file provides a consistent interface for firebase-admin
 */

import { getFirestore } from './config/firebase-admin';

// Export the Firestore db instance
export const db = getFirestore();
