'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { CreateAlertModal } from '@/components/CreateAlertModal';
import { ArrowLeft, Bell, FileText, Gavel, Shield, AlertCircle } from 'lucide-react';

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

export function WhatChangedClient() {
  const [changesData, setChangesData] = useState<ChangesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the sample data
    fetch('/data/ai-act/changes.sample.json')
      .then(response => response.json())
      .then(data => {
        setChangesData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load changes data:', error);
        setLoading(false);
      });
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guidance':
        return <FileText className="h-4 w-4" />;
      case 'delegated_act':
        return <Gavel className="h-4 w-4" />;
      case 'obligation':
        return <Shield className="h-4 w-4" />;
      case 'note':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

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

  const groupItemsByType = (items: ChangeItem[]) => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, ChangeItem[]>);

    // Sort items within each group by date (newest first)
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading changes...</p>
        </div>
      </div>
    );
  }

  if (!changesData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load changes data.</p>
        </div>
      </div>
    );
  }

  const groupedItems = groupItemsByType(changesData.items);

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
            
            <CreateAlertModal prefilledTopic="AI Act weekly changes">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            What changed this week
          </h1>
            <p className="text-lg text-gray-600">
              Here&apos;s a short list of AI Act updates from the last week. It covers new guidance, delegated acts, and notable clarifications that could affect your obligations. Prefer one bundle? Turn on the weekly digest alert and get this every Monday.
            </p>
        </div>

        {/* Week Info */}
        <div className="mb-8">
          <Badge variant="outline" className="text-sm">
            Week {changesData.week}
          </Badge>
        </div>

        {/* Grouped Items */}
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([type, items]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getTypeIcon(type)}
                  <span>{getTypeLabel(type)}s</span>
                  <Badge variant="secondary" className="ml-2">
                    {items.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {type === 'guidance' && 'Official guidance documents and best practices'}
                  {type === 'delegated_act' && 'Delegated acts and regulatory updates'}
                  {type === 'obligation' && 'Clarifications of provider duties and obligations'}
                  {type === 'note' && 'Important notes and clarifications'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 flex-1">{item.title}</h3>
                        <Badge className={`ml-3 ${getTypeColor(type)}`}>
                          {getTypeLabel(type)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{new Date(item.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                          <span>Topic: {item.topic}</span>
                        </div>
                        
                        <CreateAlertModal prefilledTopic={`AI Act ${item.topic}`}>
                          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800">
                            Set an alert for this topic
                          </Button>
                        </CreateAlertModal>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-12 bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Weekly Summary
          </h3>
          <p className="text-purple-700 mb-4">
            This week brought {changesData.items.length} updates across {Object.keys(groupedItems).length} categories. 
            The most active areas were {Object.entries(groupedItems)
              .sort(([,a], [,b]) => b.length - a.length)
              .slice(0, 2)
              .map(([type]) => getTypeLabel(type).toLowerCase())
              .join(' and ')}.
          </p>
          <CreateAlertModal prefilledTopic="AI Act weekly changes">
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
              Get weekly digest alerts
            </Button>
          </CreateAlertModal>
        </div>
      </main>
    </div>
  );
}