# Feature Flags Documentation

This document describes the feature flag system used in Where's My MEP? for safe feature rollout and testing.

## Overview

The feature flag system allows features to be toggled at runtime without code changes. Flags are stored in browser localStorage with environment variable fallbacks.

## Flag Names

### `alerts`
- **Purpose**: Enable alert creation and interest collection
- **Environment Variable**: `NEXT_PUBLIC_FEATURE_ALERTS`
- **Default**: `false`
- **Features**:
  - Create Alert modal on MEP and committee pages
  - `/api/alerts/interest` endpoint
  - Email forwarding (if `ALERT_FORWARD_EMAIL` is set)

### `csv`
- **Purpose**: Enable CSV export functionality
- **Environment Variable**: `NEXT_PUBLIC_FEATURE_CSV`
- **Default**: `false`
- **Features**:
  - Export CSV button on MEP pages
  - Client-side table data extraction
  - File download as `mep-<slug>.csv`

### `changes`
- **Purpose**: Enable weekly changes page
- **Environment Variable**: `NEXT_PUBLIC_FEATURE_CHANGES`
- **Default**: `false`
- **Features**:
  - `/changes` page with weekly updates
  - New roll-call votes section
  - Notable MEP updates

### `actradar`
- **Purpose**: Enable EU Act Radar preview
- **Environment Variable**: `NEXT_PUBLIC_FEATURE_ACTRADAR`
- **Default**: `false`
- **Features**:
  - `/ai-act` index page
  - `/ai-act/what-changed` weekly updates
  - `/ai-act/topics/[slug]` topic pages
  - `/ai-act/pricing` pricing page
  - Sample data from `/data/ai-act/changes.sample.json`

## Environment Variables

### Feature Flags
```bash
# Alert system
NEXT_PUBLIC_FEATURE_ALERTS=false

# CSV export
NEXT_PUBLIC_FEATURE_CSV=false

# Changes page
NEXT_PUBLIC_FEATURE_CHANGES=false

# Act Radar preview
NEXT_PUBLIC_FEATURE_ACTRADAR=false
```

### Optional Configuration
```bash
# Email forwarding for alert interest submissions
ALERT_FORWARD_EMAIL=your-email@example.com

# Resend API key for email functionality
RESEND_API_KEY=your-resend-api-key
```

## Usage

### Runtime Toggles
Users can toggle features via:
1. **Preview Page**: Visit `/preview` for UI toggles
2. **Magic Links**: URL parameters like `?actradar=on`
3. **Browser Storage**: Direct localStorage manipulation

### Programmatic Access
```typescript
import { getFlag, setFlag, useFlag } from '@/lib/flags';

// Get flag value
const isEnabled = getFlag('alerts');

// Set flag value
setFlag('alerts', true);

// React hook
const [isEnabled, setIsEnabled] = useFlag('alerts');
```

## Implementation Details

### Storage
- **Client**: `localStorage` with keys like `ff_alerts`
- **Server**: Environment variables as fallbacks
- **Events**: Storage events for cross-tab synchronization

### Safety
- **Default OFF**: All flags default to `false`
- **No Persistence**: No database storage of flag states
- **Graceful Degradation**: Features fail silently when disabled
- **Type Safety**: Full TypeScript support

### Performance
- **Minimal Overhead**: Flags checked only when needed
- **Client-side**: No server requests for flag values
- **Caching**: localStorage provides instant access

## Testing

### Local Development
1. Set environment variables in `.env.local`
2. Use `/preview` page for runtime testing
3. Test magic links: `?actradar=on`, `?alerts=off`

### Production
1. Set environment variables in deployment
2. Use magic links for immediate testing
3. Monitor via preview banner visibility

## Rollback

### Immediate
- Visit `/preview` and turn all features OFF
- Use magic links: `?actradar=off&alerts=off&csv=off&changes=off`

### Environment
- Set all `NEXT_PUBLIC_FEATURE_*` to `false`
- Redeploy application

### Emergency
- Clear browser localStorage
- Restart application with environment variables disabled

## Best Practices

1. **Always Default OFF**: New features should be disabled by default
2. **Test Both States**: Verify functionality works when enabled and disabled
3. **Monitor Usage**: Track flag usage for feature adoption
4. **Document Changes**: Update this file when adding new flags
5. **Clean Up**: Remove flags after features are fully rolled out
