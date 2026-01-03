'use server';

/**
 * Email Service - AMU Platform
 *
 * Sends transactional emails for karma notifications, payout updates,
 * and other system notifications.
 *
 * Supports multiple providers:
 * - Resend (recommended for modern apps)
 * - SendGrid
 * - SMTP (fallback)
 *
 * Configure via environment variables:
 * - EMAIL_PROVIDER: 'resend' | 'sendgrid' | 'smtp'
 * - RESEND_API_KEY: Resend API key
 * - SENDGRID_API_KEY: SendGrid API key
 * - EMAIL_FROM: Sender email address
 * - EMAIL_FROM_NAME: Sender name
 */

import type {
  SendEmailResult,
  KarmaEarnedEmailData,
  KarmaPayoutRequestedEmailData,
  KarmaPayoutCompletedEmailData,
  ReferralSignupEmailData,
  CorporateInvitationEmailData,
} from './types';

import {
  karmaEarnedTemplate,
  karmaPayoutRequestedTemplate,
  karmaPayoutCompletedTemplate,
  referralSignupTemplate,
  corporateInvitationTemplate,
} from './templates';

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@assetmanagementuniversity.org';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Asset Management University';
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';

/**
 * Send an email using the configured provider
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendEmailResult> {
  try {
    // Check if email is configured
    if (!process.env.RESEND_API_KEY && !process.env.SENDGRID_API_KEY) {
      console.log('[Email] No email provider configured. Would send:', {
        to,
        subject,
        preview: text.substring(0, 100) + '...',
      });
      return {
        success: true,
        messageId: 'dev-mode-' + Date.now(),
      };
    }

    if (EMAIL_PROVIDER === 'resend' && process.env.RESEND_API_KEY) {
      return await sendWithResend(to, subject, html, text);
    }

    if (EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      return await sendWithSendGrid(to, subject, html, text);
    }

    // Fallback: log the email
    console.log('[Email] No valid provider configured. Email not sent:', { to, subject });
    return {
      success: false,
      error: 'No email provider configured',
    };
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email using Resend
 */
async function sendWithResend(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendEmailResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.message || `Resend API error: ${response.status}`,
    };
  }

  const data = await response.json();
  return {
    success: true,
    messageId: data.id,
  };
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendEmailResult> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    return {
      success: false,
      error: `SendGrid API error: ${response.status} ${errorText}`,
    };
  }

  // SendGrid returns 202 with no body on success
  const messageId = response.headers.get('X-Message-Id') || `sg-${Date.now()}`;
  return {
    success: true,
    messageId,
  };
}

// ============================================
// Karma Email Functions
// ============================================

/**
 * Send karma earned notification email
 */
export async function sendKarmaEarnedEmail(
  toEmail: string,
  toName: string,
  amount: number,
  currency: string,
  tier: 1 | 2,
  purchaserName: string,
  courseTitle: string,
  newBalance: number
): Promise<SendEmailResult> {
  const emailData: KarmaEarnedEmailData = {
    to: toEmail,
    toName,
    subject: '', // Will be set by template
    template: 'karma_earned',
    data: {
      amount,
      currency,
      tier,
      purchaserName,
      courseTitle,
      newBalance,
    },
  };

  const { subject, html, text } = karmaEarnedTemplate(emailData);
  return await sendEmail(toEmail, subject, html, text);
}

/**
 * Send payout requested notification email
 */
export async function sendPayoutRequestedEmail(
  toEmail: string,
  toName: string,
  amount: number,
  currency: string,
  payoutId: string
): Promise<SendEmailResult> {
  const emailData: KarmaPayoutRequestedEmailData = {
    to: toEmail,
    toName,
    subject: '',
    template: 'karma_payout_requested',
    data: {
      amount,
      currency,
      payoutId,
    },
  };

  const { subject, html, text } = karmaPayoutRequestedTemplate(emailData);
  return await sendEmail(toEmail, subject, html, text);
}

/**
 * Send payout completed notification email
 */
export async function sendPayoutCompletedEmail(
  toEmail: string,
  toName: string,
  amount: number,
  currency: string,
  payoutId: string,
  transferId: string
): Promise<SendEmailResult> {
  const emailData: KarmaPayoutCompletedEmailData = {
    to: toEmail,
    toName,
    subject: '',
    template: 'karma_payout_completed',
    data: {
      amount,
      currency,
      payoutId,
      transferId,
    },
  };

  const { subject, html, text } = karmaPayoutCompletedTemplate(emailData);
  return await sendEmail(toEmail, subject, html, text);
}

/**
 * Send referral signup notification email
 */
export async function sendReferralSignupEmail(
  toEmail: string,
  toName: string,
  referredName: string,
  referralCode: string
): Promise<SendEmailResult> {
  const emailData: ReferralSignupEmailData = {
    to: toEmail,
    toName,
    subject: '',
    template: 'referral_signup',
    data: {
      referredName,
      referralCode,
    },
  };

  const { subject, html, text } = referralSignupTemplate(emailData);
  return await sendEmail(toEmail, subject, html, text);
}

// ============================================
// Corporate Email Functions
// ============================================

/**
 * Send corporate invitation email to prospective employee
 */
export async function sendCorporateInvitationEmail(
  toEmail: string,
  companyName: string,
  companyCode: string,
  inviterName: string
): Promise<SendEmailResult> {
  const signupUrl = `https://assetmanagementuniversity.org/signup?company=${companyCode}`;

  const emailData: CorporateInvitationEmailData = {
    to: toEmail,
    toName: '',
    subject: '',
    template: 'corporate_invitation',
    data: {
      companyName,
      companyCode,
      inviterName,
      signupUrl,
    },
  };

  const { subject, html, text } = corporateInvitationTemplate(emailData);
  return await sendEmail(toEmail, subject, html, text);
}

/**
 * Send bulk corporate invitations
 * Returns a summary of successful and failed sends
 */
export async function sendBulkCorporateInvitations(
  emails: string[],
  companyName: string,
  companyCode: string,
  inviterName: string
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const results = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  for (const email of emails) {
    const result = await sendCorporateInvitationEmail(
      email,
      companyName,
      companyCode,
      inviterName
    );

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({ email, error: result.error || 'Unknown error' });
    }
  }

  results.success = results.failed === 0;
  return results;
}
