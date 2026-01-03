/**
 * Twitter/X API Connector - AMU Platform
 *
 * Section 4.3: Social Media APIs
 *
 * Placeholder connector for Twitter/X API integration.
 * Claude will use this to post approved content to Twitter/X.
 *
 * Note: Requires Twitter API v2 credentials once approved.
 *
 * "Ubuntu - I am because we are"
 */

// ============================================================================
// Types
// ============================================================================

export interface TwitterConfig {
  apiKey: string;
  apiKeySecret: string;
  accessToken?: string;
  accessTokenSecret?: string;
  bearerToken?: string;
}

export interface Tweet {
  text: string;
  mediaIds?: string[];
  replyToId?: string;
  quoteTweetId?: string;
  pollOptions?: string[];
  pollDurationMinutes?: number;
}

export interface TweetResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
  postedAt?: string;
}

export interface TweetAnalytics {
  tweetId: string;
  impressions: number;
  engagements: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  profileClicks: number;
  linkClicks: number;
  engagementRate: number;
}

export interface TwitterThread {
  tweets: Tweet[];
}

export interface TwitterThreadResult {
  success: boolean;
  tweetIds?: string[];
  threadUrl?: string;
  error?: string;
}

// ============================================================================
// Twitter Connector Class
// ============================================================================

export class TwitterConnector {
  private config: TwitterConfig;
  private isConfigured: boolean = false;

  constructor(config?: Partial<TwitterConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.TWITTER_API_KEY || '',
      apiKeySecret: config?.apiKeySecret || process.env.TWITTER_API_KEY_SECRET || '',
      accessToken: config?.accessToken || process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: config?.accessTokenSecret || process.env.TWITTER_ACCESS_TOKEN_SECRET,
      bearerToken: config?.bearerToken || process.env.TWITTER_BEARER_TOKEN,
    };

    this.isConfigured = !!(this.config.apiKey && this.config.apiKeySecret);
  }

  /**
   * Check if the connector is properly configured
   */
  isReady(): boolean {
    return this.isConfigured && !!(this.config.accessToken && this.config.accessTokenSecret);
  }

  /**
   * Get OAuth 2.0 authorization URL
   */
  getAuthUrl(redirectUri: string, state: string): string {
    const scopes = [
      'tweet.read',
      'tweet.write',
      'users.read',
      'offline.access',
    ].join(' ');

    return `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${this.config.apiKey}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state}&` +
      `code_challenge=challenge&` +
      `code_challenge_method=plain`;
  }

  /**
   * Post a single tweet
   * TODO: Implement when Twitter API credentials are available
   */
  async postTweet(tweet: Tweet): Promise<TweetResult> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Twitter connector not ready. Access tokens required.',
      };
    }

    // TODO: Implement actual API call
    // POST https://api.twitter.com/2/tweets
    console.warn('[Twitter] postTweet: Placeholder implementation');
    console.log('[Twitter] Would post:', tweet.text.substring(0, 50) + '...');

    // Return placeholder success for development
    const tweetId = `placeholder_${Date.now()}`;
    return {
      success: true,
      tweetId,
      tweetUrl: `https://twitter.com/AMU_Platform/status/${tweetId}`,
      postedAt: new Date().toISOString(),
    };
  }

  /**
   * Post a thread (multiple connected tweets)
   * TODO: Implement when Twitter API credentials are available
   */
  async postThread(thread: TwitterThread): Promise<TwitterThreadResult> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Twitter connector not ready.',
      };
    }

    // TODO: Implement actual API calls (chain tweets with reply_to)
    console.warn('[Twitter] postThread: Placeholder implementation');
    console.log(`[Twitter] Would post thread with ${thread.tweets.length} tweets`);

    const tweetIds = thread.tweets.map((_, i) => `thread_${Date.now()}_${i}`);
    return {
      success: true,
      tweetIds,
      threadUrl: `https://twitter.com/AMU_Platform/status/${tweetIds[0]}`,
    };
  }

  /**
   * Upload media for attachment
   * TODO: Implement when Twitter API credentials are available
   */
  async uploadMedia(mediaUrl: string, mediaType: 'image' | 'video' | 'gif'): Promise<{
    success: boolean;
    mediaId?: string;
    error?: string;
  }> {
    if (!this.isReady()) {
      return { success: false, error: 'Not ready' };
    }

    // TODO: Implement actual API call
    // POST https://upload.twitter.com/1.1/media/upload.json
    console.warn('[Twitter] uploadMedia: Placeholder implementation');

    return {
      success: true,
      mediaId: `media_${Date.now()}`,
    };
  }

  /**
   * Get tweet analytics
   * TODO: Implement when Twitter API credentials are available
   */
  async getTweetAnalytics(tweetId: string): Promise<TweetAnalytics | null> {
    if (!this.isReady()) {
      return null;
    }

    // TODO: Implement actual API call
    // GET https://api.twitter.com/2/tweets/:id with metrics
    console.warn('[Twitter] getTweetAnalytics: Placeholder implementation');

    return {
      tweetId,
      impressions: 0,
      engagements: 0,
      likes: 0,
      retweets: 0,
      replies: 0,
      quotes: 0,
      profileClicks: 0,
      linkClicks: 0,
      engagementRate: 0,
    };
  }

  /**
   * Delete a tweet
   * TODO: Implement when Twitter API credentials are available
   */
  async deleteTweet(tweetId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isReady()) {
      return { success: false, error: 'Not ready' };
    }

    // TODO: Implement actual API call
    // DELETE https://api.twitter.com/2/tweets/:id
    console.warn('[Twitter] deleteTweet: Placeholder implementation');

    return { success: true };
  }

  /**
   * Schedule a tweet
   * Note: Twitter API doesn't support scheduling; we handle in our system
   */
  async scheduleTweet(tweet: Tweet, scheduledAt: Date): Promise<{
    success: boolean;
    scheduledId?: string;
    error?: string;
  }> {
    console.warn('[Twitter] scheduleTweet: Would schedule for', scheduledAt);

    return {
      success: true,
      scheduledId: `scheduled_tweet_${Date.now()}`,
    };
  }

  /**
   * Retweet a tweet
   * TODO: Implement when Twitter API credentials are available
   */
  async retweet(tweetId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isReady()) {
      return { success: false, error: 'Not ready' };
    }

    // TODO: Implement actual API call
    console.warn('[Twitter] retweet: Placeholder implementation');

    return { success: true };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let _twitterConnector: TwitterConnector | null = null;

export function getTwitterConnector(): TwitterConnector {
  if (!_twitterConnector) {
    _twitterConnector = new TwitterConnector();
  }
  return _twitterConnector;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format content for Twitter (280 character limit, thread splitting)
 */
export function formatTweetContent(content: string): string {
  const MAX_LENGTH = 280;

  if (content.length <= MAX_LENGTH) {
    return content;
  }

  // Truncate with ellipsis
  return content.substring(0, MAX_LENGTH - 3) + '...';
}

/**
 * Split long content into a thread
 */
export function splitIntoThread(content: string, maxTweetLength: number = 270): Tweet[] {
  if (content.length <= maxTweetLength) {
    return [{ text: content }];
  }

  const tweets: Tweet[] = [];
  const words = content.split(' ');
  let currentTweet = '';

  for (const word of words) {
    const testTweet = currentTweet ? `${currentTweet} ${word}` : word;

    if (testTweet.length <= maxTweetLength) {
      currentTweet = testTweet;
    } else {
      if (currentTweet) {
        // Add thread indicator
        tweets.push({ text: currentTweet + (tweets.length === 0 ? ' (1/...)' : '') });
      }
      currentTweet = word;
    }
  }

  if (currentTweet) {
    tweets.push({ text: currentTweet });
  }

  // Update thread numbers
  const total = tweets.length;
  return tweets.map((tweet, index) => ({
    ...tweet,
    text: tweet.text.replace('(1/...)', `(${index + 1}/${total})`),
  }));
}

/**
 * Validate tweet before sending
 */
export function validateTweet(tweet: Tweet): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!tweet.text || tweet.text.trim().length === 0) {
    errors.push('Tweet text is required');
  }

  if (tweet.text && tweet.text.length > 280) {
    errors.push('Tweet exceeds 280 character limit');
  }

  if (tweet.mediaIds && tweet.mediaIds.length > 4) {
    errors.push('Maximum 4 media items allowed per tweet');
  }

  if (tweet.pollOptions) {
    if (tweet.pollOptions.length < 2 || tweet.pollOptions.length > 4) {
      errors.push('Polls must have 2-4 options');
    }
    if (tweet.pollOptions.some(opt => opt.length > 25)) {
      errors.push('Poll options must be 25 characters or less');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#\w+/g);
  return matches || [];
}
