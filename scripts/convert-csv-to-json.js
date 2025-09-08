const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Helper function to normalize text
function normalizeText(text) {
  if (!text) return '';
  return text.trim();
}

// Helper function to extract MEP ID from profile URL
function extractMepIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/\/meps\/en\/(\d+)/);
  return match ? match[1] : null;
}

// Helper function to coerce number
function coerceNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Load and parse CSV file
function loadCSV(filePath) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const result = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });
    
    if (result.errors.length > 0) {
      console.warn(`CSV parsing errors in ${filePath}:`, result.errors);
    }
    
    return result.data;
  } catch (error) {
    console.error(`Error loading CSV file ${filePath}:`, error);
    return [];
  }
}

// Convert CSV data to JSON
function convertData() {
  console.log('🔄 Converting CSV data to JSON...');
  
  const dataDir = path.join(__dirname, '..', 'data');
  const publicDataDir = path.join(__dirname, '..', 'public', 'data');
  
  // Ensure public data directory exists
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }
  
  // Convert meps.csv
  const mepsRaw = loadCSV(path.join(dataDir, 'meps.csv'));
  console.log(`📊 Loaded ${mepsRaw.length} MEPs from meps.csv`);
  
  const mepsWithId = mepsRaw.map(mep => {
    let mep_id = mep.mep_id;
    
    if (!mep_id && mep.profile_url) {
      mep_id = extractMepIdFromUrl(mep.profile_url);
    }
    
    if (mep_id) {
      mep_id = String(mep_id).replace(/\.0+$/, '');
    }
    
    return {
      ...mep,
      mep_id: mep_id || null,
    };
  });
  
  const mepsValid = mepsWithId.filter(mep => mep.mep_id);
  console.log(`✅ ${mepsValid.length} MEPs with valid IDs`);
  
  const mepsIdentity = mepsValid.map(mep => ({
    mep_id: String(mep.mep_id),
    name: normalizeText(mep.name),
    country: normalizeText(mep.country),
    party: normalizeText(mep.party),
    national_party: normalizeText(mep.national_party),
    profile_url: normalizeText(mep.profile_url),
    photo_url: normalizeText(mep.photo_url),
  }));
  
  // Convert attendance data
  const attendanceRaw = loadCSV(path.join(dataDir, 'meps_attendance.csv'));
  console.log(`📊 Loaded ${attendanceRaw.length} attendance records`);
  
  const mepsAttendance = attendanceRaw.map(att => ({
    mep_id: String(att.mep_id).replace(/\.0+$/, ''),
    votes_total_period: coerceNumber(att.votes_total_period),
    votes_cast: coerceNumber(att.votes_cast),
    attendance_pct: coerceNumber(att.attendance_pct),
    partial_term: att.partial_term === 'True' || att.partial_term === true,
  }));
  
  // Create attendance lookup
  const attendanceMap = new Map(mepsAttendance.map(att => [att.mep_id, att]));
  
  // Merge identity and attendance data
  const mepsEnriched = mepsIdentity.map(identity => {
    const attendance = attendanceMap.get(identity.mep_id);
    if (!attendance) {
      console.warn(`⚠️  No attendance data for MEP ${identity.mep_id} (${identity.name})`);
      return {
        ...identity,
        votes_total_period: 0,
        votes_cast: 0,
        attendance_pct: 0,
        partial_term: false,
      };
    }
    return { ...identity, ...attendance };
  });
  
  // Convert votes catalog
  const votesRaw = loadCSV(path.join(dataDir, 'votes_catalog.csv'));
  console.log(`📊 Loaded ${votesRaw.length} votes from catalog`);
  
  const votesCatalog = votesRaw.map(vote => ({
    vote_id: String(vote.vote_id),
    vote_date: normalizeText(vote.vote_date),
    title: normalizeText(vote.title),
    result: normalizeText(vote.result),
    olp_stage: normalizeText(vote.olp_stage),
    total_for: coerceNumber(vote.total_for),
    total_against: coerceNumber(vote.total_against),
    total_abstain: coerceNumber(vote.total_abstain),
    source_url: normalizeText(vote.source_url),
  }));
  
  // Convert notable votes
  const notableRaw = loadCSV(path.join(dataDir, 'mep_notable_votes.csv'));
  console.log(`📊 Loaded ${notableRaw.length} notable vote records`);
  
  const notableVotes = notableRaw.map(vote => ({
    mep_id: String(vote.mep_id).replace(/\.0+$/, ''),
    vote_id: String(vote.vote_id),
    vote_date: normalizeText(vote.vote_date),
    title: normalizeText(vote.title),
    result: normalizeText(vote.result),
    olp_stage: normalizeText(vote.olp_stage),
    total_for: coerceNumber(vote.total_for),
    total_against: coerceNumber(vote.total_against),
    total_abstain: coerceNumber(vote.total_abstain),
    source_url: normalizeText(vote.source_url),
    vote_position: vote.vote_position,
  }));
  
  // Group notable votes by MEP ID
  const notableByMep = {};
  notableVotes.forEach(vote => {
    if (!notableByMep[vote.mep_id]) {
      notableByMep[vote.mep_id] = [];
    }
    notableByMep[vote.mep_id].push(vote);
  });
  
  // Sort notable votes by date (descending)
  Object.keys(notableByMep).forEach(mepId => {
    notableByMep[mepId].sort((a, b) => b.vote_date.localeCompare(a.vote_date));
  });
  
  // Write JSON files
  fs.writeFileSync(
    path.join(publicDataDir, 'meps.json'),
    JSON.stringify(mepsEnriched, null, 2)
  );
  
  fs.writeFileSync(
    path.join(publicDataDir, 'votes.json'),
    JSON.stringify(votesCatalog, null, 2)
  );
  
  fs.writeFileSync(
    path.join(publicDataDir, 'notable-votes.json'),
    JSON.stringify(notableByMep, null, 2)
  );
  
  // Write metadata
  const metadata = {
    generated_at: new Date().toISOString(),
    meps_count: mepsEnriched.length,
    votes_count: votesCatalog.length,
    notable_votes_count: notableVotes.length,
    meps_with_attendance: mepsEnriched.filter(m => m.votes_total_period > 0).length,
  };
  
  fs.writeFileSync(
    path.join(publicDataDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('✅ Data conversion complete!');
  console.log(`📁 Generated files in ${publicDataDir}:`);
  console.log('  - meps.json');
  console.log('  - votes.json');
  console.log('  - notable-votes.json');
  console.log('  - metadata.json');
}

// Run conversion
convertData();
