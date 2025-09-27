import { z } from 'zod';

// Alert criteria schemas
export const AlertCriteriaSchema = z.object({
  // MEP filters
  countries: z.array(z.string()).optional(),
  parties: z.array(z.string()).optional(),
  committees: z.array(z.string()).optional(),
  mepIds: z.array(z.string()).optional(),
  
  // Vote filters
  topics: z.array(z.string()).optional(),
  voteTypes: z.array(z.enum(['for', 'against', 'abstain', 'absent'])).optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  
  // Attendance filters
  attendanceThreshold: z.number().min(0).max(100).optional(),
  attendanceDirection: z.enum(['above', 'below']).optional(),
  
  // General filters
  keywords: z.array(z.string()).optional(),
  dossierCodes: z.array(z.string()).optional(),
});

export type AlertCriteria = z.infer<typeof AlertCriteriaSchema>;

// Alert channel schemas
export const EmailChannelSchema = z.object({
  type: z.literal('email'),
  email: z.string().email(),
});

export const SlackChannelSchema = z.object({
  type: z.literal('slack'),
  webhookUrl: z.string().url(),
  channel: z.string().optional(),
});

export const WebhookChannelSchema = z.object({
  type: z.literal('webhook'),
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
});

export const AlertChannelSchema = z.discriminatedUnion('type', [
  EmailChannelSchema,
  SlackChannelSchema,
  WebhookChannelSchema,
]);

export type AlertChannel = z.infer<typeof AlertChannelSchema>;

// Complete alert schema
export const AlertSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  criteria: AlertCriteriaSchema,
  channel: AlertChannelSchema,
  active: z.boolean().default(true),
  frequency: z.enum(['immediate', 'daily', 'weekly']).default('immediate'),
  lastTriggered: z.date().optional(),
  createdAt: z.date().optional(),
});

export type Alert = z.infer<typeof AlertSchema>;

// Alert notification payload
export const AlertNotificationSchema = z.object({
  alertId: z.string(),
  alertName: z.string(),
  triggerReason: z.string(),
  data: z.object({
    meps: z.array(z.object({
      id: z.string(),
      name: z.string(),
      country: z.string(),
      party: z.string().optional(),
    })),
    votes: z.array(z.object({
      id: z.string(),
      title: z.string(),
      date: z.string(),
      result: z.string().optional(),
    })).optional(),
    attendance: z.array(z.object({
      mepId: z.string(),
      mepName: z.string(),
      oldAttendance: z.number().optional(),
      newAttendance: z.number(),
    })).optional(),
  }),
  timestamp: z.string(),
});

export type AlertNotification = z.infer<typeof AlertNotificationSchema>;

