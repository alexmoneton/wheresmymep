'use client';

import { Alert } from '@/lib/alert-types';

interface AlertCardProps {
  alert: Alert;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (active: boolean) => void;
}

export default function AlertCard({ alert, onEdit, onDelete, onToggle }: AlertCardProps) {
  const formatCriteria = (criteria: any) => {
    const parts = [];
    
    if (criteria.countries && criteria.countries.length > 0) {
      parts.push(`${criteria.countries.length} countr${criteria.countries.length === 1 ? 'y' : 'ies'}`);
    }
    
    if (criteria.parties && criteria.parties.length > 0) {
      parts.push(`${criteria.parties.length} political group${criteria.parties.length === 1 ? '' : 's'}`);
    }
    
    if (criteria.topics && criteria.topics.length > 0) {
      parts.push(`${criteria.topics.length} topic${criteria.topics.length === 1 ? '' : 's'}`);
    }
    
    if (criteria.voteTypes && criteria.voteTypes.length > 0) {
      parts.push(`vote types: ${criteria.voteTypes.join(', ')}`);
    }
    
    if (criteria.attendanceThreshold !== undefined) {
      parts.push(`attendance ${criteria.attendanceDirection} ${criteria.attendanceThreshold}%`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No specific criteria';
  };

  const getChannelDisplay = (channel: any) => {
    switch (channel.type) {
      case 'email':
        return `📧 ${channel.email}`;
      case 'slack':
        return `💬 Slack${channel.channel ? ` (#${channel.channel})` : ''}`;
      case 'webhook':
        return `🔗 Webhook`;
      default:
        return 'Unknown channel';
    }
  };

  const getFrequencyDisplay = (frequency: string) => {
    switch (frequency) {
      case 'immediate':
        return '⚡ Immediate';
      case 'daily':
        return '📅 Daily';
      case 'weekly':
        return '📆 Weekly';
      default:
        return frequency;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${alert.active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'}`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium text-gray-900">{alert.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                alert.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {alert.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {alert.description && (
              <p className="mt-1 text-sm text-gray-600">{alert.description}</p>
            )}
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium mr-2">Criteria:</span>
                <span>{formatCriteria(alert.criteria)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium mr-2">Channel:</span>
                <span>{getChannelDisplay(alert.channel)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium mr-2">Frequency:</span>
                <span>{getFrequencyDisplay(alert.frequency)}</span>
              </div>
              
              {alert.lastTriggered && (
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Last triggered:</span>
                  <span>{new Date(alert.lastTriggered).toLocaleString()}</span>
                </div>
              )}
              
              {alert.createdAt && (
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Created:</span>
                  <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onToggle(!alert.active)}
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded ${
                alert.active
                  ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  : 'text-white bg-green-600 hover:bg-green-700'
              }`}
            >
              {alert.active ? 'Disable' : 'Enable'}
            </button>
            
            <button
              onClick={onEdit}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit
            </button>
            
            <button
              onClick={onDelete}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

