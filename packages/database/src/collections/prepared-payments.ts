/**
 * Prepared Payments Collection - AMU Platform
 *
 * Database operations for FNB prepared payments.
 * Claude prepares payments, FA approves and executes.
 *
 * "Ubuntu - I am because we are"
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// Types
// ============================================================================

export type PaymentStatus =
  | 'prepared'      // Claude has prepared, awaiting FA review
  | 'approved'      // FA approved, ready for execution
  | 'executed'      // FA executed in FNB
  | 'rejected'      // FA rejected the payment
  | 'cancelled';    // Payment cancelled

export type PaymentPriority = 'urgent' | 'normal' | 'low';

export interface PreparedPayment {
  id: string;

  // Payment details
  vendorName: string;
  vendorBankName: string;
  vendorAccountNumber: string;
  vendorBranchCode: string;
  vendorReference: string;

  amount: number;
  currency: string;

  // AMU internal reference
  amuReference: string;
  description: string;
  category: string;

  // Workflow status
  status: PaymentStatus;
  priority: PaymentPriority;

  // Preparation details
  preparedBy: 'claude';
  preparedAt: Timestamp;
  screenshotUrl?: string;
  preparationNotes?: string;

  // Approval workflow
  reviewedBy?: string;        // FA user ID
  reviewedAt?: Timestamp;
  approvalNotes?: string;
  rejectionReason?: string;

  // Execution tracking
  executedBy?: string;        // FA user ID
  executedAt?: Timestamp;
  fnbConfirmationNumber?: string;
  executionNotes?: string;

  // Linked records
  xeroInvoiceId?: string;
  xeroPaymentId?: string;
  expenseId?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaymentAuditLog {
  id: string;
  paymentId: string;
  action: 'prepared' | 'approved' | 'rejected' | 'executed' | 'cancelled' | 'updated';
  performedBy: string;
  performedAt: Timestamp;
  previousStatus?: PaymentStatus;
  newStatus: PaymentStatus;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentSummary {
  pending: number;
  pendingAmount: number;
  approved: number;
  approvedAmount: number;
  executedToday: number;
  executedTodayAmount: number;
  rejectedThisWeek: number;
}

// ============================================================================
// Collection References
// ============================================================================

const PREPARED_PAYMENTS = 'prepared_payments';
const PAYMENT_AUDIT_LOGS = 'payment_audit_logs';

// ============================================================================
// Prepared Payment Operations
// ============================================================================

/**
 * Create a new prepared payment record
 */
export async function createPreparedPayment(
  payment: Omit<PreparedPayment, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'preparedBy' | 'preparedAt'>
): Promise<PreparedPayment> {
  const paymentsRef = collection(db, PREPARED_PAYMENTS);
  const paymentRef = doc(paymentsRef);

  const now = Timestamp.now();

  const newPayment: PreparedPayment = {
    ...payment,
    id: paymentRef.id,
    status: 'prepared',
    preparedBy: 'claude',
    preparedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(paymentRef, newPayment);

  // Create audit log
  await createPaymentAuditLog({
    paymentId: newPayment.id,
    action: 'prepared',
    performedBy: 'claude',
    newStatus: 'prepared',
    notes: `Payment prepared for ${payment.vendorName}: R${payment.amount.toFixed(2)}`,
  });

  return newPayment;
}

/**
 * Get a prepared payment by ID
 */
export async function getPreparedPayment(paymentId: string): Promise<PreparedPayment | null> {
  const paymentRef = doc(db, PREPARED_PAYMENTS, paymentId);
  const snapshot = await getDoc(paymentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as PreparedPayment;
}

/**
 * Get pending payments awaiting FA review
 */
export async function getPendingPayments(limitCount: number = 50): Promise<PreparedPayment[]> {
  const paymentsRef = collection(db, PREPARED_PAYMENTS);
  const q = query(
    paymentsRef,
    where('status', '==', 'prepared'),
    orderBy('priority', 'asc'),
    orderBy('preparedAt', 'asc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as PreparedPayment);
}

/**
 * Get approved payments ready for execution
 */
export async function getApprovedPayments(limitCount: number = 50): Promise<PreparedPayment[]> {
  const paymentsRef = collection(db, PREPARED_PAYMENTS);
  const q = query(
    paymentsRef,
    where('status', '==', 'approved'),
    orderBy('priority', 'asc'),
    orderBy('reviewedAt', 'asc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as PreparedPayment);
}

/**
 * Get payment history with optional filters
 */
export async function getPaymentHistory(options: {
  status?: PaymentStatus;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limitCount?: number;
}): Promise<PreparedPayment[]> {
  const paymentsRef = collection(db, PREPARED_PAYMENTS);
  let q = query(paymentsRef, orderBy('createdAt', 'desc'));

  if (options.status) {
    q = query(q, where('status', '==', options.status));
  }

  if (options.category) {
    q = query(q, where('category', '==', options.category));
  }

  if (options.startDate) {
    q = query(q, where('createdAt', '>=', Timestamp.fromDate(options.startDate)));
  }

  if (options.endDate) {
    q = query(q, where('createdAt', '<=', Timestamp.fromDate(options.endDate)));
  }

  q = query(q, limit(options.limitCount || 100));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as PreparedPayment);
}

/**
 * FA approves a prepared payment
 */
export async function approvePayment(
  paymentId: string,
  approvedBy: string,
  notes?: string
): Promise<PreparedPayment> {
  const payment = await getPreparedPayment(paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'prepared') {
    throw new Error(`Cannot approve payment with status: ${payment.status}`);
  }

  const now = Timestamp.now();
  const paymentRef = doc(db, PREPARED_PAYMENTS, paymentId);

  await updateDoc(paymentRef, {
    status: 'approved',
    reviewedBy: approvedBy,
    reviewedAt: now,
    approvalNotes: notes || null,
    updatedAt: now,
  });

  // Create audit log
  await createPaymentAuditLog({
    paymentId,
    action: 'approved',
    performedBy: approvedBy,
    previousStatus: 'prepared',
    newStatus: 'approved',
    notes: notes || 'Payment approved by FA',
  });

  return {
    ...payment,
    status: 'approved',
    reviewedBy: approvedBy,
    reviewedAt: now,
    approvalNotes: notes,
    updatedAt: now,
  };
}

/**
 * FA rejects a prepared payment
 */
export async function rejectPayment(
  paymentId: string,
  rejectedBy: string,
  reason: string
): Promise<PreparedPayment> {
  const payment = await getPreparedPayment(paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'prepared') {
    throw new Error(`Cannot reject payment with status: ${payment.status}`);
  }

  const now = Timestamp.now();
  const paymentRef = doc(db, PREPARED_PAYMENTS, paymentId);

  await updateDoc(paymentRef, {
    status: 'rejected',
    reviewedBy: rejectedBy,
    reviewedAt: now,
    rejectionReason: reason,
    updatedAt: now,
  });

  // Create audit log
  await createPaymentAuditLog({
    paymentId,
    action: 'rejected',
    performedBy: rejectedBy,
    previousStatus: 'prepared',
    newStatus: 'rejected',
    notes: reason,
  });

  return {
    ...payment,
    status: 'rejected',
    reviewedBy: rejectedBy,
    reviewedAt: now,
    rejectionReason: reason,
    updatedAt: now,
  };
}

/**
 * Mark payment as executed after FA completes in FNB
 */
export async function markPaymentExecuted(
  paymentId: string,
  executedBy: string,
  fnbConfirmationNumber?: string,
  notes?: string
): Promise<PreparedPayment> {
  const payment = await getPreparedPayment(paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'approved') {
    throw new Error(`Cannot execute payment with status: ${payment.status}`);
  }

  const now = Timestamp.now();
  const paymentRef = doc(db, PREPARED_PAYMENTS, paymentId);

  await updateDoc(paymentRef, {
    status: 'executed',
    executedBy,
    executedAt: now,
    fnbConfirmationNumber: fnbConfirmationNumber || null,
    executionNotes: notes || null,
    updatedAt: now,
  });

  // Create audit log
  await createPaymentAuditLog({
    paymentId,
    action: 'executed',
    performedBy: executedBy,
    previousStatus: 'approved',
    newStatus: 'executed',
    notes: fnbConfirmationNumber
      ? `Executed with FNB confirmation: ${fnbConfirmationNumber}`
      : 'Payment executed in FNB',
    metadata: { fnbConfirmationNumber },
  });

  return {
    ...payment,
    status: 'executed',
    executedBy,
    executedAt: now,
    fnbConfirmationNumber,
    executionNotes: notes,
    updatedAt: now,
  };
}

/**
 * Cancel a payment
 */
export async function cancelPayment(
  paymentId: string,
  cancelledBy: string,
  reason: string
): Promise<PreparedPayment> {
  const payment = await getPreparedPayment(paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status === 'executed') {
    throw new Error('Cannot cancel an executed payment');
  }

  const previousStatus = payment.status;
  const now = Timestamp.now();
  const paymentRef = doc(db, PREPARED_PAYMENTS, paymentId);

  await updateDoc(paymentRef, {
    status: 'cancelled',
    updatedAt: now,
  });

  // Create audit log
  await createPaymentAuditLog({
    paymentId,
    action: 'cancelled',
    performedBy: cancelledBy,
    previousStatus,
    newStatus: 'cancelled',
    notes: reason,
  });

  return {
    ...payment,
    status: 'cancelled',
    updatedAt: now,
  };
}

/**
 * Link payment to Xero records
 */
export async function linkPaymentToXero(
  paymentId: string,
  xeroInvoiceId: string,
  xeroPaymentId?: string
): Promise<void> {
  const paymentRef = doc(db, PREPARED_PAYMENTS, paymentId);

  await updateDoc(paymentRef, {
    xeroInvoiceId,
    xeroPaymentId: xeroPaymentId || null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get payment summary statistics
 */
export async function getPaymentSummary(): Promise<PaymentSummary> {
  const paymentsRef = collection(db, PREPARED_PAYMENTS);

  // Get all payments for calculation
  const snapshot = await getDocs(paymentsRef);
  const payments = snapshot.docs.map(doc => doc.data() as PreparedPayment);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const pending = payments.filter(p => p.status === 'prepared');
  const approved = payments.filter(p => p.status === 'approved');
  const executedToday = payments.filter(p =>
    p.status === 'executed' &&
    p.executedAt &&
    p.executedAt.toDate() >= startOfDay
  );
  const rejectedThisWeek = payments.filter(p =>
    p.status === 'rejected' &&
    p.reviewedAt &&
    p.reviewedAt.toDate() >= startOfWeek
  );

  return {
    pending: pending.length,
    pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
    approved: approved.length,
    approvedAmount: approved.reduce((sum, p) => sum + p.amount, 0),
    executedToday: executedToday.length,
    executedTodayAmount: executedToday.reduce((sum, p) => sum + p.amount, 0),
    rejectedThisWeek: rejectedThisWeek.length,
  };
}

// ============================================================================
// Audit Log Operations
// ============================================================================

/**
 * Create a payment audit log entry
 */
async function createPaymentAuditLog(
  log: Omit<PaymentAuditLog, 'id' | 'performedAt'>
): Promise<PaymentAuditLog> {
  const logsRef = collection(db, PAYMENT_AUDIT_LOGS);
  const logRef = doc(logsRef);

  const newLog: PaymentAuditLog = {
    ...log,
    id: logRef.id,
    performedAt: Timestamp.now(),
  };

  await setDoc(logRef, newLog);
  return newLog;
}

/**
 * Get audit logs for a payment
 */
export async function getPaymentAuditLogs(paymentId: string): Promise<PaymentAuditLog[]> {
  const logsRef = collection(db, PAYMENT_AUDIT_LOGS);
  const q = query(
    logsRef,
    where('paymentId', '==', paymentId),
    orderBy('performedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as PaymentAuditLog);
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Get payments due for a specific vendor
 */
export async function getPaymentsForVendor(vendorName: string): Promise<PreparedPayment[]> {
  const paymentsRef = collection(db, PREPARED_PAYMENTS);
  const q = query(
    paymentsRef,
    where('vendorName', '==', vendorName),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as PreparedPayment);
}

/**
 * Get total payments by category for a date range
 */
export async function getPaymentsByCategory(
  startDate: Date,
  endDate: Date
): Promise<Record<string, { count: number; total: number }>> {
  const paymentsRef = collection(db, PREPARED_PAYMENTS);
  const q = query(
    paymentsRef,
    where('status', '==', 'executed'),
    where('executedAt', '>=', Timestamp.fromDate(startDate)),
    where('executedAt', '<=', Timestamp.fromDate(endDate))
  );

  const snapshot = await getDocs(q);
  const payments = snapshot.docs.map(doc => doc.data() as PreparedPayment);

  const byCategory: Record<string, { count: number; total: number }> = {};

  for (const payment of payments) {
    if (!byCategory[payment.category]) {
      byCategory[payment.category] = { count: 0, total: 0 };
    }
    byCategory[payment.category].count++;
    byCategory[payment.category].total += payment.amount;
  }

  return byCategory;
}
