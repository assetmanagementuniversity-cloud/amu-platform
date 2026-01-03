/**
 * Financial Transparency Types - AMU Platform
 *
 * Section 4.3: Ubuntu Public Transparency Account
 * Section 4.8: Complete Business Function Coverage
 *
 * Types for:
 * - Xero integration
 * - Ubuntu Economics metrics
 * - Payment preparation
 * - Expense categorisation
 *
 * "Ubuntu - I am because we are"
 */

// ================================================
// XERO INTEGRATION TYPES
// ================================================

/**
 * Xero OAuth tokens
 */
export interface XeroTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  tenant_id: string;
}

/**
 * Xero account types for Ubuntu Economics
 */
export type XeroAccountCode =
  | 'REVENUE_CORPORATE'     // Corporate certification revenue
  | 'REVENUE_INDIVIDUAL'    // Individual certification revenue
  | 'EXPENSE_AI'            // Anthropic Claude API costs
  | 'EXPENSE_HOSTING'       // GCP hosting costs
  | 'EXPENSE_EMAIL'         // SendGrid/Mailchimp costs
  | 'EXPENSE_PAYMENT'       // Stripe fees
  | 'EXPENSE_SIGNATURES'    // Digital signature costs
  | 'EXPENSE_ACCOUNTING'    // Xero subscription
  | 'EXPENSE_MARKETING'     // Marketing and advertising
  | 'EXPENSE_OTHER'         // Miscellaneous expenses
  | 'RESERVE_OPERATING'     // 3-month operating reserve
  | 'RESERVE_EMERGENCY'     // Emergency fund
  | 'KARMA_PAYOUTS';        // Referral commission payouts

/**
 * Xero invoice/payment for syncing
 */
export interface XeroPayment {
  payment_id: string;
  invoice_number: string;
  contact_name: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  account_code: XeroAccountCode;
  reference?: string;
  stripe_payment_id?: string;
}

/**
 * Expense category for AI categorisation
 */
export interface ExpenseCategory {
  category_id: string;
  name: string;
  xero_account_code: XeroAccountCode;
  keywords: string[];
  typical_vendors: string[];
  description: string;
}

/**
 * Categorised expense
 */
export interface CategorisedExpense {
  expense_id: string;
  vendor_name: string;
  description: string;
  amount: number;
  date: string;
  suggested_category: XeroAccountCode;
  confidence: number;
  reasoning: string;
  requires_review: boolean;
}

// ================================================
// UBUNTU ECONOMICS TYPES
// ================================================

/**
 * High-level financial metrics for transparency dashboard
 */
export interface UbuntuEconomicsMetrics {
  period: {
    start: string;
    end: string;
    label: string;
  };

  // Revenue
  revenue: {
    total: number;
    corporate: number;
    individual: number;
    growth_percentage: number;
  };

  // Ubuntu Impact
  ubuntu_impact: {
    free_learners_supported: number;
    free_learning_hours: number;
    paid_to_free_ratio: string;  // e.g., "1:15" (1 paid supports 15 free)
    countries_reached: number;
  };

  // Karma Economics
  karma: {
    total_earned: number;
    total_paid_out: number;
    pending_payouts: number;
    active_referrers: number;
  };

  // Operating Costs
  costs: {
    total: number;
    ai_facilitation: number;
    infrastructure: number;
    payment_processing: number;
    marketing: number;
    other: number;
    cost_per_learner: number;
  };

  // Reserves (Ubuntu Love Framework)
  reserves: {
    operating_reserve: number;
    operating_reserve_months: number;
    target_reserve_months: number;
    emergency_fund: number;
    surplus_available: number;
  };

  // Sustainability
  sustainability: {
    net_margin_percentage: number;
    runway_months: number;
    break_even_status: 'pre_break_even' | 'break_even' | 'sustainable';
  };

  last_updated: string;
}

/**
 * Transaction for public ledger view
 */
export interface PublicTransaction {
  transaction_id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description: string;
  amount: number;
  impact_note?: string;  // e.g., "Supports 10 free learners"
}

// ================================================
// FNB PAYMENT PREPARATION TYPES
// ================================================

/**
 * Status of a prepared payment
 */
export type PaymentPrepStatus =
  | 'prepared'       // Claude has prepared the payment
  | 'pending_fa'     // Waiting for FA approval
  | 'approved'       // FA has approved
  | 'executed'       // Payment sent
  | 'rejected'       // FA rejected
  | 'failed';        // Execution failed

/**
 * A prepared bank payment
 */
export interface PreparedPayment {
  payment_id: string;

  // Payment details
  beneficiary: {
    name: string;
    bank: string;
    account_number: string;
    branch_code: string;
    account_type: 'cheque' | 'savings' | 'transmission';
  };

  amount: number;
  currency: 'ZAR';
  reference: string;
  my_reference: string;  // Shows on our statement

  // Authorisation
  authorisation: {
    budget_line?: string;
    board_approval_id?: string;
    invoice_reference?: string;
    expense_category: XeroAccountCode;
  };

  // Preparation
  prepared_by: 'claude';
  prepared_at: string;
  screenshot_url: string;  // Screenshot of prepared payment

  // Approval workflow
  status: PaymentPrepStatus;
  fa_notified_at?: string;
  fa_reviewed_at?: string;
  fa_reviewer_id?: string;
  fa_reviewer_name?: string;
  rejection_reason?: string;

  // Execution
  executed_at?: string;
  bank_reference?: string;

  // Xero sync
  xero_payment_id?: string;
  xero_synced_at?: string;
}

/**
 * Input for preparing a payment
 */
export interface PreparePaymentInput {
  beneficiary_name: string;
  beneficiary_bank: string;
  beneficiary_account: string;
  beneficiary_branch: string;
  beneficiary_account_type: 'cheque' | 'savings' | 'transmission';
  amount: number;
  reference: string;
  my_reference: string;
  expense_category: XeroAccountCode;
  budget_line?: string;
  board_approval_id?: string;
  invoice_reference?: string;
}

// ================================================
// EXPENSE CATEGORISATION TYPES
// ================================================

/**
 * Vendor pattern for automatic categorisation
 */
export interface VendorPattern {
  pattern: string;  // Regex pattern
  vendor_name: string;
  category: XeroAccountCode;
  confidence: number;
}

/**
 * AI categorisation result
 */
export interface CategorizationResult {
  category: XeroAccountCode;
  confidence: number;
  reasoning: string;
  alternative_categories: {
    category: XeroAccountCode;
    confidence: number;
  }[];
}

// ================================================
// DEFAULT CONFIGURATIONS
// ================================================

/**
 * Default expense categories with keywords
 */
export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    category_id: 'ai',
    name: 'AI Facilitation',
    xero_account_code: 'EXPENSE_AI',
    keywords: ['anthropic', 'claude', 'openai', 'api', 'tokens', 'ai'],
    typical_vendors: ['Anthropic', 'OpenAI'],
    description: 'Claude API and AI service costs',
  },
  {
    category_id: 'hosting',
    name: 'Cloud Infrastructure',
    xero_account_code: 'EXPENSE_HOSTING',
    keywords: ['google cloud', 'gcp', 'firebase', 'cloud run', 'storage', 'bandwidth', 'compute'],
    typical_vendors: ['Google Cloud Platform', 'Firebase'],
    description: 'GCP hosting, Firestore, Cloud Run, Storage',
  },
  {
    category_id: 'email',
    name: 'Email Services',
    xero_account_code: 'EXPENSE_EMAIL',
    keywords: ['sendgrid', 'mailchimp', 'email', 'smtp', 'newsletter'],
    typical_vendors: ['SendGrid', 'Mailchimp', 'Twilio'],
    description: 'Transactional and marketing email services',
  },
  {
    category_id: 'payment',
    name: 'Payment Processing',
    xero_account_code: 'EXPENSE_PAYMENT',
    keywords: ['stripe', 'payment', 'transaction', 'processing fee'],
    typical_vendors: ['Stripe'],
    description: 'Payment processing fees from Stripe',
  },
  {
    category_id: 'signatures',
    name: 'Digital Signatures',
    xero_account_code: 'EXPENSE_SIGNATURES',
    keywords: ['signrequest', 'docusign', 'signature', 'esign', 'signing'],
    typical_vendors: ['SignRequest', 'DocuSign'],
    description: 'Digital signature services for SETA documents',
  },
  {
    category_id: 'accounting',
    name: 'Accounting Software',
    xero_account_code: 'EXPENSE_ACCOUNTING',
    keywords: ['xero', 'accounting', 'bookkeeping'],
    typical_vendors: ['Xero'],
    description: 'Xero subscription and accounting tools',
  },
  {
    category_id: 'marketing',
    name: 'Marketing & Advertising',
    xero_account_code: 'EXPENSE_MARKETING',
    keywords: ['advertising', 'ads', 'marketing', 'promotion', 'linkedin', 'facebook', 'google ads'],
    typical_vendors: ['LinkedIn', 'Facebook', 'Google Ads'],
    description: 'Marketing campaigns and advertising spend',
  },
];

/**
 * Known vendor patterns for automatic categorisation
 */
export const VENDOR_PATTERNS: VendorPattern[] = [
  { pattern: 'anthropic', vendor_name: 'Anthropic', category: 'EXPENSE_AI', confidence: 0.99 },
  { pattern: 'google.*cloud|gcp|firebase', vendor_name: 'Google Cloud', category: 'EXPENSE_HOSTING', confidence: 0.95 },
  { pattern: 'sendgrid|twilio', vendor_name: 'SendGrid/Twilio', category: 'EXPENSE_EMAIL', confidence: 0.95 },
  { pattern: 'mailchimp', vendor_name: 'Mailchimp', category: 'EXPENSE_EMAIL', confidence: 0.95 },
  { pattern: 'stripe', vendor_name: 'Stripe', category: 'EXPENSE_PAYMENT', confidence: 0.99 },
  { pattern: 'signrequest', vendor_name: 'SignRequest', category: 'EXPENSE_SIGNATURES', confidence: 0.99 },
  { pattern: 'docusign', vendor_name: 'DocuSign', category: 'EXPENSE_SIGNATURES', confidence: 0.99 },
  { pattern: 'xero', vendor_name: 'Xero', category: 'EXPENSE_ACCOUNTING', confidence: 0.99 },
];

/**
 * Ubuntu Economics ratio targets
 */
export const UBUNTU_TARGETS = {
  // Reserve targets
  operating_reserve_months: 3,
  emergency_fund_percentage: 0.05,  // 5% of annual revenue

  // Cost ratios
  max_ai_cost_percentage: 0.30,     // AI costs should be max 30% of revenue
  max_infrastructure_percentage: 0.15,
  max_marketing_percentage: 0.20,

  // Impact targets
  min_paid_to_free_ratio: 10,       // Each paid learner should support 10+ free

  // Sustainability
  target_net_margin: 0.15,          // 15% net margin for sustainability
};
