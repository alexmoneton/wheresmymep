/**
 * Upstash Redis client using REST API
 * Supports both UPSTASH_* and KV_* environment variable names
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_READ_ONLY_TOKEN;

if (!REDIS_URL || !REDIS_TOKEN) {
  console.warn('Redis configuration missing. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_URL and KV_REST_API_TOKEN)');
}

// Check if we have read-only token
const IS_READ_ONLY = process.env.KV_REST_API_READ_ONLY_TOKEN && !process.env.KV_REST_API_TOKEN && !process.env.UPSTASH_REDIS_REST_TOKEN;

if (IS_READ_ONLY) {
  console.warn('Using read-only Redis token. Write operations will fail. Set KV_REST_API_TOKEN or UPSTASH_REDIS_REST_TOKEN for full access.');
}

interface RedisResponse<T = any> {
  result: T;
}

class RedisClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    if (!REDIS_URL || !REDIS_TOKEN) {
      throw new Error('Redis configuration missing');
    }
    this.baseUrl = REDIS_URL;
    this.token = REDIS_TOKEN;
  }

  private async request<T>(command: string[]): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Redis request failed: ${response.status} ${response.statusText}`);
    }

    const data: RedisResponse<T> = await response.json();
    return data.result;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.request<string | null>(['GET', key]);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<boolean> {
    try {
      await this.request<string>(['SET', key, value]);
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.request<number>(['INCR', key]);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 0;
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.request<number>(['INCRBY', key, increment.toString()]);
    } catch (error) {
      console.error('Redis INCRBY error:', error);
      return 0;
    }
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.request<number>(['ZADD', key, score.toString(), member]);
    } catch (error) {
      console.error('Redis ZADD error:', error);
      return 0;
    }
  }

  async zincrby(key: string, increment: number, member: string): Promise<string> {
    try {
      return await this.request<string>(['ZINCRBY', key, increment.toString(), member]);
    } catch (error) {
      console.error('Redis ZINCRBY error:', error);
      return '0';
    }
  }

  async zrangebyscore(key: string, min: string, max: string): Promise<string[]> {
    try {
      return await this.request<string[]>(['ZRANGEBYSCORE', key, min, max]);
    } catch (error) {
      console.error('Redis ZRANGEBYSCORE error:', error);
      return [];
    }
  }

  async zrangebyscoreWithScores(key: string, min: string, max: string): Promise<Array<{member: string, score: number}>> {
    try {
      const result = await this.request<string[]>(['ZRANGEBYSCORE', key, min, max, 'WITHSCORES']);
      const pairs: Array<{member: string, score: number}> = [];
      for (let i = 0; i < result.length; i += 2) {
        pairs.push({
          member: result[i],
          score: parseFloat(result[i + 1])
        });
      }
      return pairs;
    } catch (error) {
      console.error('Redis ZRANGEBYSCORE WITHSCORES error:', error);
      return [];
    }
  }
}

// Export singleton instance
let redisClient: RedisClient | null = null;

export function getRedis(): RedisClient | null {
  if (!REDIS_URL || !REDIS_TOKEN) {
    return null;
  }
  
  if (!redisClient) {
    try {
      redisClient = new RedisClient();
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      return null;
    }
  }
  
  return redisClient;
}

// Helper functions for metrics
export async function incrementDailyCounter(metric: string, date?: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  
  const today = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `metrics:${metric}:${today}`;
  return await redis.incr(key);
}

export async function incrementDailyZSet(metric: string, date?: string): Promise<string> {
  const redis = getRedis();
  if (!redis) return '0';
  
  const today = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `metrics:${metric}:by_day`;
  const epochDay = Math.floor(new Date(today).getTime() / (1000 * 60 * 60 * 24));
  return await redis.zincrby(key, 1, today);
}

export async function getDailyStats(metric: string, days: number): Promise<Array<{date: string, count: number}>> {
  const redis = getRedis();
  if (!redis) return [];
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  const key = `metrics:${metric}:by_day`;
  const startEpoch = Math.floor(startDate.getTime() / (1000 * 60 * 60 * 24));
  const endEpoch = Math.floor(endDate.getTime() / (1000 * 60 * 60 * 24));
  
  const results = await redis.zrangebyscoreWithScores(key, startEpoch.toString(), endEpoch.toString());
  
  // Fill in missing dates with 0 counts
  const stats: Array<{date: string, count: number}> = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const existing = results.find(r => r.member === dateStr);
    stats.unshift({
      date: dateStr,
      count: existing ? existing.score : 0
    });
  }
  
  return stats;
}


