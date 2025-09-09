# Where's My MEP? - European Parliament Attendance Tracker

A Next.js application that tracks attendance rates of Members of the European Parliament (MEPs) in roll-call votes over the last 180 days.

## Features

- **Real-time MEP Data**: Displays attendance percentages for all current MEPs
- **Interactive Leaderboard**: Sortable and filterable table with pagination
- **Individual MEP Profiles**: Detailed view with attendance stats and notable votes
- **Search Functionality**: Find MEPs by name or country
- **Email Notifications**: Sign up to be notified when MEPs from your country have low attendance
- **Mobile-First Design**: Responsive UI built with Tailwind CSS

## Data Sources

The application uses four CSV datasets:

1. **`meps.csv`** - MEP identity data (name, country, EU group, national party, profile URLs)
2. **`meps_attendance.csv`** - Attendance statistics (votes cast, total votes, attendance percentage)
3. **`mep_notable_votes.csv`** - Individual MEP vote positions on notable votes
4. **`votes_catalog.csv`** - Catalog of all votes with metadata

**Data Provider**: [HowTheyVote.eu](https://howtheyvote.eu/) - Official aggregator of European Parliament roll-call vote data

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Upstash Redis database (for email notifications)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wheres-my-mep-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Upstash Redis database:
   - Go to [Upstash Console](https://console.upstash.com/)
   - Create a new Redis database
   - Copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   - Create a `.env.local` file in the project root:
   ```bash
   KV_REST_API_URL=https://your-database-url.upstash.io
   KV_REST_API_TOKEN=your-redis-token-here
   ```

4. Ensure data files are present in the `data/` directory:
   - `meps.csv`
   - `meps_attendance.csv` 
   - `mep_notable_votes.csv`
   - `votes_catalog.csv`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

The application provides the following read-only API endpoints:

- `GET /api/meps` - List all MEPs with optional search/filter parameters
- `GET /api/meps/[id]` - Get detailed information for a specific MEP
- `GET /api/meps/[id]/notable` - Get notable votes for a specific MEP
- `GET /api/leaderboard` - Get top/bottom attendance leaderboards
- `GET /api/votes/[vote_id]` - Get details for a specific vote
- `POST /api/notifications/signup` - Sign up for email notifications
- `GET /api/notifications/signup` - Get notification signups (admin)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
4. Deploy automatically

The app will load CSV data at startup and serve it from memory for optimal performance.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Data Updates

To update the MEP data:

1. Run the data collection scripts to generate new CSV files
2. Replace the files in the `data/` directory
3. Redeploy the application

The data is loaded once at startup for optimal performance. No database is required.

## Methodology

- **Attendance Calculation**: Based on roll-call votes in the European Parliament over the last 180 days
- **Vote Counting**: Abstaining counts as present; not voting counts as absent
- **Notable Votes**: Selected based on significance, close outcomes, and high participation
- **Partial Terms**: Some MEPs may have started their term recently, affecting their attendance percentage

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Processing**: PapaParse for CSV parsing
- **Deployment**: Vercel (recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Privacy

This application only uses publicly available data from the European Parliament. No personal data is collected or stored.