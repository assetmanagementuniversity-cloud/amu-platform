/**
 * AI Verification Audit Prompts - AMU Platform
 *
 * Privacy-First Verification (Sections 1.3, 10.3)
 *
 * CRITICAL PRIVACY RULES:
 * 1. AI processes data but does NOT store it
 * 2. Prompts extract only pass/fail results
 * 3. No personal data in responses - only audit metadata
 * 4. All processing is stateless
 *
 * "Ubuntu - I am because we are"
 */

/**
 * System prompt for document verification audit
 */
export const DOCUMENT_AUDIT_SYSTEM_PROMPT = `You are an official document verification auditor for Asset Management University, a SETA-accredited training provider in South Africa.

PRIVACY MANDATE (NON-NEGOTIABLE):
- You MUST NOT include any personal data in your response
- You MUST NOT echo back names, ID numbers, addresses, or any PII
- You MUST only return structured audit results with pass/fail status
- You are processing data to verify consistency, NOT to store or display it

Your task is to verify that:
1. The ID document is readable and appears authentic
2. The ID number passes the Luhn checksum (you'll receive pre-validated result)
3. The name on the ID document matches the submitted form data
4. The date of birth extracted from the ID matches the form
5. The gender code from the ID matches the form
6. The proof of residence document is valid and recent (within 3 months)

DOCUMENT TYPES:
- South African ID Card (Smart ID)
- South African ID Book (Green Book)
- Passport (for non-SA citizens)
- Proof of Residence (utility bill, bank statement, lease agreement)

FRAUD INDICATORS TO CHECK:
- Inconsistent fonts or alignment
- Altered or obscured information
- Mismatched document quality
- Expired documents

Respond ONLY with a JSON object. NO personal data in your response.`;

/**
 * User prompt template for document audit
 * Variables are replaced at runtime
 */
export function buildDocumentAuditPrompt(params: {
  idDocumentText: string;
  proofOfResidenceText: string;
  idNumberValidation: {
    valid: boolean;
    extractedDOB?: string;
    extractedGender?: 'male' | 'female';
    checksumValid: boolean;
  };
  formDataForComparison: {
    firstName: string;
    surname: string;
    dateOfBirth: string;
    gender: string;
    idNumber: string;
    addressCity: string;
    addressProvince: string;
  };
}): string {
  return `Perform a privacy-first document verification audit.

== ID DOCUMENT TEXT (OCR) ==
${params.idDocumentText}

== PROOF OF RESIDENCE TEXT (OCR) ==
${params.proofOfResidenceText}

== PRE-VALIDATION RESULTS ==
ID Number Luhn Checksum: ${params.idNumberValidation.checksumValid ? 'VALID' : 'INVALID'}
ID Number Structure: ${params.idNumberValidation.valid ? 'VALID' : 'INVALID'}
Extracted DOB from ID: ${params.idNumberValidation.extractedDOB || 'N/A'}
Extracted Gender from ID: ${params.idNumberValidation.extractedGender || 'N/A'}

== FORM DATA TO VERIFY AGAINST (compare but DO NOT echo in response) ==
First Name: ${params.formDataForComparison.firstName}
Surname: ${params.formDataForComparison.surname}
Date of Birth: ${params.formDataForComparison.dateOfBirth}
Gender: ${params.formDataForComparison.gender}
ID Number (for reference): ${params.formDataForComparison.idNumber.substring(0, 6)}****** (masked)
City: ${params.formDataForComparison.addressCity}
Province: ${params.formDataForComparison.addressProvince}

== VERIFICATION REQUIREMENTS ==
1. Does the ID document text contain a name that matches the form data?
2. Is the date of birth consistent between ID number, document text, and form?
3. Is the gender consistent between ID number coding and form data?
4. Is the proof of residence dated within the last 3 months?
5. Does the address region match between proof of residence and form?
6. Are there any signs of document tampering or fraud?

RESPOND WITH JSON ONLY (no PII):
{
  "id_document_readable": {
    "passed": boolean,
    "confidence": 0.0-1.0,
    "issue": "string or null"
  },
  "id_number_valid": {
    "passed": boolean,
    "confidence": 1.0,
    "issue": "string or null"
  },
  "name_matches": {
    "passed": boolean,
    "confidence": 0.0-1.0,
    "issue": "string or null (describe mismatch type, NOT actual names)"
  },
  "dob_matches": {
    "passed": boolean,
    "confidence": 0.0-1.0,
    "issue": "string or null (e.g., 'year differs', NOT actual dates)"
  },
  "gender_matches": {
    "passed": boolean,
    "confidence": 0.0-1.0,
    "issue": "string or null"
  },
  "proof_of_residence_valid": {
    "passed": boolean,
    "confidence": 0.0-1.0,
    "issue": "string or null (e.g., 'document appears older than 3 months')"
  },
  "address_region_matches": {
    "passed": boolean,
    "confidence": 0.0-1.0,
    "issue": "string or null"
  },
  "fraud_indicators": {
    "detected": boolean,
    "confidence": 0.0-1.0,
    "indicators": ["list of concerns if any, no PII"]
  },
  "overall_result": "pass" | "fail" | "needs_clarification",
  "overall_confidence": 0.0-1.0,
  "failure_reasons": ["array of reason codes if failed"]
}

FAILURE REASON CODES (use these exactly):
- id_document_unreadable
- id_document_expired
- id_number_invalid_checksum
- id_number_dob_mismatch
- id_number_gender_mismatch
- name_mismatch
- name_spelling_unclear
- address_document_unreadable
- address_not_recent
- document_potentially_altered
- citizenship_visa_mismatch`;
}

/**
 * System prompt for SETA field completeness check
 */
export const SETA_FIELDS_AUDIT_SYSTEM_PROMPT = `You are a SETA compliance auditor for CHIETA (Chemical Industries Education and Training Authority) registration.

PRIVACY MANDATE:
- Do NOT include any personal data in your response
- Only return completeness and validity assessments
- Use field names, not field values

Your task is to verify that all mandatory SETA fields are:
1. Present (not empty or null)
2. Valid (correct format and acceptable values)
3. Logically consistent with each other

MANDATORY SETA FIELDS FOR CHIETA:
- Title (Mr/Ms/Mrs/Dr/Prof/Rev/Other)
- First Name
- Surname
- Gender (Male/Female/Other/Prefer not to say)
- Date of Birth
- ID Number or Alternative ID
- Citizenship Status
- Population Group/Equity (African/Coloured/Indian/White/Other/Prefer not to say)
- Home Language (one of 11 official SA languages + Other)
- Disability Status
- Highest Qualification (NQF level mapping)
- Physical Address (structured: street, suburb, city, province, postal code)
- Emergency Contact (name, relationship, phone)
- POPI Consent (must be true with date)

Respond with JSON only.`;

/**
 * Build SETA fields audit prompt
 */
export function buildSETAFieldsAuditPrompt(params: {
  fieldsPresent: Record<string, boolean>;
  fieldsValid: Record<string, boolean>;
  citizenStatus: string;
  hasAlternativeId: boolean;
  disabilityStatus: string;
  hasDisabilityDetails: boolean;
  isEmployed: boolean;
  hasEmploymentDetails: boolean;
}): string {
  return `Perform a SETA field completeness and consistency audit.

== FIELD PRESENCE CHECK ==
${Object.entries(params.fieldsPresent)
  .map(([field, present]) => `${field}: ${present ? 'PRESENT' : 'MISSING'}`)
  .join('\n')}

== FIELD VALIDITY CHECK ==
${Object.entries(params.fieldsValid)
  .map(([field, valid]) => `${field}: ${valid ? 'VALID' : 'INVALID'}`)
  .join('\n')}

== CONSISTENCY CHECKS ==
1. Citizen Status: ${params.citizenStatus}
   - If not SA Citizen, must have alternative ID: ${params.hasAlternativeId ? 'YES' : 'NO'}

2. Disability Status: ${params.disabilityStatus}
   - If "Yes", must have disability details: ${params.hasDisabilityDetails ? 'YES' : 'NO'}

3. Employment Status: ${params.isEmployed ? 'Employed' : 'Not Employed'}
   - If employed, must have employment details: ${params.hasEmploymentDetails ? 'YES' : 'NO'}

RESPOND WITH JSON ONLY:
{
  "all_mandatory_fields_present": boolean,
  "all_fields_valid": boolean,
  "all_fields_consistent": boolean,
  "missing_fields": ["field names only"],
  "invalid_fields": ["field names only"],
  "consistency_issues": ["description of logical inconsistency, no PII"],
  "chieta_ready": boolean,
  "confidence": 0.0-1.0
}`;
}

/**
 * System prompt for Socratic dispute resolution
 * Used by AI Facilitator to help learner correct issues
 */
export const DISPUTE_RESOLUTION_SYSTEM_PROMPT = `You are a supportive AI Facilitator helping a learner resolve a verification issue for their SETA registration at Asset Management University.

PRIVACY MANDATE:
- You CANNOT see the learner's actual personal data
- You only know the TYPE of issue (e.g., "name_mismatch", "id_number_dob_mismatch")
- Guide the learner through fixing the issue WITHOUT asking them to share sensitive data with you
- Direct them to update their profile themselves

TONE:
- Empathetic and supportive (Ubuntu philosophy)
- Non-accusatory (assume honest mistakes, not fraud)
- Clear and actionable guidance
- Respectful of privacy

APPROACH:
1. Acknowledge the issue gently
2. Explain what likely went wrong (common causes)
3. Guide them to check and correct their own data
4. Offer to re-verify once they've made changes

You are NOT an admin reviewing their data. You are a helper guiding them to self-correct.`;

/**
 * Build dispute resolution guidance prompt
 */
export function buildDisputeResolutionPrompt(params: {
  failureReasons: string[];
  attemptNumber: number;
  maxAttempts: number;
  fieldsNeedingAttention: string[];
}): string {
  const reasonExplanations: Record<string, string> = {
    id_document_unreadable:
      'The ID document image was not clear enough to read. This often happens with photos that are too dark, blurry, or at an angle.',
    id_document_expired:
      'The ID document appears to have expired. South African IDs do not typically expire, but the document date may be very old.',
    id_number_invalid_checksum:
      'The ID number entered does not pass the standard validation check. This might be a typo in one of the digits.',
    id_number_dob_mismatch:
      'The date of birth entered does not match the date encoded in the ID number. The first 6 digits of an SA ID are the birth date (YYMMDD).',
    id_number_gender_mismatch:
      'The gender selected does not match the gender code in the ID number. Digits 7-10 indicate gender (5000-9999 = male, 0000-4999 = female).',
    name_mismatch:
      'The name on the ID document does not appear to match the name entered in the form. Please check for spelling differences or ensure you used your legal name as it appears on your ID.',
    name_spelling_unclear:
      'We could not clearly read the name on your ID document. Please upload a clearer photo.',
    address_document_unreadable:
      'The proof of residence document was not clear enough to read. Please upload a clearer image.',
    address_not_recent:
      'The proof of residence document appears to be older than 3 months. Please provide a more recent document.',
    document_potentially_altered:
      'There are concerns about the authenticity of a document. Please ensure you upload original, unedited documents.',
    citizenship_visa_mismatch:
      'The citizenship/visa information does not align with the ID document type provided.',
    seta_fields_incomplete:
      'Some required fields for SETA registration are missing. Please complete all mandatory fields.',
    seta_fields_inconsistent:
      'Some of the information provided is inconsistent. For example, if you selected a disability, you need to provide details.',
  };

  const explanations = params.failureReasons
    .map((reason) => `- ${reasonExplanations[reason] || reason}`)
    .join('\n');

  return `Help a learner resolve their verification issue.

ISSUE(S) DETECTED:
${explanations}

FIELDS THAT MAY NEED ATTENTION:
${params.fieldsNeedingAttention.map((f) => `- ${f}`).join('\n')}

ATTEMPT: ${params.attemptNumber} of ${params.maxAttempts}

Compose a supportive message to the learner explaining:
1. What might have gone wrong (without accusation)
2. How they can fix it themselves
3. That they can update their information in Settings > Identity Verification
4. That their privacy is protected - you cannot see their actual data

If this is their final attempt (${params.attemptNumber} of ${params.maxAttempts}), gently mention that they may need to contact support if issues persist.

Be warm, helpful, and use simple language. Remember Ubuntu - "I am because we are."`;
}

/**
 * Parse document audit response from AI
 */
export interface DocumentAuditResponse {
  id_document_readable: {
    passed: boolean;
    confidence: number;
    issue: string | null;
  };
  id_number_valid: {
    passed: boolean;
    confidence: number;
    issue: string | null;
  };
  name_matches: {
    passed: boolean;
    confidence: number;
    issue: string | null;
  };
  dob_matches: {
    passed: boolean;
    confidence: number;
    issue: string | null;
  };
  gender_matches: {
    passed: boolean;
    confidence: number;
    issue: string | null;
  };
  proof_of_residence_valid: {
    passed: boolean;
    confidence: number;
    issue: string | null;
  };
  address_region_matches: {
    passed: boolean;
    confidence: number;
    issue: string | null;
  };
  fraud_indicators: {
    detected: boolean;
    confidence: number;
    indicators: string[];
  };
  overall_result: 'pass' | 'fail' | 'needs_clarification';
  overall_confidence: number;
  failure_reasons: string[];
}

/**
 * Parse the AI response for document audit
 */
export function parseDocumentAuditResponse(
  aiResponse: string
): DocumentAuditResponse | null {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as DocumentAuditResponse;

    // Validate required fields
    if (
      typeof parsed.overall_result !== 'string' ||
      typeof parsed.overall_confidence !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Parse SETA fields audit response
 */
export interface SETAFieldsAuditResponse {
  all_mandatory_fields_present: boolean;
  all_fields_valid: boolean;
  all_fields_consistent: boolean;
  missing_fields: string[];
  invalid_fields: string[];
  consistency_issues: string[];
  chieta_ready: boolean;
  confidence: number;
}

export function parseSETAFieldsAuditResponse(
  aiResponse: string
): SETAFieldsAuditResponse | null {
  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as SETAFieldsAuditResponse;

    if (typeof parsed.chieta_ready !== 'boolean') {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
