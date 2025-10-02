#!/usr/bin/env tsx

/**
 * Identify high-value MEPs for targeted WhoFunds processing
 * High-value criteria:
 * - High attendance (>95%)
 * - High voting participation (>1000 votes)
 * - Party leaders (by name patterns)
 * - Committee chairs (by name patterns)
 * - Large country representatives
 */

import fs from 'fs';
import path from 'path';

interface MEP {
  mep_id: string;
  name: string;
  country: string;
  party: string;
  national_party: string;
  attendance_pct: number;
  votes_cast: number;
  votes_total_period: number;
}

interface HighValueMEP extends MEP {
  value_score: number;
  value_reasons: string[];
}

function calculateValueScore(mep: MEP): HighValueMEP {
  const reasons: string[] = [];
  let score = 0;

  // High attendance (0-30 points)
  if (mep.attendance_pct >= 98) {
    score += 30;
    reasons.push(`Excellent attendance (${mep.attendance_pct}%)`);
  } else if (mep.attendance_pct >= 95) {
    score += 20;
    reasons.push(`High attendance (${mep.attendance_pct}%)`);
  } else if (mep.attendance_pct >= 90) {
    score += 10;
    reasons.push(`Good attendance (${mep.attendance_pct}%)`);
  }

  // High voting participation (0-25 points)
  if (mep.votes_cast >= 1150) {
    score += 25;
    reasons.push(`High voting participation (${mep.votes_cast} votes)`);
  } else if (mep.votes_cast >= 1000) {
    score += 15;
    reasons.push(`Good voting participation (${mep.votes_cast} votes)`);
  }

  // Party leadership indicators (0-20 points)
  const name = mep.name.toLowerCase();
  if (name.includes('president') || name.includes('chair') || name.includes('leader')) {
    score += 20;
    reasons.push('Potential party leader (name pattern)');
  }

  // Committee chair indicators (0-15 points)
  if (name.includes('chair') || name.includes('vice') || name.includes('coordinator')) {
    score += 15;
    reasons.push('Potential committee role (name pattern)');
  }

  // Large country bonus (0-10 points)
  const largeCountries = ['Germany', 'France', 'Italy', 'Spain', 'Poland'];
  if (largeCountries.includes(mep.country)) {
    score += 10;
    reasons.push(`Large country representative (${mep.country})`);
  }

  // Political group leadership (0-10 points)
  const groupLeaders = ['European People\'s Party', 'Group of the Progressive Alliance of Socialists and Democrats'];
  if (groupLeaders.includes(mep.party)) {
    score += 5;
    reasons.push('Major political group');
  }

  return {
    ...mep,
    value_score: score,
    value_reasons: reasons
  };
}

function identifyHighValueMEPs(): HighValueMEP[] {
  const mepsPath = path.join(process.cwd(), 'public/data/meps.json');
  const meps: MEP[] = JSON.parse(fs.readFileSync(mepsPath, 'utf-8'));

  const highValueMEPs = meps
    .map(calculateValueScore)
    .filter(mep => mep.value_score >= 30) // Minimum threshold
    .sort((a, b) => b.value_score - a.value_score);

  return highValueMEPs;
}

function createHighValueSeedList(highValueMEPs: HighValueMEP[]): void {
  const seedData = highValueMEPs.map(mep => ({
    mep_id: mep.mep_id,
    name: mep.name,
    country: mep.country,
    party: mep.party,
    value_score: mep.value_score,
    value_reasons: mep.value_reasons.join('; ')
  }));

  const csvHeader = 'mep_id,name,country,party,value_score,value_reasons\n';
  const csvRows = seedData.map(mep => 
    `${mep.mep_id},"${mep.name}","${mep.country}","${mep.party}",${mep.value_score},"${mep.value_reasons}"`
  ).join('\n');

  const csvContent = csvHeader + csvRows;
  const outputPath = path.join(process.cwd(), 'scripts/whofunds/high-value-meps-seed-list.csv');
  
  fs.writeFileSync(outputPath, csvContent);
  console.log(`✅ Created high-value MEPs seed list: ${outputPath}`);
  console.log(`📊 Total high-value MEPs: ${highValueMEPs.length}`);
}

function main() {
  console.log('🔍 Identifying high-value MEPs...');
  
  const highValueMEPs = identifyHighValueMEPs();
  
  console.log('\n🏆 Top 20 High-Value MEPs:');
  highValueMEPs.slice(0, 20).forEach((mep, index) => {
    console.log(`${index + 1}. ${mep.name} (${mep.country}) - Score: ${mep.value_score}`);
    console.log(`   Reasons: ${mep.value_reasons.join(', ')}`);
    console.log(`   Party: ${mep.party}`);
    console.log('');
  });

  createHighValueSeedList(highValueMEPs);

  // Statistics
  const byCountry = highValueMEPs.reduce((acc, mep) => {
    acc[mep.country] = (acc[mep.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byParty = highValueMEPs.reduce((acc, mep) => {
    acc[mep.party] = (acc[mep.party] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📈 Distribution by Country:');
  Object.entries(byCountry)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([country, count]) => {
      console.log(`  ${country}: ${count} MEPs`);
    });

  console.log('\n🏛️ Distribution by Party:');
  Object.entries(byParty)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .forEach(([party, count]) => {
      console.log(`  ${party}: ${count} MEPs`);
    });
}

if (require.main === module) {
  main();
}

export { identifyHighValueMEPs, calculateValueScore };
