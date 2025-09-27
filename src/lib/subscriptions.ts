import { PrismaClient } from '@prisma/client';
import { PlanType, PRICING_PLANS } from './stripe';

const prisma = new PrismaClient();

export interface UserSubscription {
  id: string;
  userId: string;
  stripeSubId: string;
  plan: string;
  status: string;
  seats: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export class SubscriptionManager {
  /**
   * Get user's active subscription
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subscription;
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return subscription !== null;
  }

  /**
   * Get user's plan limits
   */
  static async getUserLimits(userId: string) {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      // Free tier limits
      return {
        alerts: 1,
        apiRequestsPerHour: 100,
        plan: 'free',
      };
    }

    const planType = subscription.plan as PlanType;
    const plan = PRICING_PLANS[planType];
    
    return {
      alerts: plan.limits.alerts,
      apiRequestsPerHour: plan.limits.apiRequestsPerHour,
      plan: subscription.plan,
    };
  }

  /**
   * Check if user can create more alerts
   */
  static async canCreateAlert(userId: string): Promise<boolean> {
    const limits = await this.getUserLimits(userId);
    
    if (limits.alerts === -1) {
      return true; // Unlimited
    }

    const currentAlertCount = await prisma.alert.count({
      where: {
        userId,
        active: true,
      },
    });

    return currentAlertCount < limits.alerts;
  }

  /**
   * Get user's API rate limit tier
   */
  static async getAPITier(userId: string): Promise<'free' | 'pro' | 'enterprise'> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      return 'free';
    }

    const planType = subscription.plan as PlanType;
    
    switch (planType) {
      case 'individual':
        return 'pro';
      case 'team':
        return 'pro';
      case 'enterprise':
        return 'enterprise';
      default:
        return 'free';
    }
  }

  /**
   * Create or update subscription from Stripe webhook
   */
  static async upsertSubscription(
    userId: string,
    stripeSubId: string,
    plan: string,
    status: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: boolean = false
  ): Promise<UserSubscription> {
    return await prisma.subscription.upsert({
      where: { stripeSubId },
      update: {
        plan,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      },
      create: {
        userId,
        stripeSubId,
        plan,
        status,
        seats: 1,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      },
    });
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(stripeSubId: string): Promise<void> {
    await prisma.subscription.update({
      where: { stripeSubId },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: true,
      },
    });
  }

  /**
   * Delete subscription
   */
  static async deleteSubscription(stripeSubId: string): Promise<void> {
    await prisma.subscription.delete({
      where: { stripeSubId },
    });
  }

  /**
   * Get subscription usage statistics
   */
  static async getUsageStats(userId: string) {
    const [alertCount, subscription] = await Promise.all([
      prisma.alert.count({
        where: { userId, active: true },
      }),
      this.getUserSubscription(userId),
    ]);

    const limits = await this.getUserLimits(userId);

    return {
      alerts: {
        used: alertCount,
        limit: limits.alerts,
        unlimited: limits.alerts === -1,
      },
      api: {
        tier: await this.getAPITier(userId),
        requestsPerHour: limits.apiRequestsPerHour,
      },
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      } : null,
    };
  }

  /**
   * Check if feature is available for user
   */
  static async hasFeature(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      // Free tier features
      return ['basic_alerts', 'email_notifications'].includes(feature);
    }

    const planType = subscription.plan as PlanType;
    
    switch (feature) {
      case 'slack_notifications':
        return ['team', 'enterprise'].includes(planType);
      case 'webhook_notifications':
        return ['team', 'enterprise'].includes(planType);
      case 'priority_support':
        return ['team', 'enterprise'].includes(planType);
      case 'custom_integrations':
        return planType === 'enterprise';
      case 'sla_guarantee':
        return planType === 'enterprise';
      default:
        return true;
    }
  }
}

