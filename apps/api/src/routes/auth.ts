/**
 * Authentication routes
 */

import { Router } from 'express';
import { getAuth, getUserByEmail, createUser, updateLastLogin, getUserById } from '@amu/database';
import { registerSchema } from '@amu/shared';
import { createApiError } from '../middleware/error-handler';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rate-limit';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', loginRateLimiter, async (req, res, next) => {
  try {
    // Validate input
    const input = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await getUserByEmail(input.email);
    if (existingUser) {
      throw createApiError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    // Create Firebase Auth user
    const auth = getAuth();
    const userRecord = await auth.createUser({
      email: input.email,
      password: input.password,
      displayName: input.name,
      emailVerified: false,
    });

    // Create user document in Firestore
    const user = await createUser(userRecord.uid, {
      user_email: input.email,
      user_name: input.name,
      user_auth_provider: 'email',
      user_referred_by: input.referralCode,
    });

    // Generate custom token for immediate login
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      data: {
        userId: user.user_id,
        customToken,
        emailVerificationRequired: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login is handled client-side with Firebase Auth
 * This endpoint updates last login timestamp
 */
router.post('/login', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    await updateLastLogin(req.userId);

    const user = await getUserById(req.userId);

    res.json({
      success: true,
      data: {
        userId: req.userId,
        user: user ? {
          name: user.user_name,
          email: user.user_email,
          type: user.user_type,
          referralCode: user.user_referral_code,
          karmaBalance: user.user_karma_balance,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const user = await getUserById(req.userId);

    if (!user) {
      throw createApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        userId: user.user_id,
        email: user.user_email,
        name: user.user_name,
        type: user.user_type,
        emailVerified: user.user_email_verified,
        referralCode: user.user_referral_code,
        karmaBalance: user.user_karma_balance,
        karmaLifetimeEarned: user.user_karma_lifetime_earned,
        companyId: user.user_company_id,
        createdDate: user.user_created_date,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
