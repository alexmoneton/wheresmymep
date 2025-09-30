'use client';

import { useFlag } from '@/lib/useFlag';
import { resetFlagsToDefaults } from '@/lib/flags';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Bell, Download, FileText, Radar } from 'lucide-react';

export function PreviewPageClient() {
  const [alertsEnabled, setAlertsEnabled] = useFlag('alerts');
  const [csvEnabled, setCsvEnabled] = useFlag('csv');
  const [changesEnabled, setChangesEnabled] = useFlag('changes');
  const [actRadarEnabled, setActRadarEnabled] = useFlag('actradar');

  const handleTurnAllOn = () => {
    setAlertsEnabled(true);
    setCsvEnabled(true);
    setChangesEnabled(true);
    setActRadarEnabled(true);
  };

  const handleTurnAllOff = () => {
    setAlertsEnabled(false);
    setCsvEnabled(false);
    setChangesEnabled(false);
    setActRadarEnabled(false);
  };

  const handleResetToDefaults = () => {
    resetFlagsToDefaults();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Preview Features
          </h1>
          <p className="text-gray-600">
            Toggle preview features for Where&apos;s My MEP? These switches only affect your browser. 
            To make them global we&apos;ll use env vars later.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Alerts Feature */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Alerts</CardTitle>
              </div>
              <CardDescription>
                Create email alerts for MEP activity and voting patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alerts"
                  checked={alertsEnabled}
                  onCheckedChange={(checked) => setAlertsEnabled(checked as boolean)}
                />
                <label
                  htmlFor="alerts"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable alerts feature
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Shows &quot;Create alert&quot; buttons on MEP and committee pages
              </p>
            </CardContent>
          </Card>

          {/* CSV Export Feature */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">CSV Export</CardTitle>
              </div>
              <CardDescription>
                Export MEP data tables as CSV files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="csv"
                  checked={csvEnabled}
                  onCheckedChange={(checked) => setCsvEnabled(checked as boolean)}
                />
                <label
                  htmlFor="csv"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable CSV export
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Shows &quot;Export CSV&quot; buttons on MEP pages with data tables
              </p>
            </CardContent>
          </Card>

          {/* Changes Feature */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Changes</CardTitle>
              </div>
              <CardDescription>
                Weekly summary of new votes, agendas, and MEP updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="changes"
                  checked={changesEnabled}
                  onCheckedChange={(checked) => setChangesEnabled(checked as boolean)}
                />
                <label
                  htmlFor="changes"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable changes page
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Makes /changes page accessible with weekly updates
              </p>
            </CardContent>
          </Card>

          {/* Act Radar Feature */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Radar className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Act Radar</CardTitle>
              </div>
              <CardDescription>
                EU AI Act updates and compliance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="actradar"
                  checked={actRadarEnabled}
                  onCheckedChange={(checked) => setActRadarEnabled(checked as boolean)}
                />
                <label
                  htmlFor="actradar"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable Act Radar
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Shows AI Act tracking pages and compliance tools
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button onClick={handleTurnAllOn} variant="default">
            Turn all ON
          </Button>
          <Button onClick={handleTurnAllOff} variant="outline">
            Turn all OFF
          </Button>
          <Button onClick={handleResetToDefaults} variant="secondary">
            Reset to defaults
          </Button>
        </div>

        {/* Current Status */}
        <div className="mt-8 p-4 bg-white rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-2">Current Status</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${alertsEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Alerts: {alertsEnabled ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${csvEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>CSV Export: {csvEnabled ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${changesEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Changes: {changesEnabled ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${actRadarEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Act Radar: {actRadarEnabled ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}