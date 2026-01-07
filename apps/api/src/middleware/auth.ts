/**
 * Authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@amu/database';
import { createApiError } from './error-handler';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Require authentication for a route
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createApiError('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);
    const auth = getAuth();

    const decodedToken = await auth.verifyIdToken(token);

    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;

    next();
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 401) {
      next(error);
      return;
    }
    next(createApiError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}

/**
 * Optional authentication - sets user info if token provided, continues if not
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const auth = getAuth();

    const decodedToken = await auth.verifyIdToken(token);

    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;

    next();
  } catch {
    // Invalid token, but optional auth so continue without user
    next();
  }
}

/**
 * Team member request with additional team info
 */
export interface TeamMemberRequest extends AuthenticatedRequest {
  teamMemberRole?: string;
  categoriesManaged?: string[];
  isAdmin?: boolean;
}

/**
 * Require team member access (admin or board member)
 * Team members have access to the Claude Team Interface
 */
export async function requireTeamMember(
  req: TeamMemberRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createApiError('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);
    const auth = getAuth();

    const decodedToken = await auth.verifyIdToken(token);

    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;

    // Check if user is a team member (admin claim or team_member claim)
    const isAdmin = decodedToken.admin === true;
    const isTeamMember = decodedToken.team_member === true;

    if (!isAdmin && !isTeamMember) {
      throw createApiError('Team member access required', 403, 'FORBIDDEN');
    }

    req.isAdmin = isAdmin;
    req.teamMemberRole = (decodedToken.team_role as string) || (isAdmin ? 'admin' : 'team_member');
    req.categoriesManaged = (decodedToken.categories_managed as string[]) || [];

    next();
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) {
      next(error);
      return;
    }
    next(createApiError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}

/**
 * Require admin access only
 * Stricter than requireTeamMember - only users with admin claim can access
 */
export async function requireAdmin(
  req: TeamMemberRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createApiError('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);
    const auth = getAuth();

    const decodedToken = await auth.verifyIdToken(token);

    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;

    // Check if user has admin claim
    const isAdmin = decodedToken.admin === true;

    if (!isAdmin) {
      throw createApiError('Admin access required', 403, 'FORBIDDEN');
    }

    req.isAdmin = true;
    req.teamMemberRole = 'admin';
    req.categoriesManaged = (decodedToken.categories_managed as string[]) || [];

    next();
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) {
      next(error);
      return;
    }
    next(createApiError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}
