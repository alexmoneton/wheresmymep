import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopicPageClient } from './TopicPageClient';
import { getEARBundle, canIndex, getPSEOLimits, isPSEOEnabled, makeMeta, logPSEOGate } from '@/lib/pseo';
import { copyForTopic, getTopicDisplayName, ensureMinWords } from '@/lib/pseo-copy';
import { breadcrumbLd, collectionLd } from '@/lib/structured';

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topicData = getTopicData(slug);
  
  if (!topicData) {
    return {
      title: 'Topic not found',
    };
  }

  // Get pSEO data
  const bundle = await getEARBundle();
  const limits = getPSEOLimits();
  const pseoEnabled = isPSEOEnabled();
  
  let shouldIndex = pseoEnabled;
  let description = topicData.description;
  
  if (bundle) {
    // Filter items by topic
    const topicItems = bundle.items.filter(item => item.topic === slug);
    const itemsCount = topicItems.length;
    
    // Generate copy and check word count
    const generatedCopy = copyForTopic(slug, topicItems);
    const { text: finalCopy, isThin } = ensureMinWords(generatedCopy, limits.minWords);
    const wordsCount = finalCopy.trim().split(/\s+/).length;
    
    // Apply quality gates
    shouldIndex = pseoEnabled && canIndex({
      minItems: limits.minItems,
      minWords: limits.minWords,
      wordsCount,
      itemsCount
    });
    
    if (!shouldIndex) {
      logPSEOGate(`topic-${slug}`, 'Quality gate failed', {
        itemsCount,
        wordsCount,
        minItems: limits.minItems,
        minWords: limits.minWords,
        pseoEnabled
      });
    }
    
    // Use generated copy if we have enough content
    if (itemsCount >= limits.minItems && wordsCount >= limits.minWords) {
      description = finalCopy.substring(0, 160) + (finalCopy.length > 160 ? '...' : '');
    }
  }

  const title = `AI Act — ${topicData.title} | EU Act Radar`;
  const canonical = `/ai-act/topics/${slug}`;
  
  return makeMeta({
    title,
    desc: description,
    canonical
  });
}

function getTopicData(slug: string) {
  const topics = {
    'logging': {
      title: 'Logging & Traceability',
      description: 'Track AI Act updates on logging and traceability requirements for high-risk systems.',
      content: `This page watches AI Act updates that touch logging and traceability. In plain terms: keeping a reliable trail of what your system did and when. Why it matters: logs help you explain decisions, investigate incidents, and prove you followed the rules. They're also the first thing people ask for when something goes wrong.

What you'll find here: short notes when new guidance, templates, or delegated acts mention event logs, trace IDs, retention, or access controls. We link back to the official source and keep the summary brief. No legal advice—just a clear heads-up that something moved.

Who this helps: compliance leads, product owners, security/ops teams, and auditors who need a quick signal that logging expectations changed.

Set an alert: add your email and we'll ping you when "logging" appears in guidance or delegated acts. Prefer fewer nudges? Choose the weekly digest.

Tip: start a simple checklist—what we log, how long we keep it, who can see it, how we export it—and keep it close to your incident process. Small, consistent steps beat big rewrites.`,
      topic: 'logging'
    },
    'dataset-governance': {
      title: 'Dataset Governance',
      description: 'Track AI Act updates on dataset governance, provenance, and quality requirements.',
      content: `This page tracks dataset governance under the AI Act: where data comes from, how it's documented, cleaned, tested, and updated. Why it matters: strong dataset practices reduce bias, improve reliability, and make compliance reviews smoother.

What you'll see: quick notes when the EU publishes guidance, examples, or delegated acts about data provenance, quality checks, documentation packs, or update procedures. Each item links to the official source so your team can dive deeper.

Who this helps: policy and compliance teams, data leads, and engineers who maintain datasets used in high-risk systems.

Set an alert: get notified when "dataset governance" appears in new material. Or pick the weekly digest if you prefer a single summary.

Practical start: keep a one-page "data passport" for each important dataset—what it contains, where it came from, when it was last refreshed, and known caveats. You can expand later; the key is having something clear you can hand to reviewers.`,
      topic: 'dataset-governance'
    },
    'post-market-monitoring': {
      title: 'Post-Market Monitoring',
      description: 'Track AI Act updates on post-market monitoring and incident reporting requirements.',
      content: `This page follows updates on post-market monitoring—what you do after a system ships: track incidents, learn from them, and improve safely. It's where theory meets real-world operations.

Expect short alerts when there's guidance or a delegated act about incident definitions, reporting thresholds, monitoring templates, or timelines. We keep the text simple and link to the official source.

Who this helps: compliance and risk owners, SRE/ops teams, and product managers responsible for live AI systems.

Set an alert: we'll notify you when monitoring or incident topics change. Or choose the weekly digest to get one Monday summary.

Practical start: write down what counts as an "incident" for you (clear examples), who triages it, and how you notify people. Pair that with a short "after-action" template. You'll be ready to map new EU guidance onto something you already use.`,
      topic: 'post-market-monitoring'
    },
    'transparency': {
      title: 'Transparency & User Information',
      description: 'Track AI Act updates on transparency requirements and user information duties.',
      content: `This page watches transparency and user information duties—what you tell people about the system, and when. It includes notices, labels, explanations, and opt-outs where relevant.

We'll post short items when guidance, examples, or delegated acts clarify what must be shown to users, what language to use, and when to display it. Each item links to the official source.

Who this helps: policy/comms leads, UX writers, product teams, and legal who draft user-facing text.

Set an alert: get a nudge when transparency material changes. Prefer low noise? Pick the weekly digest.

Practical start: keep a simple "transparency pack"—one page that lists what you tell users (in plain words), where it appears, and who owns it. When new guidance lands, you'll know exactly which line to update and who to ping.`,
      topic: 'transparency'
    },
    'risk-management': {
      title: 'Risk Management Framework',
      description: 'Track AI Act updates on risk management frameworks and mitigation strategies.',
      content: `This page tracks risk management for AI systems: spotting risks early, reducing them, and checking they stay under control.

You'll see brief notes when the EU publishes guidance, examples, or delegated acts about risk registers, testing, mitigations, and reviews. We link to the official source and keep summaries short.

Who this helps: risk owners, compliance teams, engineers, and product leaders who need a clear, shared picture of "what could go wrong" and "what we're doing about it."

Set an alert: we'll let you know when risk-framework updates appear. Or choose the weekly digest to get one summary each Monday.

Practical start: create a lightweight risk register—list your top risks, your mitigations, and a simple traffic-light status. When guidance changes, you'll update a single row instead of starting from scratch.`,
      topic: 'risk-management'
    }
  };

  return topics[slug as keyof typeof topics] || null;
}

export default async function TopicPage({ params }: TopicPageProps) {
  // Hard kill switch for EU Act Radar
  if (process.env.KILL_ACTRADAR === 'true') {
    notFound();
  }

  const { slug } = await params;
  const topicData = getTopicData(slug);
  
  if (!topicData) {
    notFound();
  }

  // Get pSEO data for the page
  const bundle = await getEARBundle();
  const limits = getPSEOLimits();
  const pseoEnabled = isPSEOEnabled();
  
  let topicItems: any[] = [];
  let shouldIndex = pseoEnabled;
  let generatedCopy = '';
  let jsonLd = null;
  
  if (bundle) {
    topicItems = bundle.items.filter(item => item.topic === slug);
    const itemsCount = topicItems.length;
    
    // Generate copy and check quality gates
    generatedCopy = copyForTopic(slug, topicItems);
    const { text: finalCopy, isThin } = ensureMinWords(generatedCopy, limits.minWords);
    const wordsCount = finalCopy.trim().split(/\s+/).length;
    
    shouldIndex = pseoEnabled && canIndex({
      minItems: limits.minItems,
      minWords: limits.minWords,
      wordsCount,
      itemsCount
    });
    
    // Generate JSON-LD if we pass quality gates
    if (shouldIndex) {
      const baseUrl = process.env.APP_URL || 'https://wheresmymep.eu';
      const topicDisplayName = getTopicDisplayName(slug);
      
      // Breadcrumb JSON-LD
      const breadcrumb = breadcrumbLd([
        { name: 'EU Act Radar', url: `${baseUrl}/ai-act` },
        { name: 'Topics', url: `${baseUrl}/ai-act/topics` },
        { name: topicDisplayName, url: `${baseUrl}/ai-act/topics/${slug}` }
      ]);
      
      // Collection JSON-LD
      const itemUrls = topicItems.map(item => item.link).filter(link => link && link !== '#');
      const collection = collectionLd(
        `${topicDisplayName} Updates`,
        `${baseUrl}/ai-act/topics/${slug}`,
        itemUrls
      );
      
      jsonLd = { breadcrumb, collection };
    }
  }

  return (
    <>
      {jsonLd && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.breadcrumb) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.collection) }}
          />
        </>
      )}
      <TopicPageClient 
        topicData={topicData} 
        topicItems={topicItems}
        generatedCopy={generatedCopy}
        shouldIndex={shouldIndex}
        bundle={bundle}
      />
    </>
  );
}