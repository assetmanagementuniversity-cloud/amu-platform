/**
 * FNB Payment Preparer - AMU Platform
 *
 * Section 4.8: Banking Operations Detail
 *
 * Playwright automation for FNB Business Banking:
 * - Claude prepares payments (fills in details, does NOT submit)
 * - Captures screenshot of prepared payment
 * - Notifies FA (Financial Administrator) for approval
 * - FA logs in separately to verify and execute
 *
 * IMPORTANT SECURITY NOTES:
 * - Claude NEVER submits payments
 * - All payments require FA manual execution
 * - Screenshots provide audit trail
 * - Credentials stored securely in environment variables
 *
 * "Ubuntu - I am because we are"
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import type {
  PreparedPayment,
  PreparePaymentInput,
  PaymentPrepStatus,
  XeroAccountCode,
} from '@amu/shared';

// ================================================
// CONFIGURATION
// ================================================

const FNB_CONFIG = {
  loginUrl: 'https://www.fnb.co.za/login',
  businessBankingUrl: 'https://www.fnb.co.za/business-banking',
  paymentUrl: 'https://www.fnb.co.za/business-banking/payments/once-off',
  timeouts: {
    navigation: 30000,
    element: 10000,
    action: 5000,
  },
};

// ================================================
// TYPES
// ================================================

interface FNBCredentials {
  username: string;
  password: string;
  pin?: string;
}

interface PreparePaymentResult {
  success: boolean;
  payment?: PreparedPayment;
  error?: string;
  screenshotPath?: string;
}

interface BankDetails {
  bankName: string;
  branchCode: string;
  swiftCode?: string;
}

// ================================================
// BANK CODES
// ================================================

const SOUTH_AFRICAN_BANKS: Record<string, BankDetails> = {
  fnb: { bankName: 'First National Bank', branchCode: '250655' },
  absa: { bankName: 'ABSA Bank', branchCode: '632005' },
  standardbank: { bankName: 'Standard Bank', branchCode: '051001' },
  nedbank: { bankName: 'Nedbank', branchCode: '198765' },
  capitec: { bankName: 'Capitec Bank', branchCode: '470010' },
  investec: { bankName: 'Investec Bank', branchCode: '580105' },
  africanbank: { bankName: 'African Bank', branchCode: '430000' },
  bidvest: { bankName: 'Bidvest Bank', branchCode: '462005' },
  discovery: { bankName: 'Discovery Bank', branchCode: '679000' },
  tymebank: { bankName: 'TymeBank', branchCode: '678910' },
};

// ================================================
// FNB PAYMENT PREPARER CLASS
// ================================================

export class FNBPaymentPreparer {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true, // Run in headless mode for server
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await this.context.newPage();
  }

  /**
   * Close browser and cleanup
   */
  async cleanup(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();

    this.page = null;
    this.context = null;
    this.browser = null;
    this.isLoggedIn = false;
  }

  /**
   * Login to FNB Business Banking
   * SECURITY: Credentials from environment variables only
   */
  async login(): Promise<boolean> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const credentials = this.getCredentials();

    try {
      // Navigate to login page
      await this.page.goto(FNB_CONFIG.loginUrl, {
        waitUntil: 'networkidle',
        timeout: FNB_CONFIG.timeouts.navigation,
      });

      // Wait for login form
      await this.page.waitForSelector('#user', {
        timeout: FNB_CONFIG.timeouts.element,
      });

      // Enter credentials
      await this.page.fill('#user', credentials.username);
      await this.page.fill('#pass', credentials.password);

      // Click login button
      await this.page.click('button[type="submit"]');

      // Wait for navigation to dashboard or 2FA
      await this.page.waitForNavigation({
        waitUntil: 'networkidle',
        timeout: FNB_CONFIG.timeouts.navigation,
      });

      // Check if 2FA/PIN is required
      const pinInput = await this.page.$('#pin');
      if (pinInput && credentials.pin) {
        await this.page.fill('#pin', credentials.pin);
        await this.page.click('button[type="submit"]');
        await this.page.waitForNavigation({
          waitUntil: 'networkidle',
          timeout: FNB_CONFIG.timeouts.navigation,
        });
      }

      // Verify successful login
      const dashboardElement = await this.page.$('[data-testid="dashboard"]');
      this.isLoggedIn = !!dashboardElement;

      return this.isLoggedIn;
    } catch (error) {
      console.error('FNB login failed:', error);
      this.isLoggedIn = false;
      return false;
    }
  }

  /**
   * Prepare a payment (fill form but DO NOT submit)
   * This is the main function - Claude prepares, FA executes
   */
  async preparePayment(input: PreparePaymentInput): Promise<PreparePaymentResult> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    if (!this.isLoggedIn) {
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        return {
          success: false,
          error: 'Failed to login to FNB Business Banking',
        };
      }
    }

    try {
      // Navigate to once-off payment page
      await this.page.goto(FNB_CONFIG.paymentUrl, {
        waitUntil: 'networkidle',
        timeout: FNB_CONFIG.timeouts.navigation,
      });

      // Wait for payment form to load
      await this.page.waitForSelector('[data-testid="payment-form"]', {
        timeout: FNB_CONFIG.timeouts.element,
      });

      // Fill beneficiary details
      await this.fillBeneficiaryDetails(input);

      // Fill payment amount
      await this.fillPaymentAmount(input);

      // Fill references
      await this.fillReferences(input);

      // DO NOT CLICK SUBMIT - This is critical!
      // Claude prepares, FA executes

      // Take screenshot of prepared payment
      const screenshotPath = await this.capturePaymentScreenshot(input);

      // Generate payment record
      const payment = this.createPaymentRecord(input, screenshotPath);

      return {
        success: true,
        payment,
        screenshotPath,
      };
    } catch (error) {
      console.error('Payment preparation failed:', error);

      // Capture error screenshot for debugging
      const errorScreenshotPath = await this.captureErrorScreenshot();

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        screenshotPath: errorScreenshotPath,
      };
    }
  }

  /**
   * Fill beneficiary details in the payment form
   */
  private async fillBeneficiaryDetails(input: PreparePaymentInput): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    // Beneficiary name
    await this.page.fill(
      '[data-testid="beneficiary-name"], #beneficiaryName',
      input.beneficiary_name
    );

    // Bank selection
    const bankInfo = this.getBankInfo(input.beneficiary_bank);
    await this.page.selectOption(
      '[data-testid="bank-select"], #bankSelect',
      bankInfo.bankName
    );

    // Branch code (universal branch codes for major banks)
    await this.page.fill(
      '[data-testid="branch-code"], #branchCode',
      input.beneficiary_branch || bankInfo.branchCode
    );

    // Account number
    await this.page.fill(
      '[data-testid="account-number"], #accountNumber',
      input.beneficiary_account
    );

    // Account type
    const accountTypeMap: Record<string, string> = {
      cheque: 'Current/Cheque',
      savings: 'Savings',
      transmission: 'Transmission',
    };
    await this.page.selectOption(
      '[data-testid="account-type"], #accountType',
      accountTypeMap[input.beneficiary_account_type] || 'Current/Cheque'
    );

    // Small delay to ensure form updates
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill payment amount
   */
  private async fillPaymentAmount(input: PreparePaymentInput): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    // Format amount (remove decimals for ZAR)
    const formattedAmount = input.amount.toFixed(2);

    await this.page.fill(
      '[data-testid="payment-amount"], #paymentAmount',
      formattedAmount
    );
  }

  /**
   * Fill payment references
   */
  private async fillReferences(input: PreparePaymentInput): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    // Their reference (shows on beneficiary's statement)
    await this.page.fill(
      '[data-testid="their-reference"], #theirReference',
      input.reference.substring(0, 30) // FNB limit
    );

    // My reference (shows on our statement)
    await this.page.fill(
      '[data-testid="my-reference"], #myReference',
      input.my_reference.substring(0, 30) // FNB limit
    );
  }

  /**
   * Capture screenshot of prepared payment
   */
  private async capturePaymentScreenshot(input: PreparePaymentInput): Promise<string> {
    if (!this.page) throw new Error('Page not available');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `payment_${timestamp}_${input.beneficiary_name.replace(/\s+/g, '_')}.png`;
    const screenshotPath = `/tmp/fnb-screenshots/${filename}`;

    // Scroll to show full payment form
    await this.page.evaluate(() => {
      const form = document.querySelector('[data-testid="payment-form"]');
      form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    await this.page.waitForTimeout(500);

    // Capture full page screenshot
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: false,
      type: 'png',
    });

    // In production, upload to Cloud Storage and return URL
    // For now, return local path
    return screenshotPath;
  }

  /**
   * Capture error screenshot for debugging
   */
  private async captureErrorScreenshot(): Promise<string> {
    if (!this.page) return '';

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `error_${timestamp}.png`;
    const screenshotPath = `/tmp/fnb-screenshots/${filename}`;

    try {
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png',
      });
      return screenshotPath;
    } catch {
      return '';
    }
  }

  /**
   * Create payment record for database storage
   */
  private createPaymentRecord(
    input: PreparePaymentInput,
    screenshotPath: string
  ): PreparedPayment {
    const now = new Date().toISOString();
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      payment_id: paymentId,
      beneficiary: {
        name: input.beneficiary_name,
        bank: input.beneficiary_bank,
        account_number: input.beneficiary_account,
        branch_code: input.beneficiary_branch,
        account_type: input.beneficiary_account_type,
      },
      amount: input.amount,
      currency: 'ZAR',
      reference: input.reference,
      my_reference: input.my_reference,
      authorisation: {
        budget_line: input.budget_line,
        board_approval_id: input.board_approval_id,
        invoice_reference: input.invoice_reference,
        expense_category: input.expense_category,
      },
      prepared_by: 'claude',
      prepared_at: now,
      screenshot_url: screenshotPath,
      status: 'prepared',
    };
  }

  /**
   * Get bank information from bank identifier
   */
  private getBankInfo(bankIdentifier: string): BankDetails {
    const normalizedId = bankIdentifier.toLowerCase().replace(/\s+/g, '');

    // Try direct match
    if (SOUTH_AFRICAN_BANKS[normalizedId]) {
      return SOUTH_AFRICAN_BANKS[normalizedId];
    }

    // Try partial match
    for (const [key, value] of Object.entries(SOUTH_AFRICAN_BANKS)) {
      if (normalizedId.includes(key) || value.bankName.toLowerCase().includes(normalizedId)) {
        return value;
      }
    }

    // Default to FNB if not found
    return SOUTH_AFRICAN_BANKS.fnb;
  }

  /**
   * Get FNB credentials from environment
   */
  private getCredentials(): FNBCredentials {
    const username = process.env.FNB_USERNAME;
    const password = process.env.FNB_PASSWORD;
    const pin = process.env.FNB_PIN;

    if (!username || !password) {
      throw new Error(
        'FNB credentials not configured. Set FNB_USERNAME and FNB_PASSWORD environment variables.'
      );
    }

    return { username, password, pin };
  }
}

// ================================================
// EXPORTED FUNCTIONS
// ================================================

/**
 * Prepare a payment for FA approval
 * Main entry point for Claude to use
 */
export async function preparePaymentForApproval(
  input: PreparePaymentInput
): Promise<PreparePaymentResult> {
  const preparer = new FNBPaymentPreparer();

  try {
    await preparer.initialize();
    const result = await preparer.preparePayment(input);
    return result;
  } finally {
    await preparer.cleanup();
  }
}

/**
 * Validate payment input before preparation
 */
export function validatePaymentInput(input: PreparePaymentInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!input.beneficiary_name?.trim()) {
    errors.push('Beneficiary name is required');
  }

  if (!input.beneficiary_account?.trim()) {
    errors.push('Beneficiary account number is required');
  }

  if (!input.beneficiary_bank?.trim()) {
    errors.push('Beneficiary bank is required');
  }

  if (!input.amount || input.amount <= 0) {
    errors.push('Valid payment amount is required');
  }

  if (input.amount > 1000000) {
    errors.push('Payment amount exceeds R1,000,000 limit - requires special approval');
  }

  if (!input.reference?.trim()) {
    errors.push('Payment reference is required');
  }

  // Reference length (FNB limits)
  if (input.reference && input.reference.length > 30) {
    errors.push('Reference must be 30 characters or less');
  }

  if (input.my_reference && input.my_reference.length > 30) {
    errors.push('My reference must be 30 characters or less');
  }

  // Account number validation (basic)
  if (input.beneficiary_account && !/^\d{7,15}$/.test(input.beneficiary_account.replace(/\s/g, ''))) {
    errors.push('Account number appears invalid (should be 7-15 digits)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format payment summary for FA notification
 */
export function formatPaymentSummary(payment: PreparedPayment): string {
  return `
PAYMENT PREPARED FOR APPROVAL
=============================
Payment ID: ${payment.payment_id}
Prepared at: ${new Date(payment.prepared_at).toLocaleString('en-ZA')}

BENEFICIARY DETAILS
-------------------
Name: ${payment.beneficiary.name}
Bank: ${payment.beneficiary.bank}
Account: ${payment.beneficiary.account_number}
Branch: ${payment.beneficiary.branch_code}
Type: ${payment.beneficiary.account_type}

PAYMENT DETAILS
---------------
Amount: R ${payment.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
Reference: ${payment.reference}
Our Reference: ${payment.my_reference}

AUTHORISATION
-------------
Budget Line: ${payment.authorisation.budget_line || 'N/A'}
Board Approval: ${payment.authorisation.board_approval_id || 'N/A'}
Invoice: ${payment.authorisation.invoice_reference || 'N/A'}
Category: ${payment.authorisation.expense_category}

SCREENSHOT
----------
${payment.screenshot_url}

ACTION REQUIRED
---------------
Please log in to FNB Business Banking to verify and execute this payment.
DO NOT rely on this summary alone - verify all details in the banking portal.
`.trim();
}

/**
 * Check if a payment is within budget limits
 */
export function checkBudgetCompliance(
  amount: number,
  category: XeroAccountCode,
  monthlyBudget: Record<XeroAccountCode, number>
): { compliant: boolean; message: string } {
  const budget = monthlyBudget[category];

  if (!budget) {
    return {
      compliant: false,
      message: `No budget defined for category: ${category}`,
    };
  }

  if (amount > budget) {
    return {
      compliant: false,
      message: `Payment R${amount.toLocaleString()} exceeds budget of R${budget.toLocaleString()} for ${category}`,
    };
  }

  return {
    compliant: true,
    message: `Payment within budget (${Math.round((amount / budget) * 100)}% of ${category} budget)`,
  };
}
