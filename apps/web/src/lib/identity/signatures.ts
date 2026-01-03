/**
 * SETA Digital Signatures - AMU Platform
 *
 * SignRequest integration for SETA registration documents.
 * Per Section 7.1.4 of the Technical Specification.
 *
 * Documents requiring signatures:
 * 1. Enrolment Form - Learner signs
 * 2. Tri-Party Agreement - Learner, Employer, AMU Representative sign
 *
 * SETA Mandatory Fields (from Data-Required-By-SETAs.pdf):
 * - Race/Equity Group (for B-BBEE reporting)
 * - ID Number (RSA or alternative identification)
 * - Disability Status and Details
 *
 * "Ubuntu - I am because we are"
 */

import type {
  EquityGroup,
  DisabilityStatus,
  DisabilityDetails,
  CitizenStatus,
  SETARegistrationRecord,
  SETARegistrationStatus,
} from '@amu/shared';

import {
  getSETARegistrationById,
  updateSETARegistration as updateSETARegistrationDb,
  getSETARegistrationBySignatureId,
} from '@amu/database';

import { getUserById } from '@amu/database';

// =============================================================================
// RE-EXPORT SHARED TYPES FOR CONVENIENCE
// =============================================================================

export type {
  SETARegistrationRecord,
  SETARegistrationStatus,
};

// =============================================================================
// SIGNREQUEST TYPES
// =============================================================================

/**
 * SignRequest signer configuration
 */
export interface SignRequestSigner {
  email: string;
  first_name: string;
  last_name: string;
  order?: number;
  needs_to_sign?: boolean;
  approve_only?: boolean;
  force_language?: string;
}

/**
 * SignRequest prefill tag for document fields
 */
export interface SignRequestPrefillTag {
  external_id: string;
  text: string;
}

/**
 * SignRequest API response for signature request
 */
export interface SignRequestResponse {
  uuid: string;
  signing_url: string;
  status: SignRequestStatus;
  created_at: string;
  signers: SignRequestSignerStatus[];
  document_name: string;
}

/**
 * SignRequest status values
 */
export type SignRequestStatus =
  | 'draft'
  | 'pending'
  | 'signed'
  | 'cancelled'
  | 'declined'
  | 'expired';

/**
 * Signer status in SignRequest response
 */
export interface SignRequestSignerStatus {
  email: string;
  has_signed: boolean;
  signed_at?: string;
  declined?: boolean;
  viewed?: boolean;
}

/**
 * SignRequest webhook event types
 */
export type SignRequestWebhookEvent =
  | 'convert_error'
  | 'sent_error'
  | 'sent'
  | 'viewed'
  | 'signer_viewed'
  | 'signer_signed'
  | 'signer_declined'
  | 'signed'
  | 'declined'
  | 'cancelled'
  | 'expired';

/**
 * SignRequest webhook payload
 */
export interface SignRequestWebhookPayload {
  event_type: SignRequestWebhookEvent;
  event_time: string;
  document: {
    uuid: string;
    name: string;
    status: SignRequestStatus;
  };
  signer?: {
    email: string;
    has_signed: boolean;
    signed_at?: string;
  };
}

// =============================================================================
// SETA DOCUMENT TYPES
// =============================================================================

/**
 * SETA Document Package per Section 7.1.4
 * Contains configuration for all documents requiring signatures
 */
export interface SETADocumentPackage {
  registration_id: string;
  learner_id: string;
  documents: {
    enrolment_form: {
      template_id: string;
      fields: SETAEnrolmentFormFields;
      signers: ['learner'];
    };
    triparty_agreement: {
      template_id: string;
      fields: SETATripartyAgreementFields;
      signers: ['learner', 'employer', 'amu_representative'];
    };
  };
}

/**
 * SETA Enrolment Form fields
 * Captures mandatory SETA demographic data
 */
export interface SETAEnrolmentFormFields {
  // Personal Information
  learner_name: string;
  learner_title?: string;
  learner_first_name: string;
  learner_surname: string;

  // Identification (SETA Mandatory)
  id_number: string;
  alternative_id_type?: string;
  alternative_id_number?: string;
  date_of_birth: string;
  gender: string;

  // Citizenship
  country_of_origin: string;
  citizenship: string;
  citizen_status: CitizenStatus;

  // Equity Reporting (SETA Mandatory - B-BBEE)
  equity_group: EquityGroup;        // Race - mandatory for SETA
  home_language: string;

  // Disability Status (SETA Mandatory)
  disability_status: DisabilityStatus;
  disability_details?: DisabilityDetails;

  // Qualification
  qualification_title: string;
  qualification_id: string;

  // Provider
  provider_name: 'Asset Management University';
  provider_accreditation_number?: string;

  // Dates
  start_date: string;
  expected_end_date?: string;
}

/**
 * SETA Tri-Party Agreement fields
 * Agreement between Learner, Employer, and AMU
 */
export interface SETATripartyAgreementFields {
  // Learner Details
  learner_name: string;
  learner_id_number: string;

  // Employer Details
  employer_name: string;
  employer_registration_number?: string;
  employer_sdl_number?: string;

  // Workplace Supervisor
  workplace_supervisor: string;
  workplace_supervisor_email?: string;
  workplace_supervisor_phone?: string;

  // Provider Details
  provider_name: 'Asset Management University';
  provider_accreditation_number?: string;

  // Qualification Details
  qualification_title: string;
  qualification_id: string;
  qualification_nqf_level?: string;
  qualification_credits?: number;

  // Agreement Terms
  start_date: string;
  end_date: string;
  workplace_component_hours?: number;

  // Equity Reporting (SETA Mandatory)
  learner_equity_group: EquityGroup;
  learner_disability_status: DisabilityStatus;
}

/**
 * Result from initiating SETA signatures
 */
export interface SignatureResult {
  success: boolean;
  enrolment_signing_url?: string;
  triparty_signing_url?: string;
  enrolment_request_id?: string;
  triparty_request_id?: string;
  error?: string;
}

// =============================================================================
// SIGNREQUEST CLIENT
// =============================================================================

/**
 * SignRequest client configuration
 */
export interface SignRequestConfig {
  api_token: string;
  subdomain?: string;
  base_url?: string;
}

/**
 * SignRequest API client
 * Primary digital signature provider per Section 4.3
 */
export class SignRequestClient {
  private apiToken: string;
  private baseUrl: string;

  constructor(config: SignRequestConfig) {
    this.apiToken = config.api_token;
    this.baseUrl = config.base_url || 'https://signrequest.com/api/v1';
  }

  /**
   * Create a signature request from a template
   */
  async createSignRequest(params: {
    template: string;
    signers: SignRequestSigner[];
    prefill_tags?: SignRequestPrefillTag[];
    message?: string;
    subject?: string;
  }): Promise<SignRequestResponse> {
    const response = await fetch(`${this.baseUrl}/signrequests/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template: `${this.baseUrl}/templates/${params.template}/`,
        signers: params.signers,
        prefill_tags: params.prefill_tags || [],
        message: params.message,
        subject: params.subject,
        from_email: 'administrator@assetmanagementuniversity.org',
        from_email_name: 'Asset Management University',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SignRequest API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Get status of a signature request
   */
  async getSignRequest(uuid: string): Promise<SignRequestResponse> {
    const response = await fetch(`${this.baseUrl}/signrequests/${uuid}/`, {
      headers: {
        'Authorization': `Token ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get signature request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Cancel a signature request
   */
  async cancelSignRequest(uuid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/signrequests/${uuid}/cancel/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel signature request: ${response.statusText}`);
    }
  }

  /**
   * Resend signature request email
   */
  async resendSignRequest(uuid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/signrequests/${uuid}/resend/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to resend signature request: ${response.statusText}`);
    }
  }
}

// =============================================================================
// EMAIL SERVICE INTEGRATION
// =============================================================================

/**
 * Email configuration
 */
const EMAIL_FROM = process.env.EMAIL_FROM || 'administrator@assetmanagementuniversity.org';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Asset Management University';
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'sendgrid';

/**
 * Send email using configured provider (SendGrid/Resend)
 * Integrates with existing email infrastructure
 */
async function sendSignatureEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Check if email provider is configured
    if (!process.env.SENDGRID_API_KEY && !process.env.RESEND_API_KEY) {
      console.log('[Signatures] No email provider configured. Would send:', {
        to,
        subject,
        preview: textContent.substring(0, 100) + '...',
      });
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    if (EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
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
            { type: 'text/plain', value: textContent },
            { type: 'text/html', value: htmlContent },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return { success: false, error: `SendGrid error: ${response.status} ${errorText}` };
      }

      const messageId = response.headers.get('X-Message-Id') || `sg-${Date.now()}`;
      return { success: true, messageId };
    }

    if (EMAIL_PROVIDER === 'resend' && process.env.RESEND_API_KEY) {
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
          html: htmlContent,
          text: textContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || `Resend error: ${response.status}` };
      }

      const data = await response.json();
      return { success: true, messageId: data.id };
    }

    return { success: false, error: 'No email provider configured' };
  } catch (error) {
    console.error('[Signatures] Email error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Generate SETA signature email template (HTML)
 */
function generateSignatureEmailHtml(learnerName: string, signingUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign Your SETA Enrolment Documents</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1a365d; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Asset Management University</h1>
  </div>

  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Dear ${learnerName},</p>

    <p>Your SETA registration documents are ready for signing.</p>

    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a365d;">
      <h3 style="margin-top: 0; color: #1a365d;">What you're signing:</h3>
      <ol style="margin-bottom: 0;">
        <li><strong>Enrolment Form</strong> - Your personal details and course enrolment</li>
        <li><strong>Tri-Party Agreement</strong> - Agreement between you, your employer, and AMU</li>
      </ol>
    </div>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${signingUrl}" style="background-color: #1a365d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Sign Documents Now
      </a>
    </p>

    <p><strong>Your signature confirms:</strong></p>
    <ul>
      <li>The information you provided is accurate</li>
      <li>You consent to SETA registration</li>
      <li>You understand the qualification requirements</li>
    </ul>

    <p>If you have any questions, please reply to this email or contact us at:<br>
    <a href="mailto:administrator@assetmanagementuniversity.org">administrator@assetmanagementuniversity.org</a></p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #666; font-style: italic; text-align: center;">
      "Ubuntu - I am because we are"
    </p>

    <p style="color: #666; font-size: 12px; text-align: center;">
      Asset Management University<br>
      Making asset management education radically accessible
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate SETA signature email template (plain text)
 */
function generateSignatureEmailText(learnerName: string, signingUrl: string): string {
  return `
Dear ${learnerName},

Your SETA registration documents are ready for signing.

Please click the link below to review and sign your enrolment documents:
${signingUrl}

These documents are required for your official SETA registration and qualification recognition.

What you're signing:
1. Enrolment Form - Your personal details and course enrolment
2. Tri-Party Agreement - Agreement between you, your employer, and Asset Management University

Your signature confirms:
- The information you provided is accurate
- You consent to SETA registration
- You understand the qualification requirements

If you have any questions, please reply to this email or contact us at:
administrator@assetmanagementuniversity.org

Ubuntu - I am because we are.

Asset Management University
Making asset management education radically accessible
  `.trim();
}

// =============================================================================
// SETA SIGNATURE FUNCTIONS
// =============================================================================

/**
 * Get SignRequest client instance
 */
function getSignRequestClient(): SignRequestClient {
  const apiToken = process.env.SIGNREQUEST_API_TOKEN;
  if (!apiToken) {
    throw new Error('SIGNREQUEST_API_TOKEN environment variable not set');
  }
  return new SignRequestClient({ api_token: apiToken });
}

/**
 * Initiate SETA Signatures
 *
 * Per Section 7.1.4 of the Technical Specification.
 * Creates signature requests for SETA enrolment documents.
 *
 * Process:
 * 1. Retrieve registration and learner data from Firestore
 * 2. Validate SETA mandatory fields (Race, ID, Disability)
 * 3. Create SignRequest with prefilled SETA demographic data
 * 4. Update registration status to 'awaiting_signatures'
 * 5. Send notification email via SendGrid/Resend
 *
 * SETA Mandatory Fields captured:
 * - Race/Equity Group (for B-BBEE reporting)
 * - ID Number (RSA 13-digit or alternative)
 * - Disability Status and Details
 *
 * @param registrationId - SETA registration ID
 * @returns SignatureResult with signing URLs
 */
export async function initiateSETASignatures(
  registrationId: string
): Promise<SignatureResult> {
  try {
    // 1. Get registration from Firestore
    const registration = await getSETARegistrationById(registrationId);
    if (!registration) {
      return {
        success: false,
        error: `SETA registration not found: ${registrationId}`,
      };
    }

    // 2. Get learner data from Firestore
    const learner = await getUserById(registration.user_id);
    if (!learner) {
      return {
        success: false,
        error: `Learner not found: ${registration.user_id}`,
      };
    }

    // 3. Validate required SETA mandatory fields
    if (!learner.user_id_number) {
      return {
        success: false,
        error: 'Learner ID number is required for SETA registration',
      };
    }

    if (!learner.user_equity_group) {
      return {
        success: false,
        error: 'Equity group (race) is required for SETA registration (B-BBEE compliance)',
      };
    }

    if (!learner.user_disability_status) {
      return {
        success: false,
        error: 'Disability status is required for SETA registration',
      };
    }

    // Parse learner name into parts
    const nameParts = learner.user_name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // 4. Create signature request via SignRequest
    const signRequestClient = getSignRequestClient();

    // Build prefill tags with SETA mandatory fields
    const prefillTags: SignRequestPrefillTag[] = [
      // Personal Information
      { external_id: 'learner_name', text: learner.user_name },
      { external_id: 'learner_first_name', text: firstName },
      { external_id: 'learner_surname', text: lastName },

      // SETA Mandatory: ID Number
      { external_id: 'id_number', text: learner.user_id_number },

      // SETA Mandatory: Race/Equity Group (B-BBEE)
      { external_id: 'equity_group', text: learner.user_equity_group },

      // SETA Mandatory: Disability Status
      { external_id: 'disability_status', text: learner.user_disability_status },

      // Qualification
      { external_id: 'qualification', text: registration.qualification_title },
      { external_id: 'qualification_id', text: registration.qualification_id },

      // Provider
      { external_id: 'provider_name', text: 'Asset Management University' },

      // Dates
      { external_id: 'start_date', text: new Date().toISOString().split('T')[0] },
    ];

    // Add disability details if provided (granular SETA fields)
    if (learner.user_disability_details) {
      const details = learner.user_disability_details;
      if (details.eyesight) {
        prefillTags.push({ external_id: 'disability_eyesight', text: details.eyesight });
      }
      if (details.hearing) {
        prefillTags.push({ external_id: 'disability_hearing', text: details.hearing });
      }
      if (details.walking) {
        prefillTags.push({ external_id: 'disability_walking', text: details.walking });
      }
      if (details.memory) {
        prefillTags.push({ external_id: 'disability_memory', text: details.memory });
      }
      if (details.communicating) {
        prefillTags.push({ external_id: 'disability_communicating', text: details.communicating });
      }
      if (details.self_care) {
        prefillTags.push({ external_id: 'disability_self_care', text: details.self_care });
      }
    }

    // Get template ID from environment or use default
    const templateId = process.env.SIGNREQUEST_ENROLMENT_TEMPLATE || 'seta_enrolment_form';

    // Create enrolment form signature request
    const enrolmentSignRequest = await signRequestClient.createSignRequest({
      template: templateId,
      signers: [
        {
          email: learner.user_email,
          first_name: firstName,
          last_name: lastName,
        },
      ],
      prefill_tags: prefillTags,
      subject: 'Please Sign Your SETA Enrolment Form - Asset Management University',
      message: 'Please review and sign your SETA enrolment form to complete your registration.',
    });

    // 5. Update registration status to 'awaiting_signatures' per Section 7.1.3
    await updateSETARegistrationDb(registrationId, {
      registration_status: 'awaiting_signatures',
      signature_request_id: enrolmentSignRequest.uuid,
      signatures_status: 'pending',
    });

    // 6. Send notification email to learner via SendGrid/Resend
    const emailResult = await sendSignatureEmail(
      learner.user_email,
      'Please Sign Your SETA Enrolment Documents - Asset Management University',
      generateSignatureEmailHtml(learner.user_name, enrolmentSignRequest.signing_url),
      generateSignatureEmailText(learner.user_name, enrolmentSignRequest.signing_url)
    );

    if (!emailResult.success) {
      console.warn('[Signatures] Email notification failed:', emailResult.error);
      // Don't fail the whole operation if email fails - signature request was created
    }

    return {
      success: true,
      enrolment_signing_url: enrolmentSignRequest.signing_url,
      enrolment_request_id: enrolmentSignRequest.uuid,
    };
  } catch (error) {
    console.error('[Signatures] Failed to initiate SETA signatures:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Initiate Tri-Party Agreement Signatures
 *
 * Creates signature request for the tri-party agreement between
 * Learner, Employer, and AMU Representative.
 *
 * Per Section 7.1.4, the tri-party agreement requires three signers
 * in legal order: 1. Learner, 2. Employer, 3. AMU Representative
 *
 * @param registrationId - SETA registration ID
 * @param employerEmail - Employer representative email
 * @param amuRepEmail - AMU representative email (defaults to administrator@)
 */
export async function initiateTripartySignatures(
  registrationId: string,
  employerEmail: string,
  amuRepEmail: string = 'administrator@assetmanagementuniversity.org'
): Promise<SignatureResult> {
  try {
    const registration = await getSETARegistrationById(registrationId);
    if (!registration) {
      return {
        success: false,
        error: `SETA registration not found: ${registrationId}`,
      };
    }

    const learner = await getUserById(registration.user_id);
    if (!learner) {
      return {
        success: false,
        error: `Learner not found: ${registration.user_id}`,
      };
    }

    // Validate required SETA fields
    if (!learner.user_id_number || !learner.user_equity_group || !learner.user_disability_status) {
      return {
        success: false,
        error: 'Missing required SETA fields (ID, equity group, or disability status)',
      };
    }

    if (!registration.employer_name) {
      return {
        success: false,
        error: 'Employer information is required for tri-party agreement',
      };
    }

    const nameParts = learner.user_name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const signRequestClient = getSignRequestClient();

    // Build prefill tags for tri-party agreement
    const prefillTags: SignRequestPrefillTag[] = [
      // Learner (with SETA mandatory fields)
      { external_id: 'learner_name', text: learner.user_name },
      { external_id: 'learner_id_number', text: learner.user_id_number },
      { external_id: 'learner_equity_group', text: learner.user_equity_group },
      { external_id: 'learner_disability_status', text: learner.user_disability_status },

      // Employer
      { external_id: 'employer_name', text: registration.employer_name },
      { external_id: 'workplace_supervisor', text: registration.workplace_supervisor || '' },

      // Provider
      { external_id: 'provider_name', text: 'Asset Management University' },

      // Qualification
      { external_id: 'qualification_title', text: registration.qualification_title },
      { external_id: 'qualification_id', text: registration.qualification_id },

      // Dates
      { external_id: 'start_date', text: new Date().toISOString().split('T')[0] },
    ];

    // Get template ID from environment or use default
    const templateId = process.env.SIGNREQUEST_TRIPARTY_TEMPLATE || 'seta_triparty_agreement';

    // Create tri-party agreement with ordered signers per Section 7.1.4
    // Order: Learner (1) -> Employer (2) -> AMU Representative (3)
    const tripartySignRequest = await signRequestClient.createSignRequest({
      template: templateId,
      signers: [
        {
          email: learner.user_email,
          first_name: firstName,
          last_name: lastName,
          order: 1,  // Learner signs first
        },
        {
          email: employerEmail,
          first_name: 'Employer',
          last_name: 'Representative',
          order: 2,  // Employer signs second
        },
        {
          email: amuRepEmail,
          first_name: 'AMU',
          last_name: 'Representative',
          order: 3,  // AMU signs last (after learner and employer acceptance)
        },
      ],
      prefill_tags: prefillTags,
      subject: 'SETA Tri-Party Agreement - Asset Management University',
      message: 'Please review and sign the SETA Tri-Party Agreement for learner qualification registration.',
    });

    // Update registration with tri-party request ID
    await updateSETARegistrationDb(registrationId, {
      triparty_request_id: tripartySignRequest.uuid,
    });

    return {
      success: true,
      triparty_signing_url: tripartySignRequest.signing_url,
      triparty_request_id: tripartySignRequest.uuid,
    };
  } catch (error) {
    console.error('[Signatures] Failed to initiate tri-party signatures:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Handle SignRequest webhook events
 *
 * Processes webhook callbacks from SignRequest to update
 * registration status as signatures are completed.
 *
 * @param payload - Webhook payload from SignRequest
 */
export async function handleSignRequestWebhook(
  payload: SignRequestWebhookPayload
): Promise<void> {
  const { event_type, document } = payload;

  console.log(`[SignRequest Webhook] Event: ${event_type}, Document: ${document.uuid}`);

  // Find registration by signature request ID
  const registration = await getSETARegistrationBySignatureId(document.uuid);
  if (!registration) {
    console.warn(`[SignRequest Webhook] No registration found for document: ${document.uuid}`);
    return;
  }

  switch (event_type) {
    case 'signed':
      // All parties have signed - update status
      console.log(`[SignRequest Webhook] Document ${document.uuid} fully signed`);

      // Determine which document was signed
      if (registration.signature_request_id === document.uuid) {
        // Enrolment form signed
        await updateSETARegistrationDb(registration.registration_id, {
          signatures_status: registration.triparty_request_id ? 'partial' : 'completed',
          registration_status: registration.triparty_request_id ? 'awaiting_signatures' : 'signatures_complete',
        });
      } else if (registration.triparty_request_id === document.uuid) {
        // Tri-party agreement signed - all done
        await updateSETARegistrationDb(registration.registration_id, {
          signatures_status: 'completed',
          registration_status: 'signatures_complete',
        });
      }
      break;

    case 'signer_signed':
      // One party has signed - log progress
      console.log(`[SignRequest Webhook] Signer completed for document ${document.uuid}`);
      break;

    case 'declined':
      // Document was declined - update status
      console.log(`[SignRequest Webhook] Document ${document.uuid} was declined`);
      await updateSETARegistrationDb(registration.registration_id, {
        registration_status: 'rejected',
      });
      break;

    case 'expired':
      // Document expired without signatures
      console.log(`[SignRequest Webhook] Document ${document.uuid} expired`);
      // Keep status as awaiting_signatures but log the expiry
      break;

    default:
      console.log(`[SignRequest Webhook] Unhandled event type: ${event_type}`);
  }
}

/**
 * Check signature status for a registration
 *
 * @param registrationId - SETA registration ID
 */
export async function checkSignatureStatus(
  registrationId: string
): Promise<{
  enrolment_signed: boolean;
  triparty_signed: boolean;
  all_signed: boolean;
}> {
  const registration = await getSETARegistrationById(registrationId);
  if (!registration) {
    throw new Error(`SETA registration not found: ${registrationId}`);
  }

  const signRequestClient = getSignRequestClient();

  let enrolmentSigned = false;
  let tripartySigned = false;

  // Check enrolment form status
  if (registration.signature_request_id) {
    const enrolmentStatus = await signRequestClient.getSignRequest(
      registration.signature_request_id
    );
    enrolmentSigned = enrolmentStatus.status === 'signed';
  }

  // Check tri-party agreement status
  if (registration.triparty_request_id) {
    const tripartyStatus = await signRequestClient.getSignRequest(
      registration.triparty_request_id
    );
    tripartySigned = tripartyStatus.status === 'signed';
  }

  return {
    enrolment_signed: enrolmentSigned,
    triparty_signed: tripartySigned,
    all_signed: enrolmentSigned && tripartySigned,
  };
}

/**
 * Resend signature request emails
 *
 * @param registrationId - SETA registration ID
 * @param documentType - Which document to resend
 */
export async function resendSignatureRequest(
  registrationId: string,
  documentType: 'enrolment' | 'triparty'
): Promise<{ success: boolean; error?: string }> {
  try {
    const registration = await getSETARegistrationById(registrationId);
    if (!registration) {
      return {
        success: false,
        error: `SETA registration not found: ${registrationId}`,
      };
    }

    const signRequestClient = getSignRequestClient();

    const requestId =
      documentType === 'enrolment'
        ? registration.signature_request_id
        : registration.triparty_request_id;

    if (!requestId) {
      return {
        success: false,
        error: `No ${documentType} signature request found`,
      };
    }

    await signRequestClient.resendSignRequest(requestId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { getSignRequestClient };
