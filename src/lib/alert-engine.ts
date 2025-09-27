import { PrismaClient } from '@prisma/client';
import { AlertCriteria, AlertNotification } from './alert-types';

const prisma = new PrismaClient();

export class AlertEngine {
  /**
   * Check if an alert should be triggered based on new vote data
   */
  static async checkVoteAlerts(voteId: string): Promise<AlertNotification[]> {
    const vote = await prisma.vote.findUnique({
      where: { id: voteId },
      include: {
        mepVotes: {
          include: {
            mep: {
              include: {
                country: true,
                party: true,
              },
            },
          },
        },
        dossier: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    if (!vote) return [];

    // Get all active alerts
    const alerts = await prisma.alert.findMany({
      where: { active: true },
      include: { user: true },
    });

    const notifications: AlertNotification[] = [];

    for (const alert of alerts) {
      const criteria = alert.criteria as AlertCriteria;
      
      if (await this.matchesVoteCriteria(vote, criteria)) {
        const notification = await this.createVoteNotification(alert, vote);
        notifications.push(notification);
      }
    }

    return notifications;
  }

  /**
   * Check if an alert should be triggered based on attendance changes
   */
  static async checkAttendanceAlerts(mepId: string, oldAttendance: number, newAttendance: number): Promise<AlertNotification[]> {
    const mep = await prisma.mEP.findUnique({
      where: { id: mepId },
      include: {
        country: true,
        party: true,
      },
    });

    if (!mep) return [];

    // Get all active alerts
    const alerts = await prisma.alert.findMany({
      where: { active: true },
      include: { user: true },
    });

    const notifications: AlertNotification[] = [];

    for (const alert of alerts) {
      const criteria = alert.criteria as AlertCriteria;
      
      if (await this.matchesAttendanceCriteria(mep, oldAttendance, newAttendance, criteria)) {
        const notification = await this.createAttendanceNotification(alert, mep, oldAttendance, newAttendance);
        notifications.push(notification);
      }
    }

    return notifications;
  }

  /**
   * Check if a vote matches the alert criteria
   */
  private static async matchesVoteCriteria(vote: any, criteria: AlertCriteria): Promise<boolean> {
    // Check country filter
    if (criteria.countries && criteria.countries.length > 0) {
      const voteCountries = vote.mepVotes.map((mv: any) => mv.mep.country.code);
      if (!criteria.countries.some(country => voteCountries.includes(country))) {
        return false;
      }
    }

    // Check party filter
    if (criteria.parties && criteria.parties.length > 0) {
      const voteParties = vote.mepVotes
        .map((mv: any) => mv.mep.party?.euGroup)
        .filter(Boolean);
      if (!criteria.parties.some(party => voteParties.includes(party))) {
        return false;
      }
    }

    // Check vote type filter
    if (criteria.voteTypes && criteria.voteTypes.length > 0) {
      const voteTypes = vote.mepVotes.map((mv: any) => mv.choice);
      if (!criteria.voteTypes.some(type => voteTypes.includes(type))) {
        return false;
      }
    }

    // Check topic filter
    if (criteria.topics && criteria.topics.length > 0) {
      const voteTopics = vote.dossier?.tags?.map((dt: any) => dt.tag.slug) || [];
      if (!criteria.topics.some(topic => voteTopics.includes(topic))) {
        return false;
      }
    }

    // Check date range
    if (criteria.dateRange) {
      const voteDate = new Date(vote.date);
      if (criteria.dateRange.start && voteDate < new Date(criteria.dateRange.start)) {
        return false;
      }
      if (criteria.dateRange.end && voteDate > new Date(criteria.dateRange.end)) {
        return false;
      }
    }

    // Check keywords
    if (criteria.keywords && criteria.keywords.length > 0) {
      const searchText = `${vote.title} ${vote.description || ''}`.toLowerCase();
      if (!criteria.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if attendance change matches the alert criteria
   */
  private static async matchesAttendanceCriteria(mep: any, oldAttendance: number, newAttendance: number, criteria: AlertCriteria): Promise<boolean> {
    // Check country filter
    if (criteria.countries && criteria.countries.length > 0) {
      if (!criteria.countries.includes(mep.country.code)) {
        return false;
      }
    }

    // Check party filter
    if (criteria.parties && criteria.parties.length > 0) {
      if (!criteria.parties.includes(mep.party?.euGroup || '')) {
        return false;
      }
    }

    // Check attendance threshold
    if (criteria.attendanceThreshold !== undefined) {
      const threshold = criteria.attendanceThreshold;
      const direction = criteria.attendanceDirection || 'below';
      
      if (direction === 'below' && newAttendance >= threshold) {
        return false;
      }
      if (direction === 'above' && newAttendance <= threshold) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create a vote notification
   */
  private static async createVoteNotification(alert: any, vote: any): Promise<AlertNotification> {
    const meps = vote.mepVotes.map((mv: any) => ({
      id: mv.mep.id,
      name: `${mv.mep.firstName} ${mv.mep.lastName}`,
      country: mv.mep.country.name,
      party: mv.mep.party?.name,
    }));

    return {
      alertId: alert.id,
      alertName: alert.name,
      triggerReason: `New vote: ${vote.title}`,
      data: {
        meps,
        votes: [{
          id: vote.id,
          title: vote.title || 'Untitled Vote',
          date: vote.date.toISOString(),
          result: vote.description,
        }],
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an attendance notification
   */
  private static async createAttendanceNotification(alert: any, mep: any, oldAttendance: number, newAttendance: number): Promise<AlertNotification> {
    return {
      alertId: alert.id,
      alertName: alert.name,
      triggerReason: `Attendance change: ${mep.firstName} ${mep.lastName}`,
      data: {
        meps: [{
          id: mep.id,
          name: `${mep.firstName} ${mep.lastName}`,
          country: mep.country.name,
          party: mep.party?.name,
        }],
        attendance: [{
          mepId: mep.id,
          mepName: `${mep.firstName} ${mep.lastName}`,
          oldAttendance,
          newAttendance,
        }],
      },
      timestamp: new Date().toISOString(),
    };
  }
}

