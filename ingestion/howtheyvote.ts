import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { MEPIdentity, MEPAttendance, VoteCatalog, NotableVote, MEPIdentitySchema, MEPAttendanceSchema, VoteCatalogSchema, NotableVoteSchema } from './normalize';

export interface HowTheyVoteData {
  meps: MEPIdentity[];
  attendance: MEPAttendance[];
  votes: VoteCatalog[];
  notableVotes: NotableVote[];
}

export function loadCSVData(filePath: string): any[] {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error) {
    console.error(`Error loading CSV file ${filePath}:`, error);
    return [];
  }
}

export function loadJSONData(filePath: string): any[] {
  try {
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error(`Error loading JSON file ${filePath}:`, error);
    return [];
  }
}

export function processMEPsData(csvData: any[]): MEPIdentity[] {
  return csvData
    .map(row => {
      try {
        const mepData = {
          mep_id: row.mep_id || row.id,
          name: row.name,
          country: row.country,
          party: row.party,
          national_party: row.national_party || row.nationalParty || '',
          profile_url: row.profile_url || row.profileUrl,
          photo_url: row.photo_url || row.photoUrl,
        };
        
        return MEPIdentitySchema.parse(mepData);
      } catch (error) {
        console.error(`Error parsing MEP data for row:`, row, error);
        return null;
      }
    })
    .filter((mep): mep is MEPIdentity => mep !== null);
}

export function processAttendanceData(csvData: any[]): MEPAttendance[] {
  return csvData
    .map(row => {
      try {
        const attendanceData = {
          mep_id: row.mep_id || row.id,
          votes_total_period: parseInt(row.votes_total_period || row.votesTotalPeriod || '0'),
          votes_cast: parseInt(row.votes_cast || row.votesCast || '0'),
          attendance_pct: parseFloat(row.attendance_pct || row.attendancePct || '0'),
          partial_term: row.partial_term === 'true' || row.partialTerm === 'true',
        };
        
        return MEPAttendanceSchema.parse(attendanceData);
      } catch (error) {
        console.error(`Error parsing attendance data for row:`, row, error);
        return null;
      }
    })
    .filter((attendance): attendance is MEPAttendance => attendance !== null);
}

export function processVotesData(csvData: any[]): VoteCatalog[] {
  return csvData
    .map(row => {
      try {
        const voteData = {
          vote_id: row.vote_id || row.id,
          vote_date: row.vote_date || row.voteDate,
          title: row.title,
          result: row.result,
          olp_stage: row.olp_stage || row.olpStage,
          total_for: row.total_for ? parseInt(row.total_for) : undefined,
          total_against: row.total_against ? parseInt(row.total_against) : undefined,
          total_abstain: row.total_abstain ? parseInt(row.total_abstain) : undefined,
          source_url: row.source_url || row.sourceUrl,
        };
        
        return VoteCatalogSchema.parse(voteData);
      } catch (error) {
        console.error(`Error parsing vote data for row:`, row, error);
        return null;
      }
    })
    .filter((vote): vote is VoteCatalog => vote !== null);
}

export function processNotableVotesData(csvData: any[]): NotableVote[] {
  return csvData
    .map(row => {
      try {
        const notableVoteData = {
          mep_id: row.mep_id || row.id,
          vote_id: row.vote_id || row.voteId,
          vote_date: row.vote_date || row.voteDate,
          title: row.title,
          result: row.result,
          olp_stage: row.olp_stage || row.olpStage,
          total_for: row.total_for ? parseInt(row.total_for) : undefined,
          total_against: row.total_against ? parseInt(row.total_against) : undefined,
          total_abstain: row.total_abstain ? parseInt(row.total_abstain) : undefined,
          source_url: row.source_url || row.sourceUrl,
          vote_position: row.vote_position || row.votePosition,
        };
        
        return NotableVoteSchema.parse(notableVoteData);
      } catch (error) {
        console.error(`Error parsing notable vote data for row:`, row, error);
        return null;
      }
    })
    .filter((vote): vote is NotableVote => vote !== null);
}

export function loadHowTheyVoteData(dataDir: string): HowTheyVoteData {
  console.log('🔄 Loading HowTheyVote data from:', dataDir);
  
  // Load MEPs data
  const mepsCSV = loadCSVData(path.join(dataDir, 'meps.csv'));
  const meps = processMEPsData(mepsCSV);
  console.log(`📊 Loaded ${meps.length} MEPs`);
  
  // Load attendance data
  const attendanceCSV = loadCSVData(path.join(dataDir, 'meps_attendance.csv'));
  const attendance = processAttendanceData(attendanceCSV);
  console.log(`📊 Loaded ${attendance.length} attendance records`);
  
  // Load votes catalog
  const votesCSV = loadCSVData(path.join(dataDir, 'votes_catalog.csv'));
  const votes = processVotesData(votesCSV);
  console.log(`📊 Loaded ${votes.length} votes`);
  
  // Load notable votes
  const notableVotesCSV = loadCSVData(path.join(dataDir, 'mep_notable_votes.csv'));
  const notableVotes = processNotableVotesData(notableVotesCSV);
  console.log(`📊 Loaded ${notableVotes.length} notable votes`);
  
  return {
    meps,
    attendance,
    votes,
    notableVotes,
  };
}

export function loadExistingJSONData(dataDir: string): HowTheyVoteData {
  console.log('🔄 Loading existing JSON data from:', dataDir);
  
  // Load existing JSON files
  const mepsJSON = loadJSONData(path.join(dataDir, 'meps.json'));
  const votesJSON = loadJSONData(path.join(dataDir, 'votes.json'));
  const notableVotesJSON = loadJSONData(path.join(dataDir, 'notable-votes.json'));
  
  // Process the data
  const meps = processMEPsData(mepsJSON);
  const votes = processVotesData(votesJSON);
  
  // Flatten notable votes from grouped structure
  const notableVotes: NotableVote[] = [];
  for (const [mepId, votes] of Object.entries(notableVotesJSON)) {
    if (Array.isArray(votes)) {
      for (const vote of votes) {
        notableVotes.push({
          ...vote,
          mep_id: mepId,
        });
      }
    }
  }
  
  // Create attendance data from MEPs data
  const attendance: MEPAttendance[] = meps
    .filter(mep => mep.mep_id)
    .map(mep => ({
      mep_id: mep.mep_id!,
      votes_total_period: 0, // Will be calculated from votes
      votes_cast: 0, // Will be calculated from votes
      attendance_pct: 0, // Will be calculated
      partial_term: false,
    }));
  
  console.log(`📊 Loaded ${meps.length} MEPs from JSON`);
  console.log(`📊 Loaded ${votes.length} votes from JSON`);
  console.log(`📊 Loaded ${notableVotes.length} notable votes from JSON`);
  console.log(`📊 Created ${attendance.length} attendance records`);
  
  return {
    meps,
    attendance,
    votes,
    notableVotes,
  };
}

export function mergeMEPData(meps: MEPIdentity[], attendance: MEPAttendance[]): (MEPIdentity & Partial<MEPAttendance>)[] {
  const attendanceMap = new Map(attendance.map(a => [a.mep_id, a]));
  
  return meps.map(mep => ({
    ...mep,
    ...attendanceMap.get(mep.mep_id),
  }));
}
