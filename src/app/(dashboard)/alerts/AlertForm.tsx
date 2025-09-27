'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertCriteria, AlertChannel } from '@/lib/alert-types';

interface AlertFormProps {
  alert?: Alert;
  onSubmit: (data: Omit<Alert, 'id' | 'userId' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function AlertForm({ alert, onSubmit, onCancel }: AlertFormProps) {
  const [formData, setFormData] = useState({
    name: alert?.name || '',
    description: alert?.description || '',
    criteria: alert?.criteria || {
      countries: [],
      parties: [],
      committees: [],
      topics: [],
      voteTypes: [],
      attendanceThreshold: undefined,
      attendanceDirection: 'below',
      keywords: [],
    } as AlertCriteria,
    channel: alert?.channel || {
      type: 'email',
      email: '',
    } as AlertChannel,
    frequency: alert?.frequency || 'immediate',
    active: alert?.active ?? true,
  });

  const [availableCountries, setAvailableCountries] = useState<Array<{code: string, name: string}>>([]);
  const [availableParties, setAvailableParties] = useState<Array<{name: string, abbreviation: string}>>([]);
  const [availableTopics, setAvailableTopics] = useState<Array<{slug: string, name: string}>>([]);

  useEffect(() => {
    // Fetch available options
    fetchAvailableOptions();
  }, []);

  const fetchAvailableOptions = async () => {
    try {
      // In a real app, these would be API calls
      // For now, we'll use static data
      setAvailableCountries([
        { code: 'AT', name: 'Austria' },
        { code: 'BE', name: 'Belgium' },
        { code: 'BG', name: 'Bulgaria' },
        { code: 'HR', name: 'Croatia' },
        { code: 'CY', name: 'Cyprus' },
        { code: 'CZ', name: 'Czechia' },
        { code: 'DK', name: 'Denmark' },
        { code: 'EE', name: 'Estonia' },
        { code: 'FI', name: 'Finland' },
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Germany' },
        { code: 'GR', name: 'Greece' },
        { code: 'HU', name: 'Hungary' },
        { code: 'IE', name: 'Ireland' },
        { code: 'IT', name: 'Italy' },
        { code: 'LV', name: 'Latvia' },
        { code: 'LT', name: 'Lithuania' },
        { code: 'LU', name: 'Luxembourg' },
        { code: 'MT', name: 'Malta' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'PL', name: 'Poland' },
        { code: 'PT', name: 'Portugal' },
        { code: 'RO', name: 'Romania' },
        { code: 'SK', name: 'Slovakia' },
        { code: 'SI', name: 'Slovenia' },
        { code: 'ES', name: 'Spain' },
        { code: 'SE', name: 'Sweden' },
      ]);

      setAvailableParties([
        { name: 'European People\'s Party (Christian Democrats)', abbreviation: 'EPP' },
        { name: 'Progressive Alliance of Socialists and Democrats', abbreviation: 'S&D' },
        { name: 'Renew Europe', abbreviation: 'RE' },
        { name: 'European Conservatives and Reformists', abbreviation: 'ECR' },
        { name: 'Identity and Democracy', abbreviation: 'ID' },
        { name: 'The Left', abbreviation: 'GUE/NGL' },
        { name: 'Greens/European Free Alliance', abbreviation: 'Greens/EFA' },
        { name: 'Non-attached Members', abbreviation: 'NI' },
      ]);

      setAvailableTopics([
        { slug: 'climate-environment', name: 'Climate & Environment' },
        { slug: 'energy', name: 'Energy' },
        { slug: 'migration-asylum', name: 'Migration & Asylum' },
        { slug: 'digital-technology', name: 'Digital & Technology' },
        { slug: 'trade-economy', name: 'Trade & Economy' },
        { slug: 'agriculture', name: 'Agriculture' },
        { slug: 'health', name: 'Health' },
        { slug: 'education-culture', name: 'Education & Culture' },
        { slug: 'transport', name: 'Transport' },
        { slug: 'defense-security', name: 'Defense & Security' },
        { slug: 'foreign-affairs', name: 'Foreign Affairs' },
        { slug: 'human-rights', name: 'Human Rights' },
        { slug: 'democracy-rule-of-law', name: 'Democracy & Rule of Law' },
        { slug: 'justice-home-affairs', name: 'Justice & Home Affairs' },
      ]);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateCriteria = (field: keyof AlertCriteria, value: any) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [field]: value,
      },
    }));
  };

  const updateChannel = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      channel: {
        ...prev.channel,
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          {alert ? 'Edit Alert' : 'Create New Alert'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Alert Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Climate Change Votes"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Optional description of what this alert monitors..."
          />
        </div>
      </div>

      {/* Criteria */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">Alert Criteria</h3>

        {/* Countries */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Countries
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {availableCountries.map(country => (
              <label key={country.code} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.criteria.countries?.includes(country.code) || false}
                  onChange={(e) => {
                    const countries = formData.criteria.countries || [];
                    if (e.target.checked) {
                      updateCriteria('countries', [...countries, country.code]);
                    } else {
                      updateCriteria('countries', countries.filter(c => c !== country.code));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">{country.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Parties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Political Groups
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {availableParties.map(party => (
              <label key={party.abbreviation} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.criteria.parties?.includes(party.abbreviation) || false}
                  onChange={(e) => {
                    const parties = formData.criteria.parties || [];
                    if (e.target.checked) {
                      updateCriteria('parties', [...parties, party.abbreviation]);
                    } else {
                      updateCriteria('parties', parties.filter(p => p !== party.abbreviation));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">{party.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topics
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {availableTopics.map(topic => (
              <label key={topic.slug} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.criteria.topics?.includes(topic.slug) || false}
                  onChange={(e) => {
                    const topics = formData.criteria.topics || [];
                    if (e.target.checked) {
                      updateCriteria('topics', [...topics, topic.slug]);
                    } else {
                      updateCriteria('topics', topics.filter(t => t !== topic.slug));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">{topic.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Vote Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vote Types
          </label>
          <div className="flex space-x-4">
            {['for', 'against', 'abstain', 'absent'].map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.criteria.voteTypes?.includes(type as any) || false}
                  onChange={(e) => {
                    const voteTypes = formData.criteria.voteTypes || [];
                    if (e.target.checked) {
                      updateCriteria('voteTypes', [...voteTypes, type as any]);
                    } else {
                      updateCriteria('voteTypes', voteTypes.filter(vt => vt !== type));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Attendance Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attendance Threshold
          </label>
          <div className="flex items-center space-x-4">
            <select
              value={formData.criteria.attendanceDirection || 'below'}
              onChange={(e) => updateCriteria('attendanceDirection', e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="below">Below</option>
              <option value="above">Above</option>
            </select>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.criteria.attendanceThreshold || ''}
              onChange={(e) => updateCriteria('attendanceThreshold', e.target.value ? parseInt(e.target.value) : undefined)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-20"
              placeholder="80"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>
      </div>

      {/* Notification Channel */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">Notification Channel</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Channel Type
          </label>
          <select
            value={formData.channel.type}
            onChange={(e) => {
              const type = e.target.value as 'email' | 'slack' | 'webhook';
              setFormData(prev => ({
                ...prev,
                channel: {
                  type,
                  ...(type === 'email' ? { email: '' } : 
                      type === 'slack' ? { webhookUrl: '', channel: '' } :
                      { url: '', headers: {} }),
                } as AlertChannel,
              }));
            }}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="email">Email</option>
            <option value="slack">Slack</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>

        {formData.channel.type === 'email' && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.channel.email || ''}
              onChange={(e) => updateChannel('email', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="your@email.com"
            />
          </div>
        )}

        {formData.channel.type === 'slack' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">
                Slack Webhook URL *
              </label>
              <input
                type="url"
                id="webhookUrl"
                required
                value={formData.channel.webhookUrl || ''}
                onChange={(e) => updateChannel('webhookUrl', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
                Channel (optional)
              </label>
              <input
                type="text"
                id="channel"
                value={formData.channel.channel || ''}
                onChange={(e) => updateChannel('channel', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="#alerts"
              />
            </div>
          </div>
        )}

        {formData.channel.type === 'webhook' && (
          <div>
            <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">
              Webhook URL *
            </label>
            <input
              type="url"
              id="webhookUrl"
              required
              value={formData.channel.url || ''}
              onChange={(e) => updateChannel('url', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://your-app.com/webhook"
            />
          </div>
        )}
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notification Frequency
        </label>
        <select
          value={formData.frequency}
          onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
          className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="immediate">Immediate</option>
          <option value="daily">Daily Summary</option>
          <option value="weekly">Weekly Summary</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {alert ? 'Update Alert' : 'Create Alert'}
        </button>
      </div>
    </form>
  );
}

