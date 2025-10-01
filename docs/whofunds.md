# WhoFundsMyMEP - Production Implementation Guide

## Overview

WhoFundsMyMEP ingests real "Declarations of Financial Interests" from official European Parliament MEP profiles, parses them, normalizes the data, and serves it through a clean API and UI.

## Architecture

### Data Flow
1. **Discovery**: Find declaration URLs from MEP profile pages
2. **Fetch**: Download HTML/PDF declarations with caching and rate limiting
3. **Parse**: Extract structured data using category-specific parsers
4. **Normalize**: Convert to standard schema with quality indicators
5. **Validate**: Check against Zod schema
6. **Serve**: Expose via API endpoints and UI

### Components

#### Server-Side Parsing (`src/server/whofunds/`)
- `normalize.ts` - Currency, date, category normalization helpers
- `sources.ts` - Declaration URL discovery logic
- `parse-html.ts` - HTML table/list parser
- `parse-pdf.ts` - PDF text extraction parser
- `cache.ts` - Caching and rate limiting utilities

#### ETL Scripts (`scripts/whofunds/`)
- `discover-declarations.ts` - Find declaration URLs from profiles
- `fetch-declarations.ts` - Main ETL driver
- `validate.ts` - Schema validation

#### API Routes (`src/app/api/whofunds/`)
- `[mepId]/route.ts` - Get individual MEP data
- `export/route.ts` - CSV export (gated by subscription)
- `watch/route.ts` - Alert subscriptions

#### UI Components
- `/who-funds` - Main index with leaderboard
- `/who-funds/methodology` - Documentation
- MEP profile cards - Funding & Interests section
- `WatchMEPButton` - Alert subscription

## Schema

### Categories (from real EP declarations)
- `outside_activity` - Professional activities and functions
- `board_membership` - Board/advisory positions
- `honoraria` - Speaking fees, prizes, awards
- `ownership` - Shareholdings, partnerships
- `consultancy` - Consulting/advisory work
- `teaching` - Academic positions
- `writing` - Publications, media work
- `other` - Miscellaneous interests

### Entity Types
- `company`, `ngo`, `foundation`, `university`, `public_body`, `media`, `political_party`, `other`, `unknown`

### Confidence Levels
- `high` - Clean structured data with amounts
- `medium` - Partial data or some ambiguity
- `low` - Significant parsing issues

## Rate Limiting & Caching

- **Concurrency**: 3-5 parallel requests (using p-limit)
- **Delay**: 2-3 seconds between requests to same host
- **Cache**: SHA256 content hashing, 24-hour freshness
- **Retry**: 3 attempts with exponential backoff
- **User-Agent**: Identifies as research tool

## Running the ETL

### Prerequisites
```bash
export ALLOW_WHOFUNDS_FETCH=true
```

### Discovery Phase
```bash
npm run etl:whofunds:discover
```
Scans MEP profile pages to find declaration URLs. Caches results in `.cache/whofunds/{mep_id}.meta.json`.

### Fetch Phase
```bash
npm run etl:whofunds:fetch
```
Downloads and parses declarations. Writes to `public/data/whofunds/{mep_id}.json` and updates `public/data/whofunds/index.json`.

### Validation
```bash
npm run validate:whofunds
```
Validates all JSON files against Zod schema.

## Data Quality

### Parsing Methods
- `html` - Structured HTML tables (highest confidence)
- `pdf` - Text extraction from PDFs (medium confidence)
- `manual` - Hand-curated entries (highest confidence)

### Quality Indicators
Each entry includes:
- `data_quality.confidence` - Overall confidence level
- `data_quality.parsing_method` - How data was extracted
- `data_quality.issues[]` - Known problems
- `source_excerpt` - Original text for verification

### Low Confidence Handling
Entries marked `low` confidence are:
- Still included in the data
- Flagged in UI with badges
- Logged to `review-low-confidence.csv` for manual review

## Cron & Updates

### Daily Refresh (`/api/cron/whofunds-refresh`)
- Runs daily at 03:30 CET
- Checks MEPs updated >30 days ago
- Re-fetches if declaration URL changed
- Creates diff and appends to `changelog.ndjson`
- Sends email alerts to watchers

### Changelog Format
```jsonl
{"timestamp":"2024-10-01T03:30:00Z","mep_id":"197400","diff":{"added":1,"removed":0,"changes":["New board membership: Tech Foundation"]}}
```

## API Endpoints

### GET `/api/whofunds/[mepId]`
Returns full financial data for one MEP.

**Response**: WhoFundsData JSON

### POST `/api/whofunds/export`
Generate filtered CSV export.

**Auth**: Requires Pro subscription (Stripe check)

**Body**:
```json
{
  "filter": {
    "country": "France",
    "party": "Renew Europe Group",
    "minIncome": 5000
  }
}
```

**Response**: CSV file download

### GET/POST `/api/whofunds/watch`
Manage MEP watch subscriptions for alerts.

**Auth**: Requires NextAuth session

## Testing

### Unit Tests
```bash
npm test
```

Tests cover:
- `normalize.test.ts` - Currency/date parsing
- `parse-html.test.ts` - HTML extraction
- `parse-pdf.test.ts` - PDF extraction

### Manual Testing
1. Enable feature flag: `NEXT_PUBLIC_FEATURE_WHOFUNDS=true`
2. Visit `/who-funds` - should show leaderboard
3. Click MEP profile - should show Funding & Interests card
4. Test API: `GET /api/whofunds/197400`

## Known Limitations

1. **Coverage**: Not all MEPs have machine-readable declarations
2. **Languages**: Multilingual support is heuristic-based
3. **PDF Parsing**: Less reliable than HTML due to layout variations
4. **Amounts**: Many declarations use ranges or omit specific amounts
5. **Updates**: Data is as current as the last ETL run (daily for active MEPs)

## Troubleshooting

### "No declaration URL found"
- MEP may not have published a declaration
- Link text may not match known patterns (add to `sources.ts`)
- Page structure may have changed

### "Low confidence" entries
- Check `source_excerpt` field for original text
- Review `data_quality.issues` array
- Consider manual correction via GitHub issue

### Rate limiting (429 errors)
- Increase delay in cache.ts
- Reduce concurrency limit
- Spread ETL runs over longer time

## Reporting Issues

Users can report parsing errors via:
1. "Report an issue" button on MEP cards
2. GitHub Issues (auto-filled with MEP ID and source URL)
3. Email to admin

## Security & Privacy

- All data sourced from public EP declarations
- No PII beyond what MEPs have publicly declared
- Caching respects robots.txt
- User watch lists stored securely (session-based)

## Future Enhancements

- [ ] ML-based entity extraction for PDFs
- [ ] Historical tracking (show changes over time)
- [ ] Entity disambiguation (link related companies)
- [ ] API for third-party integrations
- [ ] Bulk export for researchers
