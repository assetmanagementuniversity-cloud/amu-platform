/**
 * Email Templates - AMU Platform
 *
 * HTML email templates for karma notifications and other system emails.
 * Styled with AMU brand colors (Navy Blue #0A2F5C, Sky Blue #D9E6F2).
 */

import type {
  KarmaEarnedEmailData,
  KarmaPayoutRequestedEmailData,
  KarmaPayoutCompletedEmailData,
  ReferralSignupEmailData,
  CorporateInvitationEmailData,
  SETAEnrolmentConfirmedEmailData,
  VerificationActionRequiredEmailData,
  VerificationReceivedEmailData,
} from './types';

/**
 * Base email wrapper with AMU branding
 */
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asset Management University</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0A2F5C; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Asset Management University
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                "I am because we are"
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #D9E6F2; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #0A2F5C; font-size: 14px;">
                Asset Management University
              </p>
              <p style="margin: 0; color: #64748B; font-size: 12px;">
                Making asset management education accessible to everyone, everywhere.
              </p>
              <p style="margin: 16px 0 0 0; color: #64748B; font-size: 11px;">
                <a href="https://assetmanagementuniversity.org" style="color: #0A2F5C; text-decoration: none;">assetmanagementuniversity.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Format currency amount
 */
function formatAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Karma earned email template
 */
export function karmaEarnedTemplate(data: KarmaEarnedEmailData): { subject: string; html: string; text: string } {
  const { amount, currency, tier, purchaserName, courseTitle, newBalance } = data.data;
  const tierLabel = tier === 1 ? 'direct referral' : 'network referral';

  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 24px; font-weight: 600;">
        +${formatAmount(amount, currency)}
      </div>
    </div>

    <h2 style="margin: 0 0 16px 0; color: #0A2F5C; font-size: 22px; text-align: center;">
      You Earned Karma!
    </h2>

    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
      Great news! You've earned <strong>${formatAmount(amount, currency)}</strong> from a ${tierLabel}.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F9FAFB; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="color: #64748B; font-size: 14px; padding-bottom: 8px;">Referral</td>
              <td style="color: #0A2F5C; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${purchaserName}</td>
            </tr>
            <tr>
              <td style="color: #64748B; font-size: 14px; padding-bottom: 8px;">Course</td>
              <td style="color: #0A2F5C; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${courseTitle}</td>
            </tr>
            <tr>
              <td style="color: #64748B; font-size: 14px; padding-bottom: 8px;">Commission Type</td>
              <td style="color: #0A2F5C; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">Tier ${tier} (10%)</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #E5E7EB; padding-top: 12px;"></td>
            </tr>
            <tr>
              <td style="color: #0A2F5C; font-size: 16px; font-weight: 600;">New Balance</td>
              <td style="color: #10B981; font-size: 18px; font-weight: 700; text-align: right;">${formatAmount(newBalance, currency)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align: center;">
      <a href="https://assetmanagementuniversity.org/referrals" style="display: inline-block; background-color: #0A2F5C; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
        View Your Karma Dashboard
      </a>
    </div>

    <p style="margin: 32px 0 0 0; color: #64748B; font-size: 14px; text-align: center; line-height: 1.6;">
      Keep sharing your referral code to earn more! You earn 10% commission when your referrals purchase certificates, plus 10% when their referrals purchase too.
    </p>
  `);

  const text = `
You Earned Karma!

Great news! You've earned ${formatAmount(amount, currency)} from a ${tierLabel}.

Details:
- Referral: ${purchaserName}
- Course: ${courseTitle}
- Commission Type: Tier ${tier} (10%)
- New Balance: ${formatAmount(newBalance, currency)}

View your Karma Dashboard: https://assetmanagementuniversity.org/referrals

Keep sharing your referral code to earn more!

Asset Management University
"I am because we are"
  `.trim();

  return {
    subject: `You Earned ${formatAmount(amount, currency)} Karma!`,
    html,
    text,
  };
}

/**
 * Karma payout requested email template
 */
export function karmaPayoutRequestedTemplate(data: KarmaPayoutRequestedEmailData): { subject: string; html: string; text: string } {
  const { amount, currency, payoutId } = data.data;

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px 0; color: #0A2F5C; font-size: 22px; text-align: center;">
      Payout Request Received
    </h2>

    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
      Your payout request for <strong>${formatAmount(amount, currency)}</strong> has been received and is being processed.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FEF3C7; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0; color: #92400E; font-size: 14px;">
            <strong>Processing Time:</strong> 3-5 business days
          </p>
          <p style="margin: 8px 0 0 0; color: #92400E; font-size: 12px;">
            Reference: ${payoutId}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 0; color: #64748B; font-size: 14px; text-align: center; line-height: 1.6;">
      We'll send you another email once your payout has been completed and the funds have been transferred to your bank account.
    </p>
  `);

  const text = `
Payout Request Received

Your payout request for ${formatAmount(amount, currency)} has been received and is being processed.

Processing Time: 3-5 business days
Reference: ${payoutId}

We'll send you another email once your payout has been completed.

Asset Management University
  `.trim();

  return {
    subject: `Payout Request Received - ${formatAmount(amount, currency)}`,
    html,
    text,
  };
}

/**
 * Karma payout completed email template
 */
export function karmaPayoutCompletedTemplate(data: KarmaPayoutCompletedEmailData): { subject: string; html: string; text: string } {
  const { amount, currency, payoutId, transferId } = data.data;

  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: #10B981; color: white; padding: 16px; border-radius: 50%; width: 48px; height: 48px; line-height: 48px; font-size: 24px;">
        ✓
      </div>
    </div>

    <h2 style="margin: 0 0 16px 0; color: #0A2F5C; font-size: 22px; text-align: center;">
      Payout Complete!
    </h2>

    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
      Your payout of <strong>${formatAmount(amount, currency)}</strong> has been sent to your bank account.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #D1FAE5; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="color: #065F46; font-size: 14px; padding-bottom: 8px;">Amount</td>
              <td style="color: #065F46; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${formatAmount(amount, currency)}</td>
            </tr>
            <tr>
              <td style="color: #065F46; font-size: 14px; padding-bottom: 8px;">Payout Reference</td>
              <td style="color: #065F46; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${payoutId}</td>
            </tr>
            <tr>
              <td style="color: #065F46; font-size: 14px;">Transfer ID</td>
              <td style="color: #065F46; font-size: 14px; font-weight: 600; text-align: right;">${transferId}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0; color: #64748B; font-size: 14px; text-align: center; line-height: 1.6;">
      Funds typically arrive within 1-3 business days depending on your bank.
    </p>
  `);

  const text = `
Payout Complete!

Your payout of ${formatAmount(amount, currency)} has been sent to your bank account.

Amount: ${formatAmount(amount, currency)}
Payout Reference: ${payoutId}
Transfer ID: ${transferId}

Funds typically arrive within 1-3 business days depending on your bank.

Asset Management University
  `.trim();

  return {
    subject: `Payout Complete - ${formatAmount(amount, currency)} Sent!`,
    html,
    text,
  };
}

/**
 * Referral signup notification email template
 */
export function referralSignupTemplate(data: ReferralSignupEmailData): { subject: string; html: string; text: string } {
  const { referredName } = data.data;

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px 0; color: #0A2F5C; font-size: 22px; text-align: center;">
      Someone Joined Using Your Code!
    </h2>

    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
      Great news! <strong>${referredName}</strong> has signed up to AMU using your referral code.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #EFF6FF; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0; color: #1E40AF; font-size: 14px; line-height: 1.6;">
            <strong>What happens next?</strong><br>
            When ${referredName} completes a course and purchases an official certificate, you'll earn <strong>10% commission</strong> on the purchase price!
          </p>
        </td>
      </tr>
    </table>

    <div style="text-align: center;">
      <a href="https://assetmanagementuniversity.org/referrals" style="display: inline-block; background-color: #0A2F5C; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
        View Your Referrals
      </a>
    </div>
  `);

  const text = `
Someone Joined Using Your Code!

Great news! ${referredName} has signed up to AMU using your referral code.

What happens next?
When ${referredName} completes a course and purchases an official certificate, you'll earn 10% commission on the purchase price!

View your referrals: https://assetmanagementuniversity.org/referrals

Asset Management University
  `.trim();

  return {
    subject: `${referredName} Joined AMU Using Your Code!`,
    html,
    text,
  };
}

/**
 * Corporate invitation email template
 */
export function corporateInvitationTemplate(data: CorporateInvitationEmailData): { subject: string; html: string; text: string } {
  const { companyName, companyCode, inviterName, signupUrl } = data.data;

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px 0; color: #0A2F5C; font-size: 22px; text-align: center;">
      You're Invited to Join ${companyName}
    </h2>

    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
      <strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on Asset Management University for professional development training.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F9FAFB; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #64748B; font-size: 14px;">Your Company Code</p>
          <p style="margin: 0; color: #0A2F5C; font-size: 28px; font-weight: 700; letter-spacing: 2px;">${companyCode}</p>
          <p style="margin: 16px 0 0 0; color: #64748B; font-size: 12px;">
            Use this code during signup to link your account to ${companyName}
          </p>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${signupUrl}" style="display: inline-block; background-color: #0A2F5C; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
        Create Your Account
      </a>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #EFF6FF; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 12px 0; color: #1E40AF; font-size: 14px; font-weight: 600;">What is Asset Management University?</p>
          <p style="margin: 0; color: #1E40AF; font-size: 14px; line-height: 1.6;">
            AMU provides world-class asset management training with AI-powered Socratic learning. Complete courses at your own pace and earn industry-recognised certifications.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 0; color: #64748B; font-size: 14px; text-align: center; line-height: 1.6;">
      Already have an AMU account? <a href="https://assetmanagementuniversity.org/profile" style="color: #0A2F5C;">Link your company code</a> from your profile settings.
    </p>
  `);

  const text = `
You're Invited to Join ${companyName}

${inviterName} has invited you to join ${companyName} on Asset Management University for professional development training.

Your Company Code: ${companyCode}
Use this code during signup to link your account to ${companyName}.

Create your account: ${signupUrl}

What is Asset Management University?
AMU provides world-class asset management training with AI-powered Socratic learning. Complete courses at your own pace and earn industry-recognised certifications.

Already have an AMU account? Link your company code from your profile settings.

Asset Management University
"I am because we are"
  `.trim();

  return {
    subject: `You're Invited to Join ${companyName} on AMU`,
    html,
    text,
  };
}

/**
 * SETA Enrolment Confirmed email template (Section 23.3)
 *
 * Sent when a learner's identity is verified and they are registered with SETA.
 * This is the most important verification email - confirms Tier 3 status.
 */
export function setaEnrolmentConfirmedTemplate(data: SETAEnrolmentConfirmedEmailData): { subject: string; html: string; text: string } {
  const { learnerName, setaLearnerNumber, verificationDate, companyName } = data.data;

  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: #10B981; color: white; padding: 16px; border-radius: 50%; width: 48px; height: 48px; line-height: 48px; font-size: 24px;">
        ✓
      </div>
    </div>

    <h2 style="margin: 0 0 16px 0; color: #0A2F5C; font-size: 22px; text-align: center;">
      SETA Registration Confirmed
    </h2>

    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
      Congratulations, <strong>${learnerName}</strong>! Your identity has been verified and you are now registered for SETA-accredited training.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #D1FAE5; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #065F46; font-size: 14px; font-weight: 600;">
            Your Tier 3 Status is Active
          </p>
          ${setaLearnerNumber ? `
          <p style="margin: 8px 0 0 0; color: #065F46; font-size: 12px;">
            SETA Learner Number: <strong>${setaLearnerNumber}</strong>
          </p>
          ` : ''}
          <p style="margin: 8px 0 0 0; color: #065F46; font-size: 12px;">
            Verified on: ${verificationDate}
          </p>
          ${companyName ? `
          <p style="margin: 8px 0 0 0; color: #065F46; font-size: 12px;">
            Organisation: ${companyName}
          </p>
          ` : ''}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F9FAFB; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 12px 0; color: #0A2F5C; font-size: 14px; font-weight: 600;">What This Means For You:</p>
          <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
            <li>You can earn official SETA-recognised certificates</li>
            <li>Your employer can claim Skills Development Act tax rebates</li>
            <li>Your achievements are recorded on the national qualifications database</li>
            <li>You are eligible for CHIETA-registered training programmes</li>
          </ul>
        </td>
      </tr>
    </table>

    <div style="text-align: center;">
      <a href="https://assetmanagementuniversity.org/learn" style="display: inline-block; background-color: #0A2F5C; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
        Continue Learning
      </a>
    </div>

    <p style="margin: 32px 0 0 0; color: #64748B; font-size: 14px; text-align: center; line-height: 1.6;">
      Your privacy is protected. Your personal information is encrypted and will only be shared with SETA for official registration purposes with your consent.
    </p>
  `);

  const text = `
SETA Registration Confirmed

Congratulations, ${learnerName}! Your identity has been verified and you are now registered for SETA-accredited training.

Your Tier 3 Status is Active
${setaLearnerNumber ? `SETA Learner Number: ${setaLearnerNumber}` : ''}
Verified on: ${verificationDate}
${companyName ? `Organisation: ${companyName}` : ''}

What This Means For You:
- You can earn official SETA-recognised certificates
- Your employer can claim Skills Development Act tax rebates
- Your achievements are recorded on the national qualifications database
- You are eligible for CHIETA-registered training programmes

Continue learning: https://assetmanagementuniversity.org/learn

Your privacy is protected. Your personal information is encrypted and will only be shared with SETA for official registration purposes with your consent.

Asset Management University
"I am because we are"
  `.trim();

  return {
    subject: 'SETA Registration Confirmed - You Are Now Tier 3!',
    html,
    text,
  };
}

/**
 * Verification Action Required email template
 *
 * Sent when AI verification finds issues that need learner attention.
 * Does NOT include any personal data - just prompts to check the app.
 */
export function verificationActionRequiredTemplate(data: VerificationActionRequiredEmailData): { subject: string; html: string; text: string } {
  const { learnerName, issueCount, editUrl } = data.data;

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px 0; color: #0A2F5C; font-size: 22px; text-align: center;">
      Action Required for Verification
    </h2>

    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
      Hi ${learnerName}, we found ${issueCount === 1 ? 'an issue' : `${issueCount} issues`} with your verification submission that ${issueCount === 1 ? 'needs' : 'need'} your attention.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FEF3C7; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">
            <strong>Don't worry - this is easy to fix!</strong><br>
            Common issues include unclear document photos or minor typos.
          </p>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${editUrl}" style="display: inline-block; background-color: #0A2F5C; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
        Review & Fix Now
      </a>
    </div>

    <p style="margin: 0; color: #64748B; font-size: 14px; text-align: center; line-height: 1.6;">
      You can also chat with your AI Facilitator in the app for guidance on what to check.
    </p>

    <p style="margin: 24px 0 0 0; color: #64748B; font-size: 12px; text-align: center; line-height: 1.6;">
      <strong>Privacy note:</strong> For your protection, we haven't included any personal details in this email. All information can be reviewed securely in the app.
    </p>
  `);

  const text = `
Action Required for Verification

Hi ${learnerName}, we found ${issueCount === 1 ? 'an issue' : `${issueCount} issues`} with your verification submission that ${issueCount === 1 ? 'needs' : 'need'} your attention.

Don't worry - this is easy to fix! Common issues include unclear document photos or minor typos.

Review & Fix Now: ${editUrl}

You can also chat with your AI Facilitator in the app for guidance on what to check.

Privacy note: For your protection, we haven't included any personal details in this email. All information can be reviewed securely in the app.

Asset Management University
  `.trim();

  return {
    subject: 'Action Required: Your Verification Needs Attention',
    html,
    text,
  };
}

/**
 * Verification Received email template
 *
 * Sent immediately when a learner submits their verification.
 * Confirms receipt and sets expectations.
 */
export function verificationReceivedTemplate(data: VerificationReceivedEmailData): { subject: string; html: string; text: string } {
  const { learnerName, submissionDate } = data.data;

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px 0; color: #0A2F5C; font-size: 22px; text-align: center;">
      Verification Submission Received
    </h2>

    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
      Thank you, <strong>${learnerName}</strong>! We have received your identity verification submission.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #EFF6FF; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #1E40AF; font-size: 14px;">
            <strong>Submitted:</strong> ${submissionDate}
          </p>
          <p style="margin: 0; color: #1E40AF; font-size: 14px;">
            <strong>Expected Processing:</strong> Usually within minutes
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F9FAFB; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 12px 0; color: #0A2F5C; font-size: 14px; font-weight: 600;">What happens next?</p>
          <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
            <li>Our AI verification system will review your documents</li>
            <li>Your information is compared for accuracy and consistency</li>
            <li>You'll receive confirmation once verified</li>
            <li>You can continue learning while you wait!</li>
          </ul>
        </td>
      </tr>
    </table>

    <div style="text-align: center;">
      <a href="https://assetmanagementuniversity.org/learn" style="display: inline-block; background-color: #0A2F5C; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
        Continue Learning
      </a>
    </div>

    <p style="margin: 24px 0 0 0; color: #64748B; font-size: 12px; text-align: center; line-height: 1.6;">
      <strong>Privacy commitment:</strong> Your documents are processed by AI only. No human will view your personal information.
    </p>
  `);

  const text = `
Verification Submission Received

Thank you, ${learnerName}! We have received your identity verification submission.

Submitted: ${submissionDate}
Expected Processing: Usually within minutes

What happens next?
- Our AI verification system will review your documents
- Your information is compared for accuracy and consistency
- You'll receive confirmation once verified
- You can continue learning while you wait!

Continue Learning: https://assetmanagementuniversity.org/learn

Privacy commitment: Your documents are processed by AI only. No human will view your personal information.

Asset Management University
"I am because we are"
  `.trim();

  return {
    subject: 'Verification Received - Processing Now',
    html,
    text,
  };
}
