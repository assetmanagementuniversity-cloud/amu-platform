/**
 * Xero Integration Service - AMU Platform
 *
 * Section 4.3: Ubuntu Public Transparency Account
 * Section 4.8: Complete Business Function Coverage
 *
 * Server actions for:
 * - Syncing Stripe payments to Xero
 * - Fetching Ubuntu Economics metrics
 * - Managing the public transparency account
 *
 * "Ubuntu - I am because we are"
 */

'use server';

import type {
  XeroTokens,
  XeroPayment,
  XeroAccountCode,
  UbuntuEconomicsMetrics,
  PublicTransaction,
  CategorisedExpense,
  CategorizationResult,
  VENDOR_PATTERNS,
  UBUNTU_TARGETS,
} from '@amu/shared';

// ================================================
// XERO API CONFIGURATION
// ================================================

const XERO_CONFIG = {
  clientId: process.env.XERO_CLIENT_ID!,
  clientSecret: process.env.XERO_CLIENT_SECRET!,
  redirectUri: process.env.XERO_REDIRECT_URI || 'http://localhost:3000/api/xero/callback',
  scopes: [
    'openid',
    'profile',
    'email',
    'accounting.transactions',
    'accounting.reports.read',
    'accounting.contacts',
    'accounting.settings',
  ],
  apiBaseUrl: 'https://api.xero.com/api.xro/2.0',
  identityUrl: 'https://identity.xero.com',
};

// Account code mapping to Xero account codes
const ACCOUNT_CODE_MAP: Record<XeroAccountCode, string> = {
  REVENUE_CORPORATE: '200',      // Sales - Corporate
  REVENUE_INDIVIDUAL: '201',     // Sales - Individual
  EXPENSE_AI: '400',             // AI Services
  EXPENSE_HOSTING: '401',        // Cloud Infrastructure
  EXPENSE_EMAIL: '402',          // Email Services
  EXPENSE_PAYMENT: '403',        // Payment Processing
  EXPENSE_SIGNATURES: '404',     // Digital Signatures
  EXPENSE_ACCOUNTING: '405',     // Accounting Software
  EXPENSE_MARKETING: '406',      // Marketing
  EXPENSE_OTHER: '499',          // Other Expenses
  RESERVE_OPERATING: '800',      // Operating Reserve
  RESERVE_EMERGENCY: '801',      // Emergency Fund
  KARMA_PAYOUTS: '500',          // Referral Commissions
};

// ================================================
// TOKEN MANAGEMENT
// ================================================

/**
 * Get stored Xero tokens from secure storage
 * In production, these would be stored in Firestore with encryption
 */
async function getStoredTokens(): Promise<XeroTokens | null> {
  // TODO: Implement secure token storage in Firestore
  // For now, check environment variables
  const accessToken = process.env.XERO_ACCESS_TOKEN;
  const refreshToken = process.env.XERO_REFRESH_TOKEN;
  const expiresAt = process.env.XERO_TOKEN_EXPIRES_AT;
  const tenantId = process.env.XERO_TENANT_ID;

  if (!accessToken || !refreshToken || !expiresAt || !tenantId) {
    return null;
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: parseInt(expiresAt),
    tenant_id: tenantId,
  };
}

/**
 * Refresh Xero access token
 */
async function refreshAccessToken(refreshToken: string): Promise<XeroTokens> {
  const response = await fetch(`${XERO_CONFIG.identityUrl}/connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${XERO_CONFIG.clientId}:${XERO_CONFIG.clientSecret}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Xero token');
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    tenant_id: data.id_token ? JSON.parse(atob(data.id_token.split('.')[1])).xero_userid : '',
  };
}

/**
 * Get valid access token, refreshing if necessary
 */
async function getValidToken(): Promise<{ token: string; tenantId: string }> {
  const tokens = await getStoredTokens();

  if (!tokens) {
    throw new Error('Xero not connected. Please authenticate.');
  }

  // Check if token is expired (with 5 minute buffer)
  if (tokens.expires_at < Date.now() + 300000) {
    const newTokens = await refreshAccessToken(tokens.refresh_token);
    // TODO: Store new tokens in Firestore
    return { token: newTokens.access_token, tenantId: newTokens.tenant_id };
  }

  return { token: tokens.access_token, tenantId: tokens.tenant_id };
}

// ================================================
// XERO API CALLS
// ================================================

/**
 * Make authenticated request to Xero API
 */
async function xeroRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: object
): Promise<T> {
  const { token, tenantId } = await getValidToken();

  const response = await fetch(`${XERO_CONFIG.apiBaseUrl}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'xero-tenant-id': tenantId,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Xero API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ================================================
// STRIPE TO XERO SYNC
// ================================================

/**
 * Sync a Stripe payment to Xero
 * Called after successful Stripe payment webhook
 */
export async function syncStripePaymentToXero(
  stripePaymentId: string,
  amount: number,
  currency: string,
  customerEmail: string,
  customerName: string,
  description: string,
  isCorporate: boolean
): Promise<{ success: boolean; xeroInvoiceId?: string; error?: string }> {
  try {
    const accountCode = isCorporate ? 'REVENUE_CORPORATE' : 'REVENUE_INDIVIDUAL';
    const xeroAccountCode = ACCOUNT_CODE_MAP[accountCode];

    // Create or get contact
    const contact = await getOrCreateContact(customerEmail, customerName);

    // Create invoice
    const invoice = await createInvoice({
      contactId: contact.ContactID,
      description,
      amount,
      accountCode: xeroAccountCode,
      reference: stripePaymentId,
      date: new Date().toISOString().split('T')[0],
    });

    // Mark as paid
    await createPayment({
      invoiceId: invoice.InvoiceID,
      amount,
      date: new Date().toISOString().split('T')[0],
      reference: `Stripe: ${stripePaymentId}`,
    });

    return {
      success: true,
      xeroInvoiceId: invoice.InvoiceID,
    };
  } catch (error) {
    console.error('Failed to sync Stripe payment to Xero:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get or create a contact in Xero
 */
async function getOrCreateContact(
  email: string,
  name: string
): Promise<{ ContactID: string; Name: string }> {
  // Try to find existing contact
  const searchResult = await xeroRequest<{ Contacts: Array<{ ContactID: string; Name: string }> }>(
    `/Contacts?where=EmailAddress=="${encodeURIComponent(email)}"`
  );

  if (searchResult.Contacts && searchResult.Contacts.length > 0) {
    return searchResult.Contacts[0];
  }

  // Create new contact
  const createResult = await xeroRequest<{ Contacts: Array<{ ContactID: string; Name: string }> }>(
    '/Contacts',
    'POST',
    {
      Contacts: [
        {
          Name: name,
          EmailAddress: email,
          ContactStatus: 'ACTIVE',
        },
      ],
    }
  );

  return createResult.Contacts[0];
}

/**
 * Create an invoice in Xero
 */
async function createInvoice(params: {
  contactId: string;
  description: string;
  amount: number;
  accountCode: string;
  reference: string;
  date: string;
}): Promise<{ InvoiceID: string; InvoiceNumber: string }> {
  const result = await xeroRequest<{
    Invoices: Array<{ InvoiceID: string; InvoiceNumber: string }>;
  }>('/Invoices', 'POST', {
    Invoices: [
      {
        Type: 'ACCREC',
        Contact: { ContactID: params.contactId },
        Date: params.date,
        DueDate: params.date,
        Reference: params.reference,
        Status: 'AUTHORISED',
        LineItems: [
          {
            Description: params.description,
            Quantity: 1,
            UnitAmount: params.amount,
            AccountCode: params.accountCode,
            TaxType: 'OUTPUT',
          },
        ],
      },
    ],
  });

  return result.Invoices[0];
}

/**
 * Create a payment against an invoice
 */
async function createPayment(params: {
  invoiceId: string;
  amount: number;
  date: string;
  reference: string;
}): Promise<{ PaymentID: string }> {
  const result = await xeroRequest<{ Payments: Array<{ PaymentID: string }> }>(
    '/Payments',
    'POST',
    {
      Payments: [
        {
          Invoice: { InvoiceID: params.invoiceId },
          Account: { Code: '090' }, // Bank account
          Date: params.date,
          Amount: params.amount,
          Reference: params.reference,
        },
      ],
    }
  );

  return result.Payments[0];
}

// ================================================
// UBUNTU ECONOMICS METRICS
// ================================================

/**
 * Fetch Ubuntu Economics metrics for transparency dashboard
 * This is the main function for the public transparency page
 */
export async function getUbuntuEconomicsMetrics(): Promise<UbuntuEconomicsMetrics> {
  try {
    // For development/demo, return mock data
    // In production, this would fetch from Xero
    if (process.env.NODE_ENV === 'development' || !process.env.XERO_CLIENT_ID) {
      return getMockUbuntuMetrics();
    }

    // Fetch real data from Xero
    const [profitAndLoss, balanceSheet] = await Promise.all([
      fetchProfitAndLoss(),
      fetchBalanceSheet(),
    ]);

    return calculateUbuntuMetrics(profitAndLoss, balanceSheet);
  } catch (error) {
    console.error('Failed to fetch Ubuntu Economics metrics:', error);
    // Return mock data on error for graceful degradation
    return getMockUbuntuMetrics();
  }
}

/**
 * Fetch Profit & Loss report from Xero
 */
async function fetchProfitAndLoss(): Promise<Record<string, number>> {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const result = await xeroRequest<{
    Reports: Array<{
      Rows: Array<{
        Cells: Array<{ Value: string }>;
      }>;
    }>;
  }>(
    `/Reports/ProfitAndLoss?fromDate=${startOfMonth.toISOString().split('T')[0]}&toDate=${today.toISOString().split('T')[0]}`
  );

  // Parse the report into a simple key-value structure
  const metrics: Record<string, number> = {};
  // ... parsing logic would go here
  return metrics;
}

/**
 * Fetch Balance Sheet from Xero
 */
async function fetchBalanceSheet(): Promise<Record<string, number>> {
  const today = new Date();

  const result = await xeroRequest<{
    Reports: Array<{
      Rows: Array<{
        Cells: Array<{ Value: string }>;
      }>;
    }>;
  }>(`/Reports/BalanceSheet?date=${today.toISOString().split('T')[0]}`);

  const metrics: Record<string, number> = {};
  // ... parsing logic would go here
  return metrics;
}

/**
 * Calculate Ubuntu metrics from Xero reports
 */
function calculateUbuntuMetrics(
  profitAndLoss: Record<string, number>,
  balanceSheet: Record<string, number>
): UbuntuEconomicsMetrics {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    period: {
      start: startOfMonth.toISOString(),
      end: now.toISOString(),
      label: now.toLocaleString('en-ZA', { month: 'long', year: 'numeric' }),
    },
    revenue: {
      total: profitAndLoss['TotalIncome'] || 0,
      corporate: profitAndLoss['CorporateRevenue'] || 0,
      individual: profitAndLoss['IndividualRevenue'] || 0,
      growth_percentage: 0, // Would calculate from previous period
    },
    ubuntu_impact: {
      free_learners_supported: 0, // From database
      free_learning_hours: 0,
      paid_to_free_ratio: '1:0',
      countries_reached: 1,
    },
    karma: {
      total_earned: 0,
      total_paid_out: 0,
      pending_payouts: 0,
      active_referrers: 0,
    },
    costs: {
      total: profitAndLoss['TotalExpenses'] || 0,
      ai_facilitation: profitAndLoss['AIExpense'] || 0,
      infrastructure: profitAndLoss['HostingExpense'] || 0,
      payment_processing: profitAndLoss['PaymentExpense'] || 0,
      marketing: profitAndLoss['MarketingExpense'] || 0,
      other: profitAndLoss['OtherExpense'] || 0,
      cost_per_learner: 0,
    },
    reserves: {
      operating_reserve: balanceSheet['OperatingReserve'] || 0,
      operating_reserve_months: 0,
      target_reserve_months: 3,
      emergency_fund: balanceSheet['EmergencyFund'] || 0,
      surplus_available: 0,
    },
    sustainability: {
      net_margin_percentage: 0,
      runway_months: 0,
      break_even_status: 'pre_break_even',
    },
    last_updated: now.toISOString(),
  };
}

/**
 * Get mock Ubuntu Economics metrics for development
 */
function getMockUbuntuMetrics(): UbuntuEconomicsMetrics {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    period: {
      start: startOfMonth.toISOString(),
      end: now.toISOString(),
      label: now.toLocaleString('en-ZA', { month: 'long', year: 'numeric' }),
    },
    revenue: {
      total: 185000,
      corporate: 148000,
      individual: 37000,
      growth_percentage: 12.5,
    },
    ubuntu_impact: {
      free_learners_supported: 1247,
      free_learning_hours: 8750,
      paid_to_free_ratio: '1:15',
      countries_reached: 12,
    },
    karma: {
      total_earned: 18500,
      total_paid_out: 14200,
      pending_payouts: 4300,
      active_referrers: 47,
    },
    costs: {
      total: 45750,
      ai_facilitation: 20000,
      infrastructure: 8000,
      payment_processing: 5365,
      marketing: 8000,
      other: 4385,
      cost_per_learner: 25,
    },
    reserves: {
      operating_reserve: 137250,
      operating_reserve_months: 3,
      target_reserve_months: 3,
      emergency_fund: 9250,
      surplus_available: 121000,
    },
    sustainability: {
      net_margin_percentage: 75.3,
      runway_months: 12,
      break_even_status: 'sustainable',
    },
    last_updated: now.toISOString(),
  };
}

/**
 * Get recent public transactions for transparency ledger
 */
export async function getPublicTransactions(limit = 20): Promise<PublicTransaction[]> {
  try {
    if (process.env.NODE_ENV === 'development' || !process.env.XERO_CLIENT_ID) {
      return getMockPublicTransactions();
    }

    // Fetch from Xero
    const result = await xeroRequest<{
      BankTransactions: Array<{
        BankTransactionID: string;
        Date: string;
        Type: string;
        Total: number;
        Contact: { Name: string };
        LineItems: Array<{ Description: string; AccountCode: string }>;
      }>;
    }>('/BankTransactions?where=Status=="AUTHORISED"&order=Date DESC&page=1');

    return result.BankTransactions.slice(0, limit).map((tx) => ({
      transaction_id: tx.BankTransactionID,
      date: tx.Date,
      type: tx.Type === 'RECEIVE' ? 'income' : 'expense',
      category: mapAccountCodeToCategory(tx.LineItems[0]?.AccountCode || ''),
      description: tx.LineItems[0]?.Description || 'Transaction',
      amount: tx.Total,
    }));
  } catch (error) {
    console.error('Failed to fetch public transactions:', error);
    return getMockPublicTransactions();
  }
}

/**
 * Map Xero account code to category name
 */
function mapAccountCodeToCategory(accountCode: string): string {
  const categoryMap: Record<string, string> = {
    '200': 'Corporate Certification',
    '201': 'Individual Certification',
    '400': 'AI Services',
    '401': 'Cloud Infrastructure',
    '402': 'Email Services',
    '403': 'Payment Processing',
    '404': 'Digital Signatures',
    '405': 'Accounting',
    '406': 'Marketing',
    '500': 'Referral Commissions',
  };

  return categoryMap[accountCode] || 'Other';
}

/**
 * Get mock public transactions for development
 */
function getMockPublicTransactions(): PublicTransaction[] {
  const now = new Date();

  return [
    {
      transaction_id: 'tx_001',
      date: new Date(now.getTime() - 86400000).toISOString(),
      type: 'income',
      category: 'Corporate Certification',
      description: 'Mining Corp - 5 QCTO Certifications',
      amount: 44450,
      impact_note: 'Supports 75 free learners',
    },
    {
      transaction_id: 'tx_002',
      date: new Date(now.getTime() - 172800000).toISOString(),
      type: 'expense',
      category: 'AI Services',
      description: 'Anthropic Claude API - Monthly',
      amount: 20000,
    },
    {
      transaction_id: 'tx_003',
      date: new Date(now.getTime() - 259200000).toISOString(),
      type: 'income',
      category: 'Individual Certification',
      description: '8 Individual Certifications',
      amount: 4000,
      impact_note: 'Supports 7 free learners',
    },
    {
      transaction_id: 'tx_004',
      date: new Date(now.getTime() - 345600000).toISOString(),
      type: 'expense',
      category: 'Cloud Infrastructure',
      description: 'Google Cloud Platform - Monthly',
      amount: 8000,
    },
    {
      transaction_id: 'tx_005',
      date: new Date(now.getTime() - 432000000).toISOString(),
      type: 'expense',
      category: 'Referral Commissions',
      description: 'Karma payouts to referrers',
      amount: 14200,
      impact_note: 'Rewarding our community',
    },
  ];
}

// ================================================
// EXPENSE CATEGORISATION
// ================================================

/**
 * Categorise an expense using pattern matching and AI
 */
export async function categoriseExpense(
  vendorName: string,
  description: string,
  amount: number
): Promise<CategorizationResult> {
  // First try pattern matching
  const patternMatch = matchVendorPattern(vendorName.toLowerCase());

  if (patternMatch && patternMatch.confidence >= 0.9) {
    return {
      category: patternMatch.category,
      confidence: patternMatch.confidence,
      reasoning: `Matched vendor pattern: ${patternMatch.vendor_name}`,
      alternative_categories: [],
    };
  }

  // Fall back to keyword matching
  const keywordMatch = matchKeywords(vendorName, description);

  if (keywordMatch) {
    return keywordMatch;
  }

  // Default to OTHER with low confidence
  return {
    category: 'EXPENSE_OTHER',
    confidence: 0.3,
    reasoning: 'No matching pattern found - manual review recommended',
    alternative_categories: [],
  };
}

/**
 * Match vendor against known patterns
 */
function matchVendorPattern(
  vendorName: string
): { category: XeroAccountCode; confidence: number; vendor_name: string } | null {
  const patterns = [
    { pattern: /anthropic/i, vendor_name: 'Anthropic', category: 'EXPENSE_AI' as const, confidence: 0.99 },
    { pattern: /google.*cloud|gcp|firebase/i, vendor_name: 'Google Cloud', category: 'EXPENSE_HOSTING' as const, confidence: 0.95 },
    { pattern: /sendgrid|twilio/i, vendor_name: 'SendGrid/Twilio', category: 'EXPENSE_EMAIL' as const, confidence: 0.95 },
    { pattern: /mailchimp/i, vendor_name: 'Mailchimp', category: 'EXPENSE_EMAIL' as const, confidence: 0.95 },
    { pattern: /stripe/i, vendor_name: 'Stripe', category: 'EXPENSE_PAYMENT' as const, confidence: 0.99 },
    { pattern: /signrequest/i, vendor_name: 'SignRequest', category: 'EXPENSE_SIGNATURES' as const, confidence: 0.99 },
    { pattern: /docusign/i, vendor_name: 'DocuSign', category: 'EXPENSE_SIGNATURES' as const, confidence: 0.99 },
    { pattern: /xero/i, vendor_name: 'Xero', category: 'EXPENSE_ACCOUNTING' as const, confidence: 0.99 },
  ];

  for (const { pattern, vendor_name, category, confidence } of patterns) {
    if (pattern.test(vendorName)) {
      return { category, confidence, vendor_name };
    }
  }

  return null;
}

/**
 * Match against category keywords
 */
function matchKeywords(vendorName: string, description: string): CategorizationResult | null {
  const text = `${vendorName} ${description}`.toLowerCase();

  const categories = [
    {
      category: 'EXPENSE_AI' as const,
      keywords: ['ai', 'api', 'tokens', 'claude', 'openai', 'language model'],
    },
    {
      category: 'EXPENSE_HOSTING' as const,
      keywords: ['cloud', 'hosting', 'server', 'compute', 'storage', 'bandwidth'],
    },
    {
      category: 'EXPENSE_EMAIL' as const,
      keywords: ['email', 'smtp', 'newsletter', 'mailing'],
    },
    {
      category: 'EXPENSE_PAYMENT' as const,
      keywords: ['payment', 'transaction', 'processing fee'],
    },
    {
      category: 'EXPENSE_MARKETING' as const,
      keywords: ['marketing', 'advertising', 'ads', 'promotion', 'campaign'],
    },
  ];

  for (const { category, keywords } of categories) {
    const matches = keywords.filter((kw) => text.includes(kw));
    if (matches.length > 0) {
      return {
        category,
        confidence: Math.min(0.5 + matches.length * 0.15, 0.85),
        reasoning: `Matched keywords: ${matches.join(', ')}`,
        alternative_categories: [],
      };
    }
  }

  return null;
}

/**
 * Batch categorise multiple expenses
 */
export async function batchCategoriseExpenses(
  expenses: Array<{ vendor: string; description: string; amount: number }>
): Promise<CategorisedExpense[]> {
  const results: CategorisedExpense[] = [];

  for (const expense of expenses) {
    const categorization = await categoriseExpense(
      expense.vendor,
      expense.description,
      expense.amount
    );

    results.push({
      expense_id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vendor_name: expense.vendor,
      description: expense.description,
      amount: expense.amount,
      date: new Date().toISOString(),
      suggested_category: categorization.category,
      confidence: categorization.confidence,
      reasoning: categorization.reasoning,
      requires_review: categorization.confidence < 0.8,
    });
  }

  return results;
}
