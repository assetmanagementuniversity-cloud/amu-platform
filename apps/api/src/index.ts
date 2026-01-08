/**
 * AMU API Server
 * Express.js backend for Asset Management University
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeFirebaseAdmin } from '@amu/database';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import authRoutes from './routes/auth';
import coursesRoutes from './routes/courses';
import enrolmentsRoutes from './routes/enrolments';
import conversationsRoutes from './routes/conversations';
import certificatesRoutes from './routes/certificates';
import verificationRoutes from './routes/verification';
import contentFeedbackRoutes from './routes/content-feedback';
import splitTestsRoutes from './routes/split-tests';
import teamRoutes from './routes/team';
import paymentsRoutes from './routes/payments';
import marketingRoutes from './routes/marketing';
import searchRoutes from './routes/search';
import webhooksRoutes from './routes/webhooks';
import privacyRoutes from './routes/privacy';
import checkoutRoutes from './routes/checkout';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Stripe webhooks need raw body for signature verification
// Must be before express.json() middleware
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Regular JSON parsing for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrolments', enrolmentsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/content-feedback', contentFeedbackRoutes);
app.use('/api/split-tests', splitTestsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/team/marketing', marketingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.warn(`AMU API server running on port ${PORT}`);
});

export default app;
