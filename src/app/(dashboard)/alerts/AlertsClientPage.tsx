'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Bell, Mail, Webhook } from 'lucide-react';

interface Alert {
  id: string;
  name: string;
  criteria: {
    type: 'attendance' | 'vote' | 'committee' | 'topic';
    threshold?: number;
    mepId?: string;
    country?: string;
    party?: string;
    committee?: string;
    topic?: string;
  };
  channel: 'email' | 'slack' | 'webhook';
  active: boolean;
  createdAt: string;
}

export default function AlertsClientPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'Low Attendance Alert',
      criteria: {
        type: 'attendance',
        threshold: 80,
        country: 'France',
      },
      channel: 'email',
      active: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Climate Vote Tracking',
      criteria: {
        type: 'topic',
        topic: 'climate-environment',
        party: 'Greens/EFA',
      },
      channel: 'slack',
      active: true,
      createdAt: '2024-01-10',
    },
  ]);

  const [newAlert, setNewAlert] = useState({
    name: '',
    type: 'attendance' as const,
    threshold: 80,
    country: '',
    party: '',
    committee: '',
    topic: '',
    channel: 'email' as const,
  });

  const handleCreateAlert = () => {
    const alert: Alert = {
      id: Date.now().toString(),
      name: newAlert.name,
      criteria: {
        type: newAlert.type,
        threshold: newAlert.type === 'attendance' ? newAlert.threshold : undefined,
        country: newAlert.country || undefined,
        party: newAlert.party || undefined,
        committee: newAlert.committee || undefined,
        topic: newAlert.topic || undefined,
      },
      channel: newAlert.channel,
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAlerts([...alerts, alert]);
    setNewAlert({
      name: '',
      type: 'attendance',
      threshold: 80,
      country: '',
      party: '',
      committee: '',
      topic: '',
      channel: 'email',
    });
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'slack':
        return <Bell className="h-4 w-4" />;
      case 'webhook':
        return <Webhook className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getCriteriaDescription = (criteria: Alert['criteria']) => {
    const parts = [];
    
    if (criteria.country) parts.push(`Country: ${criteria.country}`);
    if (criteria.party) parts.push(`Party: ${criteria.party}`);
    if (criteria.committee) parts.push(`Committee: ${criteria.committee}`);
    if (criteria.topic) parts.push(`Topic: ${criteria.topic}`);
    if (criteria.threshold) parts.push(`Threshold: ${criteria.threshold}%`);
    
    return parts.join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
              <p className="text-gray-600">Track MEP activity and get notified of important changes</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="alerts">My Alerts</TabsTrigger>
            <TabsTrigger value="create">Create Alert</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <div className="grid gap-6">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{alert.name}</CardTitle>
                        <Badge variant={alert.active ? 'default' : 'secondary'}>
                          {alert.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAlert(alert.id)}
                        >
                          {alert.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(alert.channel)}
                        <span className="text-sm text-gray-600">
                          {alert.channel.charAt(0).toUpperCase() + alert.channel.slice(1)} notifications
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Criteria:</strong> {getCriteriaDescription(alert.criteria)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(alert.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {alerts.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first alert to start tracking MEP activity
                    </p>
                    <Button>Create Alert</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Name
                  </label>
                  <Input
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    placeholder="e.g., Low Attendance Alert"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Type
                  </label>
                  <Select
                    value={newAlert.type}
                    onValueChange={(value: any) => setNewAlert({ ...newAlert, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">Attendance Tracking</SelectItem>
                      <SelectItem value="vote">Vote Tracking</SelectItem>
                      <SelectItem value="committee">Committee Activity</SelectItem>
                      <SelectItem value="topic">Policy Topic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newAlert.type === 'attendance' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attendance Threshold (%)
                    </label>
                    <Input
                      type="number"
                      value={newAlert.threshold}
                      onChange={(e) => setNewAlert({ ...newAlert, threshold: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country (optional)
                    </label>
                    <Select
                      value={newAlert.country}
                      onValueChange={(value) => setNewAlert({ ...newAlert, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Italy">Italy</SelectItem>
                        <SelectItem value="Spain">Spain</SelectItem>
                        <SelectItem value="Poland">Poland</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party (optional)
                    </label>
                    <Select
                      value={newAlert.party}
                      onValueChange={(value) => setNewAlert({ ...newAlert, party: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select party" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EPP">EPP</SelectItem>
                        <SelectItem value="S&D">S&D</SelectItem>
                        <SelectItem value="RE">RE</SelectItem>
                        <SelectItem value="ECR">ECR</SelectItem>
                        <SelectItem value="ID">ID</SelectItem>
                        <SelectItem value="GUE/NGL">GUE/NGL</SelectItem>
                        <SelectItem value="Greens/EFA">Greens/EFA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Channel
                  </label>
                  <Select
                    value={newAlert.channel}
                    onValueChange={(value: any) => setNewAlert({ ...newAlert, channel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateAlert} className="w-full">
                  Create Alert
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
