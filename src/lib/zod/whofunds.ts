import { z } from 'zod';

// Enums - aligned with real EP declaration categories
const CategorySchema = z.enum([
  'outside_activity',      // Professional activities and functions
  'board_membership',      // Board/advisory positions
  'honoraria',            // Speaking fees, prizes
  'ownership',            // Shareholdings, partnerships
  'consultancy',          // Consulting/advisory work  
  'teaching',             // Academic positions
  'writing',              // Publications, media
  'other'                 // Other declared interests
]);

const EntityTypeSchema = z.enum([
  'company',
  'ngo',
  'foundation',
  'university',
  'public_body',
  'media',
  'political_party',
  'other',
  'unknown'
]);

const ConfidenceSchema = z.enum(['high', 'medium', 'low']);

const ParsingMethodSchema = z.enum(['html', 'pdf', 'manual', 'api']);

const PeriodSchema = z.enum(['monthly', 'annual', 'one-off', 'unknown']);

// Income and interests entry
const IncomeAndInterestSchema = z.object({
  category: CategorySchema,
  entity_name: z.string(),
  entity_type: EntityTypeSchema,
  role: z.string().optional(),
  amount_eur_min: z.number().min(0).optional(),
  amount_eur_max: z.number().min(0).optional(),
  period: PeriodSchema.optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
  source_excerpt: z.string().optional(),
});

// Gifts and travel entry
const GiftTravelSchema = z.object({
  sponsor: z.string(),
  item: z.string(),
  value_eur: z.number().min(0).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
});

// Sources
const SourcesSchema = z.object({
  declaration_url: z.string().url(),
  transparency_register_urls: z.array(z.string().url()).optional(),
});

// Data quality
const DataQualitySchema = z.object({
  confidence: ConfidenceSchema,
  parsing_method: ParsingMethodSchema,
  issues: z.array(z.string()).optional(),
});

// Main WhoFunds schema
export const WhoFundsSchema = z.object({
  mep_id: z.string(),
  name: z.string(),
  country: z.string(),
  party: z.string(),
  sources: SourcesSchema,
  last_updated_utc: z.string().datetime(),
  income_and_interests: z.array(IncomeAndInterestSchema),
  gifts_travel: z.array(GiftTravelSchema),
  data_quality: DataQualitySchema,
});

// Index entry schema
export const WhoFundsIndexEntrySchema = z.object({
  mep_id: z.string(),
  name: z.string(),
  country: z.string(),
  party: z.string(),
  last_updated_utc: z.string().datetime(),
  total_income_entries: z.number(),
  total_gifts_entries: z.number(),
  total_estimated_value_eur: z.number().optional(),
});

// Index schema
export const WhoFundsIndexSchema = z.object({
  meta: z.object({
    generated_at: z.string().datetime(),
    total_meps: z.number(),
    last_full_refresh: z.string().datetime().optional(),
  }),
  meps: z.array(WhoFundsIndexEntrySchema),
});

// Changelog entry schema
export const ChangelogEntrySchema = z.object({
  timestamp: z.string().datetime(),
  mep_id: z.string(),
  action: z.enum(['created', 'updated', 'error']),
  changes: z.array(z.string()).optional(),
  error: z.string().optional(),
});

// Export types
export type WhoFundsData = z.infer<typeof WhoFundsSchema>;
export type WhoFundsIndexEntry = z.infer<typeof WhoFundsIndexEntrySchema>;
export type WhoFundsIndex = z.infer<typeof WhoFundsIndexSchema>;
export type ChangelogEntry = z.infer<typeof ChangelogEntrySchema>;
export type IncomeAndInterest = z.infer<typeof IncomeAndInterestSchema>;
export type GiftTravel = z.infer<typeof GiftTravelSchema>;
export type DataQuality = z.infer<typeof DataQualitySchema>;

// Validation helpers
export function validateWhoFundsData(data: unknown): WhoFundsData {
  return WhoFundsSchema.parse(data);
}

export function validateWhoFundsIndex(data: unknown): WhoFundsIndex {
  return WhoFundsIndexSchema.parse(data);
}

export function validateChangelogEntry(data: unknown): ChangelogEntry {
  return ChangelogEntrySchema.parse(data);
}

// Helper to check if data is valid
export function isValidWhoFundsData(data: unknown): data is WhoFundsData {
  try {
    WhoFundsSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}
