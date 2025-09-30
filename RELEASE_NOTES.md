# Release Notes - Safe Sprout Features

## What's New

This release introduces several preview features behind feature flags, allowing for safe testing and gradual rollout.

### 🚨 Alert System (Preview)
- **Create Alert Modal**: Users can express interest in email alerts for MEP activity and voting patterns
- **API Endpoint**: `/api/alerts/interest` handles alert interest submissions
- **Email Forwarding**: Optional email forwarding to `ALERT_FORWARD_EMAIL` when configured
- **Accessibility**: Full keyboard navigation, screen reader support, and focus management

### 📊 CSV Export (Preview)
- **Client-side Export**: Export MEP voting data as CSV files
- **Smart Detection**: Automatically detects exportable tables with `data-exportable="true"`
- **File Naming**: Downloads as `mep-<slug>.csv` for easy identification
- **No Server Load**: Pure client-side implementation

### 🎯 EU Act Radar (Preview)
- **AI Act Tracking**: Comprehensive preview of AI Act compliance tracking features
- **Topic Pages**: Detailed pages for logging, dataset governance, post-market monitoring, transparency, and risk management
- **Sample Data**: Realistic sample data for testing and demonstration
- **Pricing Page**: Complete pricing structure for future monetization

### 🎛️ Feature Flag System
- **Runtime Toggles**: Browser-based feature flags with localStorage persistence
- **Environment Fallbacks**: Server-side environment variable support
- **Preview Page**: `/preview` for easy feature management
- **Preview Banner**: Dismissible banner showing active preview features

## How to Toggle Features

### Via Preview Page
1. Visit `/preview` on the site
2. Toggle individual features on/off
3. Use "Turn all ON/OFF" for quick testing
4. Reset to defaults anytime

### Via Magic Links
- `?actradar=on` - Enable Act Radar preview
- `?actradar=off` - Disable Act Radar preview
- `?alerts=on` - Enable alerts feature
- `?csv=on` - Enable CSV export
- `?changes=on` - Enable changes page

### Via Environment Variables
Set these environment variables to enable features globally:
- `NEXT_PUBLIC_FEATURE_ALERTS=true`
- `NEXT_PUBLIC_FEATURE_CSV=true`
- `NEXT_PUBLIC_FEATURE_CHANGES=true`
- `NEXT_PUBLIC_FEATURE_ACTRADAR=true`
- `ALERT_FORWARD_EMAIL=your-email@example.com` (optional)

## Rollback Instructions

If you need to disable all preview features:

1. **Immediate**: Visit `/preview` and turn all features OFF
2. **Environment**: Set all `NEXT_PUBLIC_FEATURE_*` variables to `false`
3. **Browser**: Clear localStorage or use magic links with `=off`

## Safety Features

- **Default OFF**: All features are disabled by default
- **No Database Changes**: No persistent data storage
- **No SEO Impact**: Preview pages have `noindex` meta tags
- **Graceful Degradation**: Site works identically when features are disabled
- **Type Safety**: Full TypeScript support with strict type checking

## Testing

See the test checklist in the PR description for comprehensive testing instructions.

## Future Roadmap

- **Alerts**: Full email notification system
- **CSV Export**: Additional data export options
- **Act Radar**: Real AI Act data integration
- **Analytics**: Usage tracking for preview features

