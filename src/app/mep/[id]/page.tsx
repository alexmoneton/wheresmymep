'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CountryFlag from '@/components/CountryFlag';
import PartyBadge from '@/components/PartyBadge';
import SpecialRoleBadge from '@/components/SpecialRoleBadge';
import { useFlag } from '@/lib/useFlag';
import { CreateAlertModal } from '@/components/CreateAlertModal';
import { ExportCSVButton } from '@/components/ExportCSVButton';
import { WatchMEPButton } from '@/components/WatchMEPButton';
import { Bell, Download, ExternalLink, AlertTriangle, DollarSign, Calendar, Building, Gift, FileText } from 'lucide-react';
import { WhoFundsData } from '@/lib/zod/whofunds';

interface MEP {
  mep_id: string | null;
  name: string;
  country: string;
  party: string;
  national_party: string;
  profile_url?: string;
  photo_url?: string;
  votes_total_period?: number;
  votes_cast?: number;
  attendance_pct?: number;
  partial_term?: boolean;
  special_role?: string;
  sick_leave?: boolean;
}

interface NotableVote {
  mep_id: string;
  vote_id: string;
  vote_date: string;
  title: string;
  result?: string;
  vote_position: 'For' | 'Against' | 'Abstain' | 'Not voting';
  total_for?: number;
  total_against?: number;
  total_abstain?: number;
  source_url: string;
}


export default function MEPProfilePage() {
  const params = useParams();
  const mepId = params.id as string;
  
  const [mep, setMep] = useState<MEP | null>(null);
  const [notableVotes, setNotableVotes] = useState<NotableVote[]>([]);
  const [whoFundsData, setWhoFundsData] = useState<WhoFundsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllEntries, setShowAllEntries] = useState(false);
  
  // Feature flags
  const [alertsEnabled] = useFlag('alerts');
  const [csvEnabled] = useFlag('csv');

  const fetchMEPData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [mepResponse, votesResponse, whoFundsResponse] = await Promise.all([
        fetch(`/api/meps/${mepId}`),
        fetch(`/api/meps/${mepId}/notable`),
        fetch(`/api/whofunds/${mepId}`)
      ]);

      if (!mepResponse.ok) {
        throw new Error('MEP not found');
      }

      const mepData = await mepResponse.json();
      const votesData = await votesResponse.json();
      
      setMep(mepData);
      setNotableVotes(votesData);
      
      // Only set WhoFunds data if the response is successful
      if (whoFundsResponse.ok) {
        const whoFundsData = await whoFundsResponse.json();
        setWhoFundsData(whoFundsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MEP data');
    } finally {
      setLoading(false);
    }
  }, [mepId]);

  useEffect(() => {
    if (mepId) {
      fetchMEPData();
    }
  }, [mepId, fetchMEPData]);

  const getVotePositionColor = (position: string) => {
    switch (position) {
      case 'For':
        return 'bg-green-100 text-green-800';
      case 'Against':
        return 'bg-red-100 text-red-800';
      case 'Abstain':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not voting':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MEP profile...</p>
        </div>
      </div>
    );
  }

  if (error || !mep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">MEP Not Found</h1>
            <p className="text-gray-600 mb-6">
              The MEP you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* MEP Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Photo placeholder */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">
                {mep.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{mep.name}</h1>
                <CountryFlag country={mep.country} className="text-2xl" />
                {mep.special_role && (
                  <SpecialRoleBadge role={mep.special_role} className="text-sm" />
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <PartyBadge party={mep.party} className="text-sm" />
                {mep.national_party && mep.national_party !== 'nan' && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {mep.national_party}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Country: {mep.country}</span>
                {mep.partial_term && (
                  <span className="text-orange-600">• Partial term</span>
                )}
              </div>
            </div>
            
            {/* Sprout: Create Alert Button */}
            {alertsEnabled && (
              <div className="mt-4 md:mt-0">
                <CreateAlertModal prefilledTopic={`MEP: ${mep.name}`}>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                    <Bell className="h-4 w-4" />
                    <span>Create alert</span>
                  </button>
                </CreateAlertModal>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {mep.special_role ? 'N/A' : mep.sick_leave ? 'N/A' : (mep.attendance_pct !== undefined ? `${mep.attendance_pct}%` : 'N/A')}
              </div>
              <div className="text-sm text-gray-600">
                {mep.special_role ? 'Doesn\'t usually vote' : mep.sick_leave ? 'On leave' : 'Overall Attendance'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {mep.votes_cast || 0}
              </div>
              <div className="text-sm text-gray-600">Votes Cast</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-600 mb-2">
                {mep.votes_total_period || 0}
              </div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </div>
          </div>
          
          {mep.sick_leave && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
              <p className="text-purple-800 text-sm">
                {(mep.name === 'Delara Burkhardt' || mep.name === 'Sigrid Friis Frederiksen') ? (
                  <>
                    <strong>Maternity Leave:</strong> This MEP is or has recently been on maternity leave. 
                    Their attendance data may reflect this period and should not be considered representative of their normal performance.
                  </>
                ) : (
                  <>
                    <strong>Medical Leave:</strong> This MEP is or has recently been on medical leave. 
                    Their attendance data may reflect this period and should not be considered representative of their normal performance.
                  </>
                )}
              </p>
            </div>
          )}
          
          {!mep.mep_id && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-orange-800 text-sm">
                <strong>New MEP:</strong> This MEP recently started their term and doesn&apos;t have attendance data yet. 
                Their attendance will be calculated once they participate in votes.
              </p>
            </div>
          )}
          
          {mep.mep_id && mep.votes_total_period === 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                No data available for this period. This MEP may have started their term recently 
                or the data may not be available yet.
              </p>
            </div>
          )}
          
          {mep.mep_id && mep.partial_term && mep.votes_total_period && mep.votes_total_period > 0 && mep.votes_cast === 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                <strong>New MEP:</strong> This MEP recently started their term and hasn&apos;t had a chance to vote yet. 
                Their attendance will be calculated once they participate in votes.
              </p>
            </div>
          )}
          
          {mep.mep_id && mep.partial_term && mep.votes_total_period && mep.votes_total_period > 0 && mep.votes_cast && mep.votes_cast > 0 && mep.votes_total_period <= 100 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                <strong>Limited term:</strong> This MEP has only been in office for a short time. 
                Their attendance percentage may not be representative of their full term performance.
              </p>
            </div>
          )}
        </div>

        {/* Funding & Interests */}
        {whoFundsData && (
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Funding & Interests</h2>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                  {whoFundsData.income_and_interests.length + whoFundsData.gifts_travel.length} entries
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Income and Interests */}
              {whoFundsData.income_and_interests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Income & Interests
                  </h3>
                  <div className="space-y-3">
                    {whoFundsData.income_and_interests.slice(0, showAllEntries ? whoFundsData.income_and_interests.length : 5).map((income, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">{income.entity_name}</span>
                              <span className={`px-2 py-1 text-xs rounded font-medium ${
                                income.category === 'board_membership' ? 'bg-purple-100 text-purple-800' :
                                income.category === 'outside_activity' ? 'bg-blue-100 text-blue-800' :
                                income.category === 'consultancy' ? 'bg-green-100 text-green-800' :
                                income.category === 'teaching' ? 'bg-orange-100 text-orange-800' :
                                income.category === 'ownership' ? 'bg-yellow-100 text-yellow-800' :
                                income.category === 'honoraria' ? 'bg-pink-100 text-pink-800' :
                                income.category === 'writing' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {income.category.replace('_', ' ')}
                              </span>
                              {income.notes && income.notes.toLowerCase().includes('unpaid') && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border">
                                  💰 Unpaid
                                </span>
                              )}
                            </div>
                            {income.role && (
                              <div className="text-sm text-gray-600 mb-1">{income.role}</div>
                            )}
                            {(income.amount_eur_min || income.amount_eur_max) ? (
                              <div className="text-sm font-medium text-green-600">
                                €{income.amount_eur_min?.toLocaleString() || '0'}
                                {income.amount_eur_max && income.amount_eur_max !== income.amount_eur_min && 
                                  ` - €${income.amount_eur_max.toLocaleString()}`
                                }
                                {income.period && ` ${income.period}`}
                              </div>
                            ) : null}
                            {income.notes && !income.notes.toLowerCase().includes('unpaid') && (
                              <div className="text-sm text-gray-500 mt-1">{income.notes}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {whoFundsData.income_and_interests.length > 5 && !showAllEntries && (
                      <div className="text-center">
                        <button 
                          onClick={() => setShowAllEntries(true)}
                          className="text-blue-600 hover:text-blue-800 text-sm underline cursor-pointer"
                        >
                          View all {whoFundsData.income_and_interests.length} entries
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gifts and Travel */}
              {whoFundsData.gifts_travel.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Gifts & Travel
                  </h3>
                  <div className="space-y-3">
                    {whoFundsData.gifts_travel.slice(0, 3).map((gift, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">{gift.item}</div>
                            <div className="text-sm text-gray-600 mb-1">from {gift.sponsor}</div>
                            {gift.value_eur && (
                              <div className="text-sm font-medium text-green-600">
                                €{gift.value_eur.toLocaleString()}
                              </div>
                            )}
                            {gift.date && (
                              <div className="text-sm text-gray-500 mt-1">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(gift.date).toLocaleDateString()}
                              </div>
                            )}
                            {gift.notes && (
                              <div className="text-sm text-gray-500 mt-1">{gift.notes}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {whoFundsData.gifts_travel.length > 3 && (
                      <div className="text-center">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View all {whoFundsData.gifts_travel.length} entries
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No data message */}
              {whoFundsData.income_and_interests.length === 0 && whoFundsData.gifts_travel.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No outside income or interests declared</p>
                </div>
              )}

              {/* Last Updated & Sources */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(whoFundsData.last_updated_utc).toLocaleDateString()}
                  </span>
                  <a
                    href={whoFundsData.sources.declaration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View declaration
                  </a>
                </div>
                
                {whoFundsData.data_quality.issues && whoFundsData.data_quality.issues.length > 0 && (
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>Source information:</strong>
                      <ul className="mt-1 list-disc list-inside">
                        {whoFundsData.data_quality.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Alert Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Existing WMM Alert Button */}
                  {alertsEnabled && (
                    <CreateAlertModal prefilledTopic="Funding & Interests">
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex-1">
                        <Bell className="h-4 w-4" />
                        <span>Set WMM Alert</span>
                      </button>
                    </CreateAlertModal>
                  )}
                  
                  {/* New WhoFunds Watch Button */}
                  <WatchMEPButton 
                    mepId={mepId} 
                    mepName={mep?.name || 'Unknown MEP'}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Links */}
        {(mep.profile_url || mep.photo_url) && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
            <div className="space-y-2">
              {mep.profile_url && (
                <a
                  href={mep.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-2">🔗</span>
                  Official European Parliament Profile
                </a>
              )}
              {mep.photo_url && (
                <a
                  href={mep.photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-2">📷</span>
                  Photo Credit
                </a>
              )}
            </div>
          </div>
        )}

        {/* Notable Votes */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Notable Votes</h2>
            
            {/* Sprout: Export CSV Button */}
            {csvEnabled && notableVotes.length > 0 && (
              <ExportCSVButton selector="#votes-table" filename={`mep-${mep.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`} />
            )}
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Multiple votes on the same topic are normal - the European Parliament votes on amendments and different versions of proposals separately, which is why you may see several votes with different results for similar topics.
            </p>
          </div>
          
          {!mep.mep_id ? (
            <div className="text-center py-8">
              <p className="text-gray-500">This MEP doesn&apos;t have voting data yet as they recently started their term.</p>
            </div>
          ) : notableVotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No notable votes found for this MEP.</p>
            </div>
          ) : (
            <div className="space-y-4" id="votes-table" data-exportable="true">
              {notableVotes.map((vote) => (
                <div key={vote.vote_id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {vote.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>{formatDate(vote.vote_date)}</span>
                        {vote.result && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            vote.result.toLowerCase() === 'adopted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {vote.result}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVotePositionColor(vote.vote_position)}`}>
                        {vote.vote_position}
                      </span>
                    </div>
                  </div>
                  
                  {(vote.total_for || vote.total_against || vote.total_abstain) && (
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      {vote.total_for && <span>For: {vote.total_for}</span>}
                      {vote.total_against && <span>Against: {vote.total_against}</span>}
                      {vote.total_abstain && <span>Abstain: {vote.total_abstain}</span>}
                    </div>
                  )}
                  
                  <a
                    href={vote.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View official vote record →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Methodology */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Methodology
          </h3>
          <p className="text-sm text-blue-800">
            Attendance is calculated based on roll-call votes in plenary sessions of the European Parliament over the last 180 days. 
            Committee votes are excluded. Abstaining counts as present; not voting counts as absent. Notable votes are selected based on 
            significance, close outcomes, and high participation. Some MEPs may have partial terms affecting 
            their attendance percentage.
          </p>
          {mep.special_role === 'Vice-President' && (
            <p className="text-sm text-blue-800 mt-2">
              <strong>Note:</strong> Vice-Presidents of the European Parliament do not vote when chairing sessions, 
              which may affect their attendance percentage.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}