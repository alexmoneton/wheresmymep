import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client with fallback
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Create rate limiters for different tiers (with fallback)
export const rateLimiters = {
  // Free tier: 100 requests per hour
  free: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    prefix: 'wmm_free',
  }) : null,

  // Pro tier: 10,000 requests per hour
  pro: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10000, '1 h'),
    prefix: 'wmm_pro',
  }) : null,

  // Enterprise tier: 100,000 requests per hour
  enterprise: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100000, '1 h'),
    prefix: 'wmm_enterprise',
  }) : null,
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Check rate limit for an API key
 */
export async function checkRateLimit(
  apiKey: string,
  userTier: 'free' | 'pro' | 'enterprise' = 'free'
): Promise<RateLimitResult> {
  try {
    const limiter = rateLimiters[userTier];
    
    // If Redis is not configured, allow all requests
    if (!limiter) {
      console.warn('Redis not configured, allowing all requests');
      return {
        success: true,
        limit: 1000,
        remaining: 999,
        reset: new Date(Date.now() + 3600000), // 1 hour from now
      };
    }

    const result = await limiter.limit(apiKey);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fallback: allow request if rate limiting fails
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: new Date(Date.now() + 3600000), // 1 hour from now
    };
  }
}

/**
 * Get rate limit headers for API responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.reset.getTime() / 1000).toString(),
  };
}

/**
 * Middleware for API routes to check rate limits
 */
export function withRateLimit(handler: Function) {
  return async (request: Request, context: any) => {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Determine user tier based on API key validation
    // For now, we'll use a simple check - in production you'd validate the key
    const userTier = apiKey.startsWith('wmm_') ? 'pro' : 'free';
    
    const rateLimitResult = await checkRateLimit(apiKey, userTier);
    
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        }),
        { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            ...getRateLimitHeaders(rateLimitResult),
          }
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(request, context);
    
    if (response instanceof Response) {
      const headers = new Headers(response.headers);
      Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  };
}

