import { Metadata } from 'next';
import { generatePageSEO } from '@/app/seo.config';

export const revalidate = 86400; // 24 hours

export async function generateMetadata(): Promise<Metadata> {
  const seo = generatePageSEO(
    'About Where\'s My MEP? - European Parliament Transparency',
    'Learn about Where\'s My MEP?, our mission to increase transparency in the European Parliament, and how we track MEP attendance and voting records.',
    '/about'
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              About Where's My MEP?
            </h1>
            <p className="text-lg text-gray-600">
              Increasing transparency in the European Parliament
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-lg max-w-none">
          <h2>Our Mission</h2>
          <p>
            Where's My MEP? is dedicated to increasing transparency and accountability in the European Parliament 
            by providing comprehensive data on Member attendance, voting records, and policy positions. We believe 
            that citizens have the right to know how their elected representatives are performing their duties.
          </p>

          <h2>What We Track</h2>
          <p>
            Our platform monitors and analyzes:
          </p>
          <ul>
            <li><strong>Attendance Records:</strong> Roll-call vote participation over the last 180 days</li>
            <li><strong>Voting Patterns:</strong> How MEPs vote on key policy issues</li>
            <li><strong>Committee Work:</strong> MEP participation in parliamentary committees</li>
            <li><strong>Policy Positions:</strong> Rankings by topic area and political alignment</li>
            <li><strong>Activity Levels:</strong> Overall engagement in parliamentary work</li>
          </ul>

          <h2>Data Sources</h2>
          <p>
            We source our data from official European Parliament records and third-party transparency initiatives:
          </p>
          <ul>
            <li>European Parliament roll-call vote records</li>
            <li>HowTheyVote.eu voting data</li>
            <li>Official MEP profiles and committee memberships</li>
            <li>Public attendance and participation records</li>
          </ul>

          <h2>Our Approach</h2>
          <p>
            We believe in:
          </p>
          <ul>
            <li><strong>Transparency:</strong> Making parliamentary data accessible to all citizens</li>
            <li><strong>Accuracy:</strong> Ensuring data quality and regular updates</li>
            <li><strong>Neutrality:</strong> Presenting information without political bias</li>
            <li><strong>Accessibility:</strong> Making complex data understandable to everyone</li>
          </ul>

          <h2>Impact</h2>
          <p>
            Since our launch, Where's My MEP? has helped:
          </p>
          <ul>
            <li>Citizens track their representatives' performance</li>
            <li>Journalists investigate parliamentary attendance patterns</li>
            <li>Researchers analyze voting behavior and political trends</li>
            <li>MEPs understand their own performance relative to peers</li>
          </ul>

          <h2>Contact</h2>
          <p>
            We welcome feedback, suggestions, and collaboration opportunities. You can reach us at:
          </p>
          <ul>
            <li>Email: contact@wheresmymep.eu</li>
            <li>Twitter: @wheresmymep</li>
            <li>GitHub: github.com/wheresmymep</li>
          </ul>

          <h2>Support Our Work</h2>
          <p>
            If you find Where's My MEP? valuable, please consider supporting our work through our 
            <a href="/pricing" className="text-blue-600 hover:text-blue-800">pro subscription</a> or 
            by sharing our platform with others who care about parliamentary transparency.
          </p>
        </div>
      </main>
    </div>
  );
}
