/**
 * Facebook API Connector - AMU Platform
 *
 * Section 4.3: Social Media APIs
 *
 * Placeholder connector for Facebook/Meta API integration.
 * Claude will use this to post approved content to Facebook.
 *
 * Note: Requires Facebook Marketing API credentials once approved.
 *
 * "Ubuntu - I am because we are"
 */

// ============================================================================
// Types
// ============================================================================

export interface FacebookConfig {
  appId: string;
  appSecret: string;
  accessToken?: string;
  pageId?: string;               // AMU Facebook page ID
  pageAccessToken?: string;
}

export interface FacebookPost {
  message: string;
  link?: string;
  mediaUrls?: string[];
  scheduledPublishTime?: Date;
  targeting?: {
    countries?: string[];
    ageMin?: number;
    ageMax?: number;
  };
}

export interface FacebookPostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  postedAt?: string;
}

export interface FacebookInsights {
  postId: string;
  reach: number;
  impressions: number;
  engagedUsers: number;
  clicks: number;
  reactions: number;
  comments: number;
  shares: number;
  videoViews?: number;
  engagementRate: number;
}

export interface FacebookPageInfo {
  id: string;
  name: string;
  followers: number;
  likes: number;
  about?: string;
  pictureUrl?: string;
}

export interface FacebookStory {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
}

// ============================================================================
// Facebook Connector Class
// ============================================================================

export class FacebookConnector {
  private config: FacebookConfig;
  private isConfigured: boolean = false;

  constructor(config?: Partial<FacebookConfig>) {
    this.config = {
      appId: config?.appId || process.env.FACEBOOK_APP_ID || '',
      appSecret: config?.appSecret || process.env.FACEBOOK_APP_SECRET || '',
      accessToken: config?.accessToken || process.env.FACEBOOK_ACCESS_TOKEN,
      pageId: config?.pageId || process.env.FACEBOOK_PAGE_ID,
      pageAccessToken: config?.pageAccessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    };

    this.isConfigured = !!(this.config.appId && this.config.appSecret);
  }

  /**
   * Check if the connector is properly configured
   */
  isReady(): boolean {
    return this.isConfigured && !!(this.config.pageAccessToken && this.config.pageId);
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(redirectUri: string, state: string): string {
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_read_user_content',
      'publish_video',
    ].join(',');

    return `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${this.config.appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}&` +
      `scope=${scopes}`;
  }

  /**
   * Exchange code for access token
   * TODO: Implement when Facebook API credentials are available
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    if (!this.isConfigured) {
      throw new Error('Facebook connector not configured.');
    }

    // TODO: Implement actual API call
    console.warn('[Facebook] exchangeCodeForToken: Not yet implemented');

    return {
      accessToken: 'placeholder_token',
      expiresIn: 5184000, // 60 days
    };
  }

  /**
   * Get long-lived page access token
   * TODO: Implement when Facebook API credentials are available
   */
  async getPageAccessToken(): Promise<string | null> {
    if (!this.config.accessToken) {
      return null;
    }

    // TODO: Implement actual API call
    // GET /me/accounts with access_token
    console.warn('[Facebook] getPageAccessToken: Placeholder implementation');

    return 'placeholder_page_token';
  }

  /**
   * Post to Facebook page
   * TODO: Implement when Facebook API credentials are available
   */
  async postToPage(post: FacebookPost): Promise<FacebookPostResult> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Facebook connector not ready. Page access token required.',
      };
    }

    // TODO: Implement actual API call
    // POST /{page-id}/feed
    console.warn('[Facebook] postToPage: Placeholder implementation');
    console.log('[Facebook] Would post:', post.message.substring(0, 100) + '...');

    const postId = `${this.config.pageId}_${Date.now()}`;
    return {
      success: true,
      postId,
      postUrl: `https://www.facebook.com/${postId}`,
      postedAt: new Date().toISOString(),
    };
  }

  /**
   * Post with media (photo/video)
   * TODO: Implement when Facebook API credentials are available
   */
  async postWithMedia(post: FacebookPost): Promise<FacebookPostResult> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Facebook connector not ready.',
      };
    }

    // TODO: Implement actual API call
    // POST /{page-id}/photos or /{page-id}/videos
    console.warn('[Facebook] postWithMedia: Placeholder implementation');

    const postId = `${this.config.pageId}_media_${Date.now()}`;
    return {
      success: true,
      postId,
      postUrl: `https://www.facebook.com/${postId}`,
      postedAt: new Date().toISOString(),
    };
  }

  /**
   * Schedule a post
   * TODO: Implement when Facebook API credentials are available
   */
  async schedulePost(post: FacebookPost & { scheduledPublishTime: Date }): Promise<FacebookPostResult> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Facebook connector not ready.',
      };
    }

    // Facebook supports native scheduling
    // POST /{page-id}/feed with scheduled_publish_time
    console.warn('[Facebook] schedulePost: Would schedule for', post.scheduledPublishTime);

    return {
      success: true,
      postId: `scheduled_${Date.now()}`,
      postedAt: post.scheduledPublishTime.toISOString(),
    };
  }

  /**
   * Get post insights/analytics
   * TODO: Implement when Facebook API credentials are available
   */
  async getPostInsights(postId: string): Promise<FacebookInsights | null> {
    if (!this.isReady()) {
      return null;
    }

    // TODO: Implement actual API call
    // GET /{post-id}/insights
    console.warn('[Facebook] getPostInsights: Placeholder implementation');

    return {
      postId,
      reach: 0,
      impressions: 0,
      engagedUsers: 0,
      clicks: 0,
      reactions: 0,
      comments: 0,
      shares: 0,
      engagementRate: 0,
    };
  }

  /**
   * Get page information
   * TODO: Implement when Facebook API credentials are available
   */
  async getPageInfo(): Promise<FacebookPageInfo | null> {
    if (!this.isReady()) {
      return null;
    }

    // TODO: Implement actual API call
    // GET /{page-id}?fields=name,followers_count,fan_count,about,picture
    console.warn('[Facebook] getPageInfo: Placeholder implementation');

    return {
      id: this.config.pageId!,
      name: 'Asset Management University',
      followers: 0,
      likes: 0,
      about: 'Ubuntu - I am because we are',
    };
  }

  /**
   * Delete a post
   * TODO: Implement when Facebook API credentials are available
   */
  async deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isReady()) {
      return { success: false, error: 'Not ready' };
    }

    // TODO: Implement actual API call
    // DELETE /{post-id}
    console.warn('[Facebook] deletePost: Placeholder implementation');

    return { success: true };
  }

  /**
   * Post a story
   * TODO: Implement when Facebook API credentials are available
   */
  async postStory(story: FacebookStory): Promise<{
    success: boolean;
    storyId?: string;
    error?: string;
  }> {
    if (!this.isReady()) {
      return { success: false, error: 'Not ready' };
    }

    // TODO: Implement actual API call
    console.warn('[Facebook] postStory: Placeholder implementation');

    return {
      success: true,
      storyId: `story_${Date.now()}`,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let _facebookConnector: FacebookConnector | null = null;

export function getFacebookConnector(): FacebookConnector {
  if (!_facebookConnector) {
    _facebookConnector = new FacebookConnector();
  }
  return _facebookConnector;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format content for Facebook
 */
export function formatFacebookContent(content: string, link?: string): string {
  // Facebook allows much longer posts (63,206 characters)
  // But optimal length is 40-80 characters
  const MAX_OPTIMAL = 500;

  let formatted = content;

  if (link) {
    formatted += `\n\n${link}`;
  }

  // Warn if content is very long
  if (formatted.length > MAX_OPTIMAL) {
    console.warn(`[Facebook] Post is ${formatted.length} chars, optimal is <${MAX_OPTIMAL}`);
  }

  return formatted;
}

/**
 * Validate Facebook post before sending
 */
export function validateFacebookPost(post: FacebookPost): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!post.message || post.message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (post.message && post.message.length > 63206) {
    errors.push('Message exceeds Facebook character limit');
  }

  if (post.message && post.message.length > 500) {
    warnings.push('Post is longer than optimal 500 characters');
  }

  if (post.mediaUrls && post.mediaUrls.length > 10) {
    errors.push('Maximum 10 media items allowed per post');
  }

  if (post.scheduledPublishTime) {
    const minSchedule = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    const maxSchedule = new Date(Date.now() + 75 * 24 * 60 * 60 * 1000); // 75 days

    if (post.scheduledPublishTime < minSchedule) {
      errors.push('Scheduled time must be at least 10 minutes in the future');
    }

    if (post.scheduledPublishTime > maxSchedule) {
      errors.push('Scheduled time cannot be more than 75 days in the future');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get best posting times for Facebook (South African audience)
 */
export function getBestPostingTimes(): {
  day: string;
  times: string[];
}[] {
  return [
    { day: 'Monday', times: ['09:00', '12:00', '15:00'] },
    { day: 'Tuesday', times: ['09:00', '12:00', '15:00', '18:00'] },
    { day: 'Wednesday', times: ['09:00', '12:00', '15:00'] },
    { day: 'Thursday', times: ['09:00', '12:00', '15:00', '18:00'] },
    { day: 'Friday', times: ['09:00', '12:00'] },
    { day: 'Saturday', times: ['09:00', '12:00'] },
    { day: 'Sunday', times: ['09:00', '18:00'] },
  ];
}
