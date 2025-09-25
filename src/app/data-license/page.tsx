import { Metadata } from 'next';
import { generatePageSEO } from '@/app/seo.config';

export const revalidate = 86400; // 24 hours

export async function generateMetadata(): Promise<Metadata> {
  const seo = generatePageSEO(
    'Data License & Attribution | Where\'s My MEP?',
    'Learn about our data sources, licensing, and attribution requirements for European Parliament data used on Where\'s My MEP?.',
    '/data-license'
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default function DataLicensePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Data License & Attribution
            </h1>
            <p className="text-lg text-gray-600">
              Our data sources, licensing, and attribution requirements
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-lg max-w-none">
          <h2>Data Sources</h2>
          <p>
            Where's My MEP? aggregates data from multiple sources to provide comprehensive information about 
            European Parliament activities:
          </p>

          <h3>Primary Sources</h3>
          <ul>
            <li><strong>European Parliament:</strong> Official roll-call vote records and MEP information</li>
            <li><strong>HowTheyVote.eu:</strong> Processed voting data and parliamentary records</li>
            <li><strong>Committee Records:</strong> Official committee membership and activity data</li>
            <li><strong>Public Records:</strong> MEP profiles, contact information, and biographical data</li>
          </ul>

          <h2>Licensing</h2>
          <p>
            Our data usage follows these licensing principles:
          </p>

          <h3>Open Data</h3>
          <p>
            The underlying parliamentary data is generally available under open licenses:
          </p>
          <ul>
            <li><strong>European Parliament Data:</strong> Available under EU open data policies</li>
            <li><strong>HowTheyVote.eu:</strong> Data available under Open Database License (ODbL)</li>
            <li><strong>Public Records:</strong> Generally available for public use and analysis</li>
          </ul>

          <h3>Our Added Value</h3>
          <p>
            While the source data is open, our platform adds significant value through:
          </p>
          <ul>
            <li>Data processing and normalization</li>
            <li>Analysis and ranking algorithms</li>
            <li>User interface and accessibility features</li>
            <li>Alert systems and notification services</li>
            <li>API access and integration tools</li>
          </ul>

          <h2>Attribution Requirements</h2>
          <p>
            When using our data or platform, please provide appropriate attribution:
          </p>

          <h3>For Data Usage</h3>
          <p>
            If you use our processed data, please include:
          </p>
          <ul>
            <li>Attribution to "Where's My MEP?" as the data processor</li>
            <li>Attribution to original sources (European Parliament, HowTheyVote.eu)</li>
            <li>Date of data access or last update</li>
            <li>Link to our platform (https://wheresmymep.eu)</li>
          </ul>

          <h3>For API Usage</h3>
          <p>
            API users should include:
          </li>
          <ul>
            <li>Clear attribution in any public-facing applications</li>
            <li>Link to our platform in data visualizations or reports</li>
            <li>Respect for rate limits and usage terms</li>
          </ul>

          <h2>Data Accuracy</h2>
          <p>
            We strive for accuracy but cannot guarantee 100% correctness:
          </p>
          <ul>
            <li>Data is processed from official sources but may contain errors</li>
            <li>We update data regularly but there may be delays</li>
            <li>Users should verify critical information independently</li>
            <li>We welcome corrections and feedback on data quality</li>
          </ul>

          <h2>Commercial Use</h2>
          <p>
            Commercial use of our data is subject to our terms of service:
          </p>
          <ul>
            <li>Free tier allows limited commercial use with attribution</li>
            <li>Pro subscriptions provide expanded commercial rights</li>
            <li>Enterprise licenses available for large-scale commercial use</li>
            <li>Contact us for custom licensing arrangements</li>
          </ul>

          <h2>Privacy and Data Protection</h2>
          <p>
            We respect privacy and data protection requirements:
          </p>
          <ul>
            <li>We only use publicly available parliamentary data</li>
            <li>Personal data processing follows GDPR requirements</li>
            <li>User data is protected according to our privacy policy</li>
            <li>We do not collect or store private MEP communications</li>
          </ul>

          <h2>Contact</h2>
          <p>
            For questions about data licensing, attribution, or commercial use, please contact us:
          </p>
          <ul>
            <li>Email: <a href="mailto:legal@wheresmymep.eu" className="text-blue-600 hover:text-blue-800">legal@wheresmymep.eu</a></li>
            <li>Data questions: <a href="mailto:data@wheresmymep.eu" className="text-blue-600 hover:text-blue-800">data@wheresmymep.eu</a></li>
            <li>Commercial licensing: <a href="mailto:commercial@wheresmymep.eu" className="text-blue-600 hover:text-blue-800">commercial@wheresmymep.eu</a></li>
          </ul>

          <h2>Updates</h2>
          <p>
            This data license information is updated regularly. Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  );
}
