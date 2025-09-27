import { PrismaClient } from '@prisma/client';
import { MEPIdentity, MEPAttendance, VoteCatalog, NotableVote } from './normalize';

const prisma = new PrismaClient();

export async function upsertCountry(name: string, code: string) {
  // Use country code as slug to avoid conflicts
  const slug = code.toLowerCase();
  
  return await prisma.country.upsert({
    where: { code },
    update: { name, slug },
    create: { name, code, slug },
  });
}

export async function upsertParty(name: string, abbreviation: string | null, euGroup: string | null, countryId: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // For EU political groups, we don't need country association
  // They are pan-European groups
  return await prisma.party.upsert({
    where: { slug },
    update: { name, abbreviation, euGroup, countryId: null }, // EU groups are not country-specific
    create: { name, abbreviation, euGroup, countryId: null, slug }, // EU groups are not country-specific
  });
}

export async function upsertCommittee(code: string, name: string, description?: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return await prisma.committee.upsert({
    where: { code },
    update: { name, slug, description },
    create: { code, name, slug, description },
  });
}

export async function upsertMEP(mepData: MEPIdentity & Partial<MEPAttendance>) {
  const { firstName, lastName } = {
    firstName: mepData.name.split(' ')[0],
    lastName: mepData.name.split(' ').slice(1).join(' ')
  };
  
  const slug = mepData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Map country name to country code
  const countryCodeMap: Record<string, string> = {
    'Austria': 'AT',
    'Belgium': 'BE', 
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Cyprus': 'CY',
    'Czechia': 'CZ',
    'Czech Republic': 'CZ',
    'Denmark': 'DK',
    'Kingdom of Denmark': 'DK',
    'Estonia': 'EE',
    'Finland': 'FI',
    'France': 'FR',
    'Germany': 'DE',
    'German Democratic Republic': 'DE',
    'Greece': 'GR',
    'Hungary': 'HU',
    'Ireland': 'IE',
    'Italy': 'IT',
    'Latvia': 'LV',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Malta': 'MT',
    'Netherlands': 'NL',
    'Kingdom of the Netherlands': 'NL',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Romania': 'RO',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Spain': 'ES',
    'Sweden': 'SE',
  };
  
  const countryCode = countryCodeMap[mepData.country] || mepData.country.substring(0, 2).toUpperCase();
  
  // Map country name to display name
  const countryDisplayMap: Record<string, string> = {
    'Kingdom of the Netherlands': 'Netherlands',
    'Kingdom of Denmark': 'Denmark',
    'German Democratic Republic': 'Germany',
    'Czech Republic': 'Czech Republic',
  };
  
  const displayName = countryDisplayMap[mepData.country] || mepData.country;
  
  // Find or create country
  const country = await upsertCountry(displayName, countryCode);
  
  // Map EU political groups to parties
  const euGroupMap: Record<string, { name: string; abbreviation: string }> = {
    'European People\'s Party (Christian Democrats)': { name: 'European People\'s Party (Christian Democrats)', abbreviation: 'EPP' },
    'Progressive Alliance of Socialists and Democrats': { name: 'Progressive Alliance of Socialists and Democrats', abbreviation: 'S&D' },
    'Renew Europe Group': { name: 'Renew Europe', abbreviation: 'RE' },
    'European Conservatives and Reformists Group': { name: 'European Conservatives and Reformists', abbreviation: 'ECR' },
    'Identity and Democracy Group': { name: 'Identity and Democracy', abbreviation: 'ID' },
    'The Left group in the European Parliament - GUE/NGL': { name: 'The Left', abbreviation: 'GUE/NGL' },
    'Group of the Greens/European Free Alliance': { name: 'Greens/European Free Alliance', abbreviation: 'Greens/EFA' },
    'Non-attached Members': { name: 'Non-attached Members', abbreviation: 'NI' },
  };
  
  // Find or create party
  let party = null;
  if (mepData.party) {
    const partyInfo = euGroupMap[mepData.party] || { name: mepData.party, abbreviation: null };
    party = await upsertParty(partyInfo.name, partyInfo.abbreviation, partyInfo.abbreviation, '');
  }
  
  // Calculate attendance percentage
  const attendancePct = mepData.votes_total_period && mepData.votes_cast 
    ? Math.round((mepData.votes_cast / mepData.votes_total_period) * 100)
    : null;
  
  return await prisma.mEP.upsert({
    where: { epId: mepData.mep_id },
    update: {
      firstName,
      lastName,
      slug,
      photoUrl: mepData.photo_url,
      countryId: country.id,
      partyId: party?.id,
      attendancePct,
      votesCast: mepData.votes_cast || 0,
      votesTotal: mepData.votes_total_period || 0,
      twitter: null, // Will be populated separately
      website: null, // Will be populated separately
      email: null, // Will be populated separately
      active: true,
    },
    create: {
      epId: mepData.mep_id,
      firstName,
      lastName,
      slug,
      photoUrl: mepData.photo_url,
      countryId: country.id,
      partyId: party?.id,
      attendancePct,
      votesCast: mepData.votes_cast || 0,
      votesTotal: mepData.votes_total_period || 0,
      active: true,
    },
  });
}

// New function to handle MEPs without official EP IDs
export async function upsertMEPWithoutID(mepData: { name: string; country: string; party?: string; photo_url?: string }) {
  const { firstName, lastName } = {
    firstName: mepData.name.split(' ')[0],
    lastName: mepData.name.split(' ').slice(1).join(' ')
  };
  
  const slug = mepData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Map country name to country code
  const countryCodeMap: Record<string, string> = {
    'Austria': 'AT',
    'Belgium': 'BE', 
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Cyprus': 'CY',
    'Czechia': 'CZ',
    'Denmark': 'DK',
    'Estonia': 'EE',
    'Finland': 'FI',
    'France': 'FR',
    'Germany': 'DE',
    'Greece': 'GR',
    'Hungary': 'HU',
    'Ireland': 'IE',
    'Italy': 'IT',
    'Latvia': 'LV',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Malta': 'MT',
    'Netherlands': 'NL',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Romania': 'RO',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Spain': 'ES',
    'Sweden': 'SE',
  };
  
  const countryCode = countryCodeMap[mepData.country] || mepData.country.substring(0, 2).toUpperCase();
  
  // Map country name to display name
  const countryDisplayMap: Record<string, string> = {
    'Kingdom of the Netherlands': 'Netherlands',
    'Kingdom of Denmark': 'Denmark',
    'German Democratic Republic': 'Germany',
    'Czech Republic': 'Czech Republic',
  };
  
  const displayName = countryDisplayMap[mepData.country] || mepData.country;
  
  // Find or create country
  const country = await upsertCountry(displayName, countryCode);
  
  // Map EU political groups to parties
  const euGroupMap: Record<string, { name: string; abbreviation: string }> = {
    'European People\'s Party (Christian Democrats)': { name: 'European People\'s Party (Christian Democrats)', abbreviation: 'EPP' },
    'Progressive Alliance of Socialists and Democrats': { name: 'Progressive Alliance of Socialists and Democrats', abbreviation: 'S&D' },
    'Renew Europe Group': { name: 'Renew Europe', abbreviation: 'RE' },
    'European Conservatives and Reformists Group': { name: 'European Conservatives and Reformists', abbreviation: 'ECR' },
    'Identity and Democracy Group': { name: 'Identity and Democracy', abbreviation: 'ID' },
    'The Left group in the European Parliament - GUE/NGL': { name: 'The Left', abbreviation: 'GUE/NGL' },
    'Group of the Greens/European Free Alliance': { name: 'Greens/European Free Alliance', abbreviation: 'Greens/EFA' },
    'Non-attached Members': { name: 'Non-attached Members', abbreviation: 'NI' },
  };
  
  // Find or create party
  let party = null;
  if (mepData.party) {
    const partyInfo = euGroupMap[mepData.party] || { name: mepData.party, abbreviation: null };
    party = await upsertParty(partyInfo.name, partyInfo.abbreviation, partyInfo.abbreviation, '');
  }
  
  // Generate a temporary ID for MEPs without official EP IDs
  const tempId = `temp_${slug}_${Date.now()}`;
  
  return await prisma.mEP.upsert({
    where: { slug },
    update: {
      firstName,
      lastName,
      slug,
      photoUrl: mepData.photo_url,
      countryId: country.id,
      partyId: party?.id,
      attendancePct: null, // No attendance data available
      votesCast: 0,
      votesTotal: 0,
      twitter: null,
      website: null,
      email: null,
      active: true,
    },
    create: {
      epId: tempId,
      firstName,
      lastName,
      slug,
      photoUrl: mepData.photo_url,
      countryId: country.id,
      partyId: party?.id,
      attendancePct: null, // No attendance data available
      votesCast: 0,
      votesTotal: 0,
      active: true,
    },
  });
}

export async function upsertDossier(code: string | null, title: string, summary?: string, policyAreas: string[] = []) {
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return await prisma.dossier.upsert({
    where: { slug },
    update: { code, title, summary, policyAreas },
    create: { code, title, slug, summary, policyAreas },
  });
}

export async function upsertVote(voteData: VoteCatalog, dossierId?: string) {
  return await prisma.vote.upsert({
    where: { epVoteId: voteData.vote_id },
    update: {
      date: new Date(voteData.vote_date),
      dossierId,
      title: voteData.title,
      description: voteData.result,
    },
    create: {
      epVoteId: voteData.vote_id,
      date: new Date(voteData.vote_date),
      dossierId,
      title: voteData.title,
      description: voteData.result,
    },
  });
}

export async function upsertMEPVote(mepId: string, voteId: string, choice: 'for' | 'against' | 'abstain' | 'absent') {
  return await prisma.mEPVote.upsert({
    where: {
      mepId_voteId: {
        mepId,
        voteId,
      },
    },
    update: { choice },
    create: {
      mepId,
      voteId,
      choice,
    },
  });
}

export async function upsertAttendance(mepId: string, date: Date, present: boolean, sessionType?: string) {
  return await prisma.attendance.upsert({
    where: {
      mepId_date: {
        mepId,
        date,
      },
    },
    update: { present, sessionType },
    create: {
      mepId,
      date,
      present,
      sessionType,
    },
  });
}

export async function upsertTopic(slug: string, name: string, description?: string) {
  return await prisma.topic.upsert({
    where: { slug },
    update: { name, description },
    create: { slug, name, description },
  });
}

export async function upsertTag(slug: string, name: string) {
  return await prisma.tag.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
  });
}

export async function connectDossierTag(dossierId: string, tagId: string) {
  return await prisma.dossierTag.upsert({
    where: {
      dossierId_tagId: {
        dossierId,
        tagId,
      },
    },
    update: {},
    create: {
      dossierId,
      tagId,
    },
  });
}

export async function upsertMembership(mepId: string, committeeId: string, role: 'member' | 'substitute' | 'chair' | 'vicechair') {
  return await prisma.membership.upsert({
    where: {
      mepId_committeeId: {
        mepId,
        committeeId,
      },
    },
    update: { role },
    create: {
      mepId,
      committeeId,
      role,
    },
  });
}

// Batch operations for better performance
export async function batchUpsertMEPs(meps: (MEPIdentity & Partial<MEPAttendance>)[]) {
  const results = [];
  for (const mep of meps) {
    try {
      const result = await upsertMEP(mep);
      results.push(result);
    } catch (error) {
      console.error(`Error upserting MEP ${mep.mep_id}:`, error);
    }
  }
  return results;
}

export async function batchUpsertMEPsWithoutID(meps: { name: string; country: string; party?: string; photo_url?: string }[]) {
  const results = [];
  for (const mep of meps) {
    try {
      const result = await upsertMEPWithoutID(mep);
      results.push(result);
    } catch (error) {
      console.error(`Error upserting MEP without ID ${mep.name}:`, error);
    }
  }
  return results;
}

export async function batchUpsertVotes(votes: VoteCatalog[]) {
  const results = [];
  for (const vote of votes) {
    try {
      const result = await upsertVote(vote);
      results.push(result);
    } catch (error) {
      console.error(`Error upserting vote ${vote.vote_id}:`, error);
    }
  }
  return results;
}

export async function batchUpsertMEPVotes(mepVotes: NotableVote[]) {
  const results = [];
  for (const mepVote of mepVotes) {
    try {
      // Find the MEP and vote IDs
      const mep = await prisma.mEP.findUnique({ where: { epId: mepVote.mep_id } });
      const vote = await prisma.vote.findUnique({ where: { epVoteId: mepVote.vote_id } });
      
      if (mep && vote) {
        const choice = mepVote.vote_position.toLowerCase() as 'for' | 'against' | 'abstain' | 'absent';
        const result = await upsertMEPVote(mep.id, vote.id, choice);
        results.push(result);
      }
    } catch (error) {
      console.error(`Error upserting MEP vote ${mepVote.mep_id}-${mepVote.vote_id}:`, error);
    }
  }
  return results;
}
