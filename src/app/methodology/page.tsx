import { Metadata } from 'next';
// import { generatePageSEO } from '@/app/seo.config';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Methodology - How We Calculate MEP Attendance | Where\'s My MEP?',
    description: 'Learn about our methodology for calculating MEP attendance rates, voting patterns, and performance rankings in the European Parliament.',
  };
}

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Methodology
            </h1>
            <p className="text-lg text-gray-600">
              How we calculate MEP attendance and performance metrics
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-lg max-w-none">
          <h2>Data Collection</h2>
          <p>
            We collect data from multiple sources to ensure accuracy and completeness:
          </p>
          <ul>
            <li><strong>European Parliament:</strong> Official roll-call vote records</li>
            <li><strong>HowTheyVote.eu:</strong> Processed voting data and MEP information</li>
            <li><strong>Committee Records:</strong> Official committee membership data</li>
            <li><strong>MEP Profiles:</strong> Public information about representatives</li>
          </ul>

          <h2>Attendance Calculation</h2>
          <p>
            Our attendance calculation is based on roll-call votes over the last 180 days:
          </p>
          <ul>
            <li><strong>Present:</strong> MEP voted "For", "Against", or "Abstain"</li>
            <li><strong>Absent:</strong> MEP did not vote or was marked as "Not voting"</li>
            <li><strong>Attendance Rate:</strong> (Present votes / Total votes) × 100</li>
          </ul>

          <h3>Special Cases</h3>
          <p>
            We account for special circumstances that may affect attendance:
          </p>
          <ul>
            <li><strong>New MEPs:</strong> Those who started their term recently may have limited data</li>
            <li><strong>Partial Terms:</strong> MEPs who joined mid-term are flagged accordingly</li>
            <li><strong>Sick Leave:</strong> MEPs on documented sick leave are excluded from rankings</li>
            <li><strong>Special Roles:</strong> Presidents and other officials may have different voting patterns</li>
          </ul>

          <h2>Voting Analysis</h2>
          <p>
            We analyze voting patterns across different dimensions:
          </p>
          <ul>
            <li><strong>Policy Topics:</strong> Votes are categorized by policy area (climate, migration, etc.)</li>
            <li><strong>Political Alignment:</strong> How MEPs vote relative to their party and political group</li>
            <li><strong>Consistency:</strong> Regularity of voting patterns over time</li>
            <li><strong>Engagement:</strong> Frequency of participation in votes</li>
          </ul>

          <h2>Ranking Methodology</h2>
          <p>
            Our rankings are calculated using multiple factors:
          </p>
          <ul>
            <li><strong>Attendance Rate:</strong> Primary factor for attendance rankings</li>
            <li><strong>Vote Participation:</strong> Number of votes cast relative to total available</li>
            <li><strong>Policy Consistency:</strong> Alignment with stated positions and party line</li>
            <li><strong>Committee Work:</strong> Active participation in committee activities</li>
          </ul>

          <h2>Data Quality</h2>
          <p>
            We maintain high data quality through:
          </p>
          <ul>
            <li><strong>Regular Updates:</strong> Data is refreshed daily from official sources</li>
            <li><strong>Validation:</strong> Cross-referencing multiple data sources</li>
            <li><strong>Error Handling:</strong> Flagging and investigating data anomalies</li>
            <li><strong>Transparency:</strong> Clear documentation of our methods and limitations</li>
          </ul>

          <h2>Limitations</h2>
          <p>
            Our methodology has some limitations:
          </p>
          <ul>
            <li><strong>Roll-call Votes Only:</strong> We only track votes that require individual MEP identification</li>
            <li><strong>Time Period:</strong> Attendance is calculated over the last 180 days</li>
            <li><strong>Committee Work:</strong> Limited visibility into non-voting committee activities</li>
            <li><strong>Context:</strong> We cannot account for all reasons for absence (illness, official duties, etc.)</li>
          </ul>

          <h2>Updates and Changes</h2>
          <p>
            We continuously improve our methodology based on:
          </p>
          <ul>
            <li>Feedback from users and stakeholders</li>
            <li>Changes in parliamentary procedures</li>
            <li>Availability of new data sources</li>
            <li>Best practices in transparency and accountability</li>
          </ul>

          <h2>Contact</h2>
          <p>
            If you have questions about our methodology or suggestions for improvement, please contact us at 
            <a href="mailto:methodology@wheresmymep.eu" className="text-blue-600 hover:text-blue-800">methodology@wheresmymep.eu</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
