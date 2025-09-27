import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface APIKeyData {
  id: string;
  name: string;
  key: string;
  userId: string;
  permissions: string[];
  rateLimit: number;
  lastUsed?: Date;
  createdAt: Date;
  expiresAt?: Date;
  active: boolean;
}

export class APIKeyManager {
  /**
   * Generate a new API key
   */
  static generateKey(): string {
    // Generate a secure random key with prefix
    const randomBytes = crypto.randomBytes(32);
    const key = `wmm_${randomBytes.toString('hex')}`;
    return key;
  }

  /**
   * Create a new API key for a user
   */
  static async createAPIKey(
    userId: string,
    name: string,
    permissions: string[] = ['read'],
    rateLimit: number = 1000,
    expiresAt?: Date
  ): Promise<APIKeyData> {
    const key = this.generateKey();
    
    const apiKey = await prisma.user.update({
      where: { id: userId },
      data: {
        apiKey: key,
      },
    });

    // In a real implementation, you'd store this in a separate APIKeys table
    // For now, we'll use the existing apiKey field on User
    
    return {
      id: userId, // Using userId as ID for simplicity
      name,
      key,
      userId,
      permissions,
      rateLimit,
      createdAt: new Date(),
      expiresAt,
      active: true,
    };
  }

  /**
   * Validate an API key
   */
  static async validateAPIKey(key: string): Promise<{ valid: boolean; user?: any; permissions?: string[] }> {
    try {
      const user = await prisma.user.findUnique({
        where: { apiKey: key },
        include: {
          subscriptions: {
            where: { status: 'active' },
          },
        },
      });

      if (!user || !user.apiKey) {
        return { valid: false };
      }

      // Check if key is expired (if we had expiration logic)
      // For now, we'll just check if the user exists and has an active subscription
      
      const hasActiveSubscription = user.subscriptions.length > 0;
      const permissions = hasActiveSubscription ? ['read', 'write'] : ['read'];

      return {
        valid: true,
        user,
        permissions,
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return { valid: false };
    }
  }

  /**
   * Get user's API key info
   */
  static async getUserAPIKey(userId: string): Promise<APIKeyData | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscriptions: {
            where: { status: 'active' },
          },
        },
      });

      if (!user || !user.apiKey) {
        return null;
      }

      const hasActiveSubscription = user.subscriptions.length > 0;
      const permissions = hasActiveSubscription ? ['read', 'write'] : ['read'];
      const rateLimit = hasActiveSubscription ? 10000 : 1000; // Higher limit for paid users

      return {
        id: userId,
        name: 'Default API Key',
        key: user.apiKey,
        userId,
        permissions,
        rateLimit,
        createdAt: user.createdAt || new Date(),
        active: true,
      };
    } catch (error) {
      console.error('Error getting user API key:', error);
      return null;
    }
  }

  /**
   * Regenerate API key for a user
   */
  static async regenerateAPIKey(userId: string): Promise<APIKeyData> {
    const newKey = this.generateKey();
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        apiKey: newKey,
      },
    });

    // Return the new key info
    return await this.getUserAPIKey(userId) as APIKeyData;
  }

  /**
   * Delete API key for a user
   */
  static async deleteAPIKey(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          apiKey: null,
        },
      });
      return true;
    } catch (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
  }

  /**
   * Update API key usage timestamp
   */
  static async updateLastUsed(key: string): Promise<void> {
    try {
      // In a real implementation, you'd update a lastUsed field
      // For now, we'll just log the usage
      console.log(`API key used: ${key.substring(0, 10)}...`);
    } catch (error) {
      console.error('Error updating API key usage:', error);
    }
  }
}

