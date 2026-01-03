/**
 * Social Media Connectors - AMU Platform
 *
 * Section 4.3: Social Media APIs
 *
 * Exports connectors for:
 * - LinkedIn (B2B professional audience)
 * - Twitter/X (Quick engagement, industry conversations)
 * - Facebook (Broader reach, awareness)
 *
 * "Ubuntu - I am because we are"
 */

export * from './linkedin';
export * from './twitter';
export * from './facebook';

// ============================================================================
// Unified Social Media Types
// ============================================================================

export type SocialPlatform = 'linkedin' | 'twitter' | 'facebook';

export interface SocialPost {
  platform: SocialPlatform;
  content: string;
  mediaUrls?: string[];
  link?: string;
  hashtags?: string[];
  scheduledAt?: Date;
}

export interface SocialPostResult {
  platform: SocialPlatform;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  postedAt?: string;
}

export interface SocialAnalytics {
  platform: SocialPlatform;
  postId: string;
  impressions: number;
  engagements: number;
  clicks: number;
  engagementRate: number;
}

// ============================================================================
// Unified Posting Function
// ============================================================================

import { getLinkedInConnector, formatLinkedInContent, LinkedInPost } from './linkedin';
import { getTwitterConnector, formatTweetContent, Tweet } from './twitter';
import { getFacebookConnector, formatFacebookContent, FacebookPost } from './facebook';

/**
 * Post content to a specific platform
 */
export async function postToSocialMedia(post: SocialPost): Promise<SocialPostResult> {
  switch (post.platform) {
    case 'linkedin': {
      const connector = getLinkedInConnector();
      const linkedInPost: LinkedInPost = {
        content: formatLinkedInContent(post.content, post.hashtags),
        mediaUrls: post.mediaUrls,
        visibility: 'public',
        scheduledAt: post.scheduledAt,
      };
      const result = await connector.postToCompanyPage(linkedInPost);
      return {
        platform: 'linkedin',
        ...result,
      };
    }

    case 'twitter': {
      const connector = getTwitterConnector();
      const tweet: Tweet = {
        text: formatTweetContent(
          post.hashtags ? `${post.content}\n\n${post.hashtags.join(' ')}` : post.content
        ),
        mediaIds: undefined, // Would need to upload media first
      };
      const result = await connector.postTweet(tweet);
      return {
        platform: 'twitter',
        success: result.success,
        postId: result.tweetId,
        postUrl: result.tweetUrl,
        error: result.error,
        postedAt: result.postedAt,
      };
    }

    case 'facebook': {
      const connector = getFacebookConnector();
      const fbPost: FacebookPost = {
        message: formatFacebookContent(post.content, post.link),
        mediaUrls: post.mediaUrls,
        scheduledPublishTime: post.scheduledAt,
      };
      const result = await connector.postToPage(fbPost);
      return {
        platform: 'facebook',
        ...result,
      };
    }

    default:
      return {
        platform: post.platform,
        success: false,
        error: `Unsupported platform: ${post.platform}`,
      };
  }
}

/**
 * Post content to multiple platforms
 */
export async function postToMultiplePlatforms(
  content: string,
  platforms: SocialPlatform[],
  options?: {
    mediaUrls?: string[];
    link?: string;
    hashtags?: string[];
    scheduledAt?: Date;
  }
): Promise<SocialPostResult[]> {
  const results: SocialPostResult[] = [];

  for (const platform of platforms) {
    const result = await postToSocialMedia({
      platform,
      content,
      mediaUrls: options?.mediaUrls,
      link: options?.link,
      hashtags: options?.hashtags,
      scheduledAt: options?.scheduledAt,
    });
    results.push(result);
  }

  return results;
}

/**
 * Get analytics from all platforms for a campaign
 */
export async function getCampaignAnalytics(
  postIds: { platform: SocialPlatform; postId: string }[]
): Promise<SocialAnalytics[]> {
  const analytics: SocialAnalytics[] = [];

  for (const { platform, postId } of postIds) {
    switch (platform) {
      case 'linkedin': {
        const connector = getLinkedInConnector();
        const data = await connector.getPostAnalytics(postId);
        if (data) {
          analytics.push({
            platform: 'linkedin',
            postId,
            impressions: data.impressions,
            engagements: data.likes + data.comments + data.shares,
            clicks: data.clicks,
            engagementRate: data.engagementRate,
          });
        }
        break;
      }

      case 'twitter': {
        const connector = getTwitterConnector();
        const data = await connector.getTweetAnalytics(postId);
        if (data) {
          analytics.push({
            platform: 'twitter',
            postId,
            impressions: data.impressions,
            engagements: data.engagements,
            clicks: data.linkClicks,
            engagementRate: data.engagementRate,
          });
        }
        break;
      }

      case 'facebook': {
        const connector = getFacebookConnector();
        const data = await connector.getPostInsights(postId);
        if (data) {
          analytics.push({
            platform: 'facebook',
            postId,
            impressions: data.impressions,
            engagements: data.engagedUsers,
            clicks: data.clicks,
            engagementRate: data.engagementRate,
          });
        }
        break;
      }
    }
  }

  return analytics;
}

// ============================================================================
// Platform Status Check
// ============================================================================

export interface PlatformStatus {
  platform: SocialPlatform;
  configured: boolean;
  ready: boolean;
  message: string;
}

export function checkPlatformStatus(): PlatformStatus[] {
  const linkedIn = getLinkedInConnector();
  const twitter = getTwitterConnector();
  const facebook = getFacebookConnector();

  return [
    {
      platform: 'linkedin',
      configured: !!process.env.LINKEDIN_CLIENT_ID,
      ready: linkedIn.isReady(),
      message: linkedIn.isReady()
        ? 'Ready to post'
        : 'Requires LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and access token',
    },
    {
      platform: 'twitter',
      configured: !!process.env.TWITTER_API_KEY,
      ready: twitter.isReady(),
      message: twitter.isReady()
        ? 'Ready to post'
        : 'Requires TWITTER_API_KEY, TWITTER_API_KEY_SECRET, and access tokens',
    },
    {
      platform: 'facebook',
      configured: !!process.env.FACEBOOK_APP_ID,
      ready: facebook.isReady(),
      message: facebook.isReady()
        ? 'Ready to post'
        : 'Requires FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, and page access token',
    },
  ];
}
