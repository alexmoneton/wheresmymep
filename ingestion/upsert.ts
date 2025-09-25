import { PrismaClient } from '@prisma/client';
import { MEPIdentity, MEPAttendance, VoteCatalog, NotableVote } from './normalize';

const prisma = new PrismaClient();

export async function upsertCountry(name: string, code: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return await prisma.country.upsert({
    where: { code },
    update: { name, slug },
    create: { name, code, slug },
  });
}

export async function upsertParty(name: string, abbreviation: string | null, euGroup: string | null, countryId: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return await prisma.party.upsert({
    where: { slug },
    update: { name, abbreviation, euGroup, countryId },
    create: { name, abbreviation, euGroup, countryId, slug },
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
  
  // Find or create country
  const country = await upsertCountry(mepData.country, mepData.country.substring(0, 2).toUpperCase());
  
  // Find or create party
  let party = null;
  if (mepData.party) {
    party = await upsertParty(mepData.party, null, null, country.id);
  }
  
  return await prisma.mEP.upsert({
    where: { epId: mepData.mep_id },
    update: {
      firstName,
      lastName,
      slug,
      photoUrl: mepData.photo_url,
      countryId: country.id,
      partyId: party?.id,
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
