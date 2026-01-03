// Referrals module exports
export * from './types';
export {
  validateReferralCode,
  registerReferral,
  processPaymentCommission,
  getKarmaSummary,
  getReferralsList,
  getKarmaTransactions,
  requestPayout,
  getUserReferralCode,
  generateReferralLink,
} from './service';

// Fraud detection exports
export {
  recordSignupMetadata,
  recordPaymentFingerprint,
  detectReferralFraud,
  preCommissionFraudCheck,
  getPendingSuspensions,
  resolveSuspension,
  type FraudFlag,
  type FraudCheckResult,
  type FraudSeverity,
} from './fraud-detection';
