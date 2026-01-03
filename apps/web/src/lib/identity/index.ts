// Identity Verification module exports

// Types
export * from './types';

// Server-side service
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

// SETA Digital Signatures (Section 7.1.4)
export {
  initiateSETASignatures,
  initiateTripartySignatures,
  handleSignRequestWebhook,
  checkSignatureStatus,
  resendSignatureRequest,
  SignRequestClient,
  getSignRequestClient,
} from './signatures';

export type {
  // SignRequest types
  SignRequestSigner,
  SignRequestPrefillTag,
  SignRequestResponse,
  SignRequestStatus,
  SignRequestSignerStatus,
  SignRequestWebhookEvent,
  SignRequestWebhookPayload,
  SignRequestConfig,
  // SETA document types (SETARegistrationRecord and SETARegistrationStatus from @amu/shared)
  SETARegistrationRecord,
  SETARegistrationStatus,
  SETADocumentPackage,
  SETAEnrolmentFormFields,
  SETATripartyAgreementFields,
  SignatureResult,
} from './signatures';
