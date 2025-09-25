#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { loadHowTheyVoteData, loadExistingJSONData, mergeMEPData } from './howtheyvote';
import { 
  batchUpsertMEPs, 
  batchUpsertVotes, 
  batchUpsertMEPVotes,
  upsertCountry,
  upsertParty,
  upsertCommittee,
  upsertTopic,
  upsertTag,
  upsertDossier,
  connectDossierTag
} from './upsert';
import { extractPolicyAreas, createSlug } from './normalize';
import path from 'path';

const prisma = new PrismaClient();

// Curated data for countries, parties, and committees
const COUNTRIES = [
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
];

const PARTIES = [
  { name: 'European People\'s Party (Christian Democrats)', abbreviation: 'EPP', euGroup: 'EPP' },
  { name: 'Progressive Alliance of Socialists and Democrats', abbreviation: 'S&D', euGroup: 'S&D' },
  { name: 'Renew Europe', abbreviation: 'RE', euGroup: 'RE' },
  { name: 'European Conservatives and Reformists', abbreviation: 'ECR', euGroup: 'ECR' },
  { name: 'Identity and Democracy', abbreviation: 'ID', euGroup: 'ID' },
  { name: 'The Left', abbreviation: 'GUE/NGL', euGroup: 'GUE/NGL' },
  { name: 'Greens/European Free Alliance', abbreviation: 'Greens/EFA', euGroup: 'Greens/EFA' },
  { name: 'Non-attached Members', abbreviation: 'NI', euGroup: 'NI' },
];

const COMMITTEES = [
  { code: 'AFET', name: 'Foreign Affairs', description: 'Foreign Affairs Committee' },
  { code: 'DEVE', name: 'Development', description: 'Development Committee' },
  { code: 'INTA', name: 'International Trade', description: 'International Trade Committee' },
  { code: 'BUDG', name: 'Budgets', description: 'Budgets Committee' },
  { code: 'CONT', name: 'Budgetary Control', description: 'Budgetary Control Committee' },
  { code: 'ECON', name: 'Economic and Monetary Affairs', description: 'Economic and Monetary Affairs Committee' },
  { code: 'EMPL', name: 'Employment and Social Affairs', description: 'Employment and Social Affairs Committee' },
  { code: 'ENVI', name: 'Environment, Public Health and Food Safety', description: 'Environment, Public Health and Food Safety Committee' },
  { code: 'ITRE', name: 'Industry, Research and Energy', description: 'Industry, Research and Energy Committee' },
  { code: 'IMCO', name: 'Internal Market and Consumer Protection', description: 'Internal Market and Consumer Protection Committee' },
  { code: 'TRAN', name: 'Transport and Tourism', description: 'Transport and Tourism Committee' },
  { code: 'REGI', name: 'Regional Development', description: 'Regional Development Committee' },
  { code: 'AGRI', name: 'Agriculture and Rural Development', description: 'Agriculture and Rural Development Committee' },
  { code: 'PECH', name: 'Fisheries', description: 'Fisheries Committee' },
  { code: 'CULT', name: 'Culture and Education', description: 'Culture and Education Committee' },
  { code: 'JURI', name: 'Legal Affairs', description: 'Legal Affairs Committee' },
  { code: 'LIBE', name: 'Civil Liberties, Justice and Home Affairs', description: 'Civil Liberties, Justice and Home Affairs Committee' },
  { code: 'AFCO', name: 'Constitutional Affairs', description: 'Constitutional Affairs Committee' },
  { code: 'FEMM', name: 'Women\'s Rights and Gender Equality', description: 'Women\'s Rights and Gender Equality Committee' },
  { code: 'PETI', name: 'Petitions', description: 'Petitions Committee' },
];

const TOPICS = [
  { slug: 'climate-environment', name: 'Climate & Environment', description: 'Climate change, environmental protection, and sustainability policies' },
  { slug: 'energy', name: 'Energy', description: 'Energy policy, renewable energy, and energy security' },
  { slug: 'migration-asylum', name: 'Migration & Asylum', description: 'Migration policies, asylum procedures, and border control' },
  { slug: 'digital-technology', name: 'Digital & Technology', description: 'Digital policies, AI regulation, and technology governance' },
  { slug: 'trade-economy', name: 'Trade & Economy', description: 'Trade agreements, economic policies, and fiscal matters' },
  { slug: 'agriculture', name: 'Agriculture', description: 'Agricultural policies, food safety, and rural development' },
  { slug: 'health', name: 'Health', description: 'Public health policies, healthcare systems, and medical regulation' },
  { slug: 'education-culture', name: 'Education & Culture', description: 'Education policies, cultural programs, and research funding' },
  { slug: 'transport', name: 'Transport', description: 'Transportation policies, infrastructure, and mobility' },
  { slug: 'defense-security', name: 'Defense & Security', description: 'Defense policies, security measures, and international relations' },
  { slug: 'foreign-affairs', name: 'Foreign Affairs', description: 'International relations, diplomacy, and foreign policy' },
  { slug: 'human-rights', name: 'Human Rights', description: 'Human rights protection, equality, and social justice' },
  { slug: 'democracy-rule-of-law', name: 'Democracy & Rule of Law', description: 'Democratic processes, rule of law, and institutional reform' },
  { slug: 'justice-home-affairs', name: 'Justice & Home Affairs', description: 'Justice systems, home affairs, and legal cooperation' },
];

async function seedReferenceData() {
  console.log('🌱 Seeding reference data...');
  
  // Seed countries
  for (const country of COUNTRIES) {
    await upsertCountry(country.name, country.code);
  }
  console.log(`✅ Seeded ${COUNTRIES.length} countries`);
  
  // Seed parties
  for (const party of PARTIES) {
    // Find a country to associate with (we'll use Germany as default)
    const country = await prisma.country.findFirst({ where: { code: 'DE' } });
    if (country) {
      await upsertParty(party.name, party.abbreviation, party.euGroup, country.id);
    }
  }
  console.log(`✅ Seeded ${PARTIES.length} parties`);
  
  // Seed committees
  for (const committee of COMMITTEES) {
    await upsertCommittee(committee.code, committee.name, committee.description);
  }
  console.log(`✅ Seeded ${COMMITTEES.length} committees`);
  
  // Seed topics
  for (const topic of TOPICS) {
    await upsertTopic(topic.slug, topic.name, topic.description);
  }
  console.log(`✅ Seeded ${TOPICS.length} topics`);
}

async function ingestMEPData() {
  console.log('🔄 Ingesting MEP data...');
  
  // Try to load from CSV first, fallback to JSON
  const dataDir = path.join(process.cwd(), 'data');
  let data;
  
  try {
    data = loadHowTheyVoteData(dataDir);
  } catch (error) {
    console.log('📁 CSV data not found, trying JSON data...');
    const publicDataDir = path.join(process.cwd(), 'public', 'data');
    data = loadExistingJSONData(publicDataDir);
  }
  
  // Merge MEP and attendance data
  const enrichedMEPs = mergeMEPData(data.meps, data.attendance);
  
  // Upsert MEPs
  const meps = await batchUpsertMEPs(enrichedMEPs);
  console.log(`✅ Upserted ${meps.length} MEPs`);
  
  return data;
}

async function ingestVoteData(voteData: any) {
  console.log('🔄 Ingesting vote data...');
  
  // Upsert votes
  const votes = await batchUpsertVotes(voteData.votes);
  console.log(`✅ Upserted ${votes.length} votes`);
  
  // Upsert MEP votes
  const mepVotes = await batchUpsertMEPVotes(voteData.notableVotes);
  console.log(`✅ Upserted ${mepVotes.length} MEP votes`);
  
  // Create dossiers and tags from votes
  await createDossiersAndTags(voteData.votes);
}

async function createDossiersAndTags(votes: any[]) {
  console.log('🔄 Creating dossiers and tags...');
  
  const dossierMap = new Map();
  const tagMap = new Map();
  
  for (const vote of votes) {
    // Extract policy areas
    const policyAreas = extractPolicyAreas(vote.title, vote.description);
    
    // Create dossier if it doesn't exist
    let dossier = dossierMap.get(vote.title);
    if (!dossier) {
      dossier = await upsertDossier(null, vote.title, vote.description, policyAreas);
      dossierMap.set(vote.title, dossier);
    }
    
    // Create tags for policy areas
    for (const area of policyAreas) {
      const tagSlug = createSlug(area);
      let tag = tagMap.get(tagSlug);
      if (!tag) {
        tag = await upsertTag(tagSlug, area);
        tagMap.set(tagSlug, tag);
      }
      
      // Connect dossier to tag
      await connectDossierTag(dossier.id, tag.id);
    }
  }
  
  console.log(`✅ Created ${dossierMap.size} dossiers and ${tagMap.size} tags`);
}

async function main() {
  try {
    console.log('🚀 Starting data ingestion...');
    
    // Seed reference data
    await seedReferenceData();
    
    // Ingest MEP data
    const voteData = await ingestMEPData();
    
    // Ingest vote data
    await ingestVoteData(voteData);
    
    console.log('✅ Data ingestion completed successfully!');
    
    // Print summary
    const mepCount = await prisma.mEP.count();
    const voteCount = await prisma.vote.count();
    const mepVoteCount = await prisma.mEPVote.count();
    const dossierCount = await prisma.dossier.count();
    
    console.log('\n📊 Final counts:');
    console.log(`- MEPs: ${mepCount}`);
    console.log(`- Votes: ${voteCount}`);
    console.log(`- MEP Votes: ${mepVoteCount}`);
    console.log(`- Dossiers: ${dossierCount}`);
    
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as ingestData };
