/**
 * Payments API Routes - AMU Platform
 *
 * API endpoints for prepared payment management.
 * FA reviews, approves/rejects, and marks payments as executed.
 *
 * "Ubuntu - I am because we are"
 */

import { Router, Response } from 'express';
import { TeamMemberRequest, requireTeamMember } from '../middleware/auth';
import {
  createPreparedPayment,
  getPreparedPayment,
  getPendingPayments,
  getApprovedPayments,
  getPaymentHistory,
  approvePayment,
  rejectPayment,
  markPaymentExecuted,
  cancelPayment,
  getPaymentSummary,
  getPaymentAuditLogs,
  getPaymentsForVendor,
  getPaymentsByCategory,
  PreparedPayment,
} from '@amu/database';

const router = Router();

// All payment routes require team member authentication
router.use(requireTeamMember);

// ============================================================================
// Payment Summary & Dashboard
// ============================================================================

/**
 * GET /payments/summary
 * Get payment statistics for FA dashboard
 */
router.get('/summary', async (req: TeamMemberRequest, res: Response) => {
  try {
    const summary = await getPaymentSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
});

/**
 * GET /payments/pending
 * Get payments awaiting FA review
 */
router.get('/pending', async (req: TeamMemberRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const payments = await getPendingPayments(limit);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

/**
 * GET /payments/approved
 * Get payments approved and ready for execution
 */
router.get('/approved', async (req: TeamMemberRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const payments = await getApprovedPayments(limit);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching approved payments:', error);
    res.status(500).json({ error: 'Failed to fetch approved payments' });
  }
});

/**
 * GET /payments/history
 * Get payment history with optional filters
 */
router.get('/history', async (req: TeamMemberRequest, res: Response) => {
  try {
    const { status, category, startDate, endDate, limit } = req.query;

    const payments = await getPaymentHistory({
      status: status as PreparedPayment['status'],
      category: category as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limitCount: limit ? parseInt(limit as string) : 100,
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// ============================================================================
// Individual Payment Operations
// ============================================================================

/**
 * GET /payments/:id
 * Get a specific payment by ID
 */
router.get('/:id', async (req: TeamMemberRequest, res: Response) => {
  try {
    const payment = await getPreparedPayment(req.params.id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

/**
 * GET /payments/:id/audit
 * Get audit logs for a payment
 */
router.get('/:id/audit', async (req: TeamMemberRequest, res: Response) => {
  try {
    const logs = await getPaymentAuditLogs(req.params.id);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching payment audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

/**
 * POST /payments
 * Create a new prepared payment (Claude calls this)
 */
router.post('/', async (req: TeamMemberRequest, res: Response) => {
  try {
    const {
      vendorName,
      vendorBankName,
      vendorAccountNumber,
      vendorBranchCode,
      vendorReference,
      amount,
      currency,
      amuReference,
      description,
      category,
      priority,
      screenshotUrl,
      preparationNotes,
    } = req.body;

    // Validate required fields
    if (!vendorName || !vendorAccountNumber || !amount || !amuReference) {
      return res.status(400).json({
        error: 'Missing required fields: vendorName, vendorAccountNumber, amount, amuReference',
      });
    }

    const payment = await createPreparedPayment({
      vendorName,
      vendorBankName: vendorBankName || 'Unknown',
      vendorAccountNumber,
      vendorBranchCode: vendorBranchCode || '',
      vendorReference: vendorReference || amuReference,
      amount: parseFloat(amount),
      currency: currency || 'ZAR',
      amuReference,
      description: description || '',
      category: category || 'operations',
      priority: priority || 'normal',
      screenshotUrl,
      preparationNotes,
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// ============================================================================
// Payment Workflow Actions
// ============================================================================

/**
 * POST /payments/:id/approve
 * FA approves a prepared payment
 */
router.post('/:id/approve', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { notes } = req.body;

    const payment = await approvePayment(
      req.params.id,
      req.user.uid,
      notes
    );

    res.json({
      success: true,
      message: `Payment approved: R${payment.amount.toFixed(2)} to ${payment.vendorName}`,
      payment,
    });
  } catch (error: unknown) {
    console.error('Error approving payment:', error);
    const message = error instanceof Error ? error.message : 'Failed to approve payment';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /payments/:id/reject
 * FA rejects a prepared payment
 */
router.post('/:id/reject', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const payment = await rejectPayment(
      req.params.id,
      req.user.uid,
      reason
    );

    res.json({
      success: true,
      message: `Payment rejected: ${payment.vendorName}`,
      payment,
    });
  } catch (error: unknown) {
    console.error('Error rejecting payment:', error);
    const message = error instanceof Error ? error.message : 'Failed to reject payment';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /payments/:id/execute
 * FA marks payment as executed in FNB
 */
router.post('/:id/execute', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { fnbConfirmationNumber, notes } = req.body;

    const payment = await markPaymentExecuted(
      req.params.id,
      req.user.uid,
      fnbConfirmationNumber,
      notes
    );

    res.json({
      success: true,
      message: `Payment executed: R${payment.amount.toFixed(2)} to ${payment.vendorName}`,
      payment,
    });
  } catch (error: unknown) {
    console.error('Error executing payment:', error);
    const message = error instanceof Error ? error.message : 'Failed to mark payment as executed';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /payments/:id/cancel
 * Cancel a payment
 */
router.post('/:id/cancel', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Cancellation reason is required' });
    }

    const payment = await cancelPayment(
      req.params.id,
      req.user.uid,
      reason
    );

    res.json({
      success: true,
      message: `Payment cancelled: ${payment.vendorName}`,
      payment,
    });
  } catch (error: unknown) {
    console.error('Error cancelling payment:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel payment';
    res.status(400).json({ error: message });
  }
});

// ============================================================================
// Reporting & Analytics
// ============================================================================

/**
 * GET /payments/vendor/:vendorName
 * Get payment history for a specific vendor
 */
router.get('/vendor/:vendorName', async (req: TeamMemberRequest, res: Response) => {
  try {
    const payments = await getPaymentsForVendor(req.params.vendorName);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching vendor payments:', error);
    res.status(500).json({ error: 'Failed to fetch vendor payments' });
  }
});

/**
 * GET /payments/analytics/by-category
 * Get payment totals by category for a date range
 */
router.get('/analytics/by-category', async (req: TeamMemberRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const categoryData = await getPaymentsByCategory(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(categoryData);
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
});

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * POST /payments/batch/approve
 * Approve multiple payments at once
 */
router.post('/batch/approve', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { paymentIds, notes } = req.body;

    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({ error: 'paymentIds array is required' });
    }

    const results = await Promise.allSettled(
      paymentIds.map((id: string) => approvePayment(id, req.user!.uid, notes))
    );

    const approved = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `Approved ${approved} payment(s), ${failed} failed`,
      approved,
      failed,
      results: results.map((r, i) => ({
        paymentId: paymentIds[i],
        status: r.status,
        error: r.status === 'rejected' ? (r.reason as Error).message : undefined,
      })),
    });
  } catch (error) {
    console.error('Error in batch approve:', error);
    res.status(500).json({ error: 'Failed to process batch approval' });
  }
});

/**
 * POST /payments/batch/execute
 * Mark multiple payments as executed
 */
router.post('/batch/execute', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { paymentIds, notes } = req.body;

    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({ error: 'paymentIds array is required' });
    }

    const results = await Promise.allSettled(
      paymentIds.map((id: string) =>
        markPaymentExecuted(id, req.user!.uid, undefined, notes)
      )
    );

    const executed = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `Executed ${executed} payment(s), ${failed} failed`,
      executed,
      failed,
      results: results.map((r, i) => ({
        paymentId: paymentIds[i],
        status: r.status,
        error: r.status === 'rejected' ? (r.reason as Error).message : undefined,
      })),
    });
  } catch (error) {
    console.error('Error in batch execute:', error);
    res.status(500).json({ error: 'Failed to process batch execution' });
  }
});

export default router;
