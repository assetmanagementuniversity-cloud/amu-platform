/**
 * Email Types - AMU Platform
 *
 * Types for email notifications including karma rewards,
 * certificates, and system notifications.
 */

/**
 * Email template types
 */
export type EmailTemplate =
  | 'karma_earned'
  | 'karma_payout_requested'
  | 'karma_payout_completed'
  | 'referral_signup'
  | 'corporate_invitation'
  | 'welcome'
  | 'seta_enrolment_confirmed'
  | 'verification_action_required'
  | 'verification_received';

/**
 * Base email data
 */
export interface EmailData {
  to: string;
  toName: string;
  subject: string;
  template: EmailTemplate;
}

/**
 * Karma earned email data
 */
export interface KarmaEarnedEmailData extends EmailData {
  template: 'karma_earned';
  data: {
    amount: number;
    currency: string;
    tier: 1 | 2;
    purchaserName: string;
    courseTitle: string;
    newBalance: number;
  };
}

/**
 * Karma payout requested email data
 */
export interface KarmaPayoutRequestedEmailData extends EmailData {
  template: 'karma_payout_requested';
  data: {
    amount: number;
    currency: string;
    payoutId: string;
  };
}

/**
 * Karma payout completed email data
 */
export interface KarmaPayoutCompletedEmailData extends EmailData {
  template: 'karma_payout_completed';
  data: {
    amount: number;
    currency: string;
    payoutId: string;
    transferId: string;
  };
}

/**
 * Referral signup email data
 */
export interface ReferralSignupEmailData extends EmailData {
  template: 'referral_signup';
  data: {
    referredName: string;
    referralCode: string;
  };
}

/**
 * Corporate invitation email data
 */
export interface CorporateInvitationEmailData extends EmailData {
  template: 'corporate_invitation';
  data: {
    companyName: string;
    companyCode: string;
    inviterName: string;
    signupUrl: string;
  };
}

/**
 * SETA enrolment confirmed email data (Section 23.3)
 */
export interface SETAEnrolmentConfirmedEmailData extends EmailData {
  template: 'seta_enrolment_confirmed';
  data: {
    learnerName: string;
    setaLearnerNumber?: string;
    verificationDate: string;
    companyName?: string;
  };
}

/**
 * Verification action required email data
 */
export interface VerificationActionRequiredEmailData extends EmailData {
  template: 'verification_action_required';
  data: {
    learnerName: string;
    issueCount: number;
    editUrl: string;
  };
}

/**
 * Verification received email data
 */
export interface VerificationReceivedEmailData extends EmailData {
  template: 'verification_received';
  data: {
    learnerName: string;
    submissionDate: string;
  };
}

/**
 * Union of all email data types
 */
export type AnyEmailData =
  | KarmaEarnedEmailData
  | KarmaPayoutRequestedEmailData
  | KarmaPayoutCompletedEmailData
  | ReferralSignupEmailData
  | CorporateInvitationEmailData
  | SETAEnrolmentConfirmedEmailData
  | VerificationActionRequiredEmailData
  | VerificationReceivedEmailData;

/**
 * Result of sending an email
 */
export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
