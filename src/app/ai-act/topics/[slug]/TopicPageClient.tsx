'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { CreateAlertModal } from '@/components/CreateAlertModal';
import { RelatedLinks } from '@/components/RelatedLinks';
import { ArrowLeft, Bell, FileText, AlertTriangle } from 'lucide-react';

interface ChangeItem {
  type: string;
  title: string;
  date: string;
  topic: string;
  link: string;
}

interface ChangesData {
  week: string;
  items: ChangeItem[];
}

interface TopicData {
  title: string;
  description: string;
  content: string;
  topic: string;
}

interface TopicPageClientProps {
  topicData: TopicData;
  topicItems?: ChangeItem[];
  generatedCopy?: string;
  shouldIndex?: boolean;
  bundle?: any;
}

export function TopicPageClient({ topicData, topicItems = [], generatedCopy, shouldIndex, bundle }: TopicPageClientProps) {
  const [recentChanges, setRecentChanges] = useState<ChangeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use server-provided data if available, otherwise fallback to client fetch
    if (topicItems.length > 0) {
      setRecentChanges(topicItems.slice(0, 5));
      setLoading(false);
    } else {
      // Fallback to client-side fetch
      fetch('/data/ai-act/changes.sample.json')
        .then(response => response.json())
        .then((data: ChangesData) => {
          const items = data.items.filter(item => item.topic === topicData.topic);
          setRecentChanges(items.slice(0, 5));
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to load changes data:', error);
          setLoading(false);
        });
    }
  }, [topicData.topic, topicItems]);


  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guidance':
        return 'bg-blue-100 text-blue-800';
      case 'delegated_act':
        return 'bg-green-100 text-green-800';
      case 'obligation':
        return 'bg-purple-100 text-purple-800';
      case 'note':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'guidance':
        return 'Guidance';
      case 'delegated_act':
        return 'Delegated Act';
      case 'obligation':
        return 'Obligation';
      case 'note':
        return 'Note';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/ai-act" className="text-purple-600 hover:text-purple-800 flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Act Radar</span>
            </Link>
            
            <CreateAlertModal prefilledTopic={`AI Act ${topicData.topic}`}>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Set an alert</span>
              </Button>
            </CreateAlertModal>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              AI Act — {topicData.title}
            </h1>
            {!shouldIndex && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                pSEO (off)
              </Badge>
            )}
          </div>
          <p className="text-lg text-gray-600">
            {topicData.description}
          </p>
          
          {/* Generated copy if available */}
          {generatedCopy && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Latest Updates</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {generatedCopy}
              </p>
            </div>
          )}
          
          {/* Last updated info */}
          {bundle && (
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {bundle.generatedAt ? new Date(bundle.generatedAt).toLocaleDateString() : 'Recently'}
              {bundle.sources && bundle.sources.length > 0 && (
                <span className="ml-2">
                  • Sources: {bundle.sources.join(', ')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none text-gray-700">
                  {topicData.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Set Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <span>Stay Updated</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Get notified when new updates are published for this topic.
                </p>
                <CreateAlertModal prefilledTopic={`AI Act ${topicData.topic}`}>
                  <Button className="w-full flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Set an alert</span>
                  </Button>
                </CreateAlertModal>
              </CardContent>
            </Card>

            {/* Recent Changes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Recent Changes</span>
                </CardTitle>
                <CardDescription>
                  Latest updates for this topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading...</p>
                  </div>
                ) : recentChanges.length > 0 ? (
                  <div className="space-y-3">
                    {recentChanges.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1">
                            {item.title}
                          </h4>
                          <Badge className={`ml-2 text-xs ${getTypeColor(item.type)}`}>
                            {getTypeLabel(item.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Link href="/ai-act/what-changed" className="text-sm text-purple-600 hover:text-purple-800">
                        View all changes →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent changes for this topic.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Related Topics */}
            <Card>
              <CardHeader>
                <CardTitle>Related Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/ai-act/topics/risk-management" className="block text-sm text-purple-600 hover:text-purple-800">
                    Risk Management Framework
                  </Link>
                  <Link href="/ai-act/topics/transparency" className="block text-sm text-purple-600 hover:text-purple-800">
                    Transparency & User Information
                  </Link>
                  <Link href="/ai-act/topics/dataset-governance" className="block text-sm text-purple-600 hover:text-purple-800">
                    Dataset Governance
                  </Link>
                  <Link href="/ai-act/topics/post-market-monitoring" className="block text-sm text-purple-600 hover:text-purple-800">
                    Post-Market Monitoring
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Related Links */}
        <RelatedLinks 
          context="topic" 
          data={{ 
            topic: topicData.topic,
            topTopics: bundle ? [...new Set(bundle.items.map((item: any) => item.topic))].slice(0, 3) : []
          }} 
        />
      </main>
    </div>
  );
}