// Identity Verification module exports
//
// NOTE: Server-only functions that use @amu/database (firebase-admin) are NOT
// exported here to avoid bundling Node.js code in client bundles. Import them
// directly from './signatures' in server components or API routes.

// Types
export * from './types';

// Server-side service (these use 'use server' directive and Firebase client SDK)
export {
  validateSAID,
  getDocumentUploadPath,
  recordDocumentUpload,
  submitVerification,
  getVerificationStatus,
  needsIdentityVerification,
  approveVerification,
  rejectVerification,
} from './service';

// Client-side upload
export {
  validateFile,
  uploadIdentityDocument,
  formatFileSize,
  getExtensionFromMimeType,
} from './upload';
export type { UploadProgress, UploadResult } from './upload';

// NOTE: SETA Digital Signatures (Section 7.1.4) runtime exports are NOT included
// here because they use @amu/database which requires firebase-admin (Node.js only).
// Import them directly in server components or API routes:
//   import { initiateSETASignatures } from '@/lib/identity/signatures';
