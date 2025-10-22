import { getRedis } from './redis';

// Simple KV wrapper around our Redis client
export const kv = {
  async setJSON(key: string, value: any): Promise<boolean> {
    const redis = getRedis();
    if (!redis) return false;
    
    try {
      const jsonString = JSON.stringify(value);
      return await redis.set(key, jsonString);
    } catch (error) {
      console.error('KV setJSON error:', error);
      return false;
    }
  },

  async getJSON<T = any>(key: string): Promise<T | null> {
    const redis = getRedis();
    if (!redis) return null;
    
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('KV getJSON error:', error);
      return null;
    }
  },

  async del(key: string): Promise<boolean> {
    const redis = getRedis();
    if (!redis) return false;
    
    try {
      // Redis client doesn't have del method, but we can set to empty string
      return await redis.set(key, '');
    } catch (error) {
      console.error('KV del error:', error);
      return false;
    }
  }
};


