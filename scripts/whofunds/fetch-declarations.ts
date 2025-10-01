#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';
import { createReadStream } from 'fs';
import { WhoFundsSchema, WhoFundsData, validateWhoFundsData } from '../../src/lib/zod/whofunds';

// Environment guard
if (process.env.ALLOW_WHOFUNDS_FETCH !== 'true') {
  console.error('❌ ALLOW_WHOFUNDS_FETCH environment variable not set to "true"');
  console.error('   This prevents accidental runs. Set ALLOW_WHOFUNDS_FETCH=true to proceed.');
  process.exit(1);
}

interface SeedMEP {
  mep_id: string;
  name: string;
  profile_url: string;
  country: string;
  party: string;
}

interface DeclarationResult {
  mep_id: string;
  declaration_url?: string;
  data?: WhoFundsData;
  error?: string;
  confidence: 'high' | 'medium' | 'low';
}

// Mock data for demonstration (in production, this would parse real declarations)
const generateMockData = (mep: SeedMEP): WhoFundsData => {
  const now = new Date().toISOString();
  
  // Generate some realistic mock data
  const hasIncome = Math.random() > 0.3; // 70% chance of having income
  const hasGifts = Math.random() > 0.7; // 30% chance of having gifts
  
  const incomeAndInterests = hasIncome ? [
    {
      category: 'board_membership' as const,
      entity_name: 'Tech Innovation Foundation',
      entity_type: 'ngo' as const,
      role: 'Board Member',
      amount_eur_min: 5000,
      amount_eur_max: 10000,
      period: 'annual',
      start_date: '2023-01-01',
      notes: 'Non-profit technology foundation',
      source_excerpt: 'Board member of Tech Innovation Foundation, annual compensation €5,000-€10,000'
    },
    ...(Math.random() > 0.5 ? [{
      category: 'consulting' as const,
      entity_name: 'Policy Advisory Group',
      entity_type: 'company' as const,
      role: 'Senior Advisor',
      amount_eur_min: 2000,
      amount_eur_max: 5000,
      period: 'monthly',
      start_date: '2023-06-01',
      notes: 'Policy consulting services',
      source_excerpt: 'Consulting services for Policy Advisory Group, €2,000-€5,000 per month'
    }] : [])
  ] : [];

  const giftsTravel = hasGifts ? [
    {
      sponsor: 'European Business Forum',
      item: 'Conference attendance and travel',
      value_eur: 1500,
      date: '2024-01-15',
      notes: 'Annual business conference in Brussels'
    },
    ...(Math.random() > 0.6 ? [{
      sponsor: 'University of Economics',
      item: 'Speaking engagement',
      value_eur: 800,
      date: '2024-02-20',
      notes: 'Guest lecture on EU policy'
    }] : [])
  ] : [];

  return {
    mep_id: mep.mep_id,
    name: mep.name,
    country: mep.country,
    party: mep.party,
    sources: {
      declaration_url: `${mep.profile_url}/declaration`,
      transparency_register_urls: [
        'https://ec.europa.eu/transparencyregister/public/consultation/displaylobbyist.do?id=123456789'
      ]
    },
    last_updated_utc: now,
    income_and_interests: incomeAndInterests,
    gifts_travel: giftsTravel,
    data_quality: {
      confidence: 'medium' as const,
      parsing_method: 'manual' as const,
      issues: ['Mock data for demonstration purposes']
    }
  };
};

// Simulate declaration URL discovery
const discoverDeclarationUrl = async (mep: SeedMEP): Promise<string | null> => {
  // In production, this would:
  // 1. Fetch the MEP profile page
  // 2. Look for links to "Declaration of financial interests"
  // 3. Return the URL if found
  
  // For demo, return a mock URL
  return `${mep.profile_url}/declaration`;
};

// Simulate parsing HTML declaration
const parseHtmlDeclaration = async (url: string): Promise<Partial<WhoFundsData>> => {
  // In production, this would:
  // 1. Fetch the HTML page
  // 2. Parse tables and structured data
  // 3. Extract income, gifts, and other interests
  // 4. Return structured data
  
  console.log(`📄 Parsing HTML declaration: ${url}`);
  
  // Mock parsing result
  return {
    income_and_interests: [
      {
        category: 'board_membership',
        entity_name: 'Sample Foundation',
        entity_type: 'ngo',
        role: 'Board Member',
        amount_eur_min: 3000,
        amount_eur_max: 6000,
        period: 'annual',
        source_excerpt: 'Board member of Sample Foundation'
      }
    ],
    gifts_travel: [
      {
        sponsor: 'Sample Conference',
        item: 'Travel and accommodation',
        value_eur: 1200,
        date: '2024-01-10',
        notes: 'International conference'
      }
    ],
    data_quality: {
      confidence: 'high',
      parsing_method: 'html_table',
      issues: []
    }
  };
};

// Simulate parsing PDF declaration
const parsePdfDeclaration = async (url: string): Promise<Partial<WhoFundsData>> => {
  // In production, this would:
  // 1. Download the PDF
  // 2. Extract text using pdf-parse
  // 3. Use heuristics to identify tables and structured data
  // 4. Return structured data
  
  console.log(`📄 Parsing PDF declaration: ${url}`);
  
  // Mock parsing result
  return {
    income_and_interests: [
      {
        category: 'consulting',
        entity_name: 'Sample Consulting Ltd',
        entity_type: 'company',
        role: 'Policy Advisor',
        amount_eur_min: 1500,
        amount_eur_max: 3000,
        period: 'monthly',
        source_excerpt: 'Policy advisory services for Sample Consulting Ltd'
      }
    ],
    gifts_travel: [],
    data_quality: {
      confidence: 'medium',
      parsing_method: 'pdf_text',
      issues: ['PDF text extraction may have missed some details']
    }
  };
};

// Process a single MEP
const processMEP = async (mep: SeedMEP): Promise<DeclarationResult> => {
  try {
    console.log(`\n🔍 Processing MEP: ${mep.name} (${mep.mep_id})`);
    
    // Discover declaration URL
    const declarationUrl = await discoverDeclarationUrl(mep);
    if (!declarationUrl) {
      return {
        mep_id: mep.mep_id,
        error: 'No declaration URL found',
        confidence: 'low'
      };
    }
    
    // Determine if it's HTML or PDF and parse accordingly
    let parsedData: Partial<WhoFundsData>;
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    
    if (declarationUrl.endsWith('.pdf')) {
      parsedData = await parsePdfDeclaration(declarationUrl);
      confidence = 'medium'; // PDF parsing is less reliable
    } else {
      parsedData = await parseHtmlDeclaration(declarationUrl);
      confidence = 'high'; // HTML parsing is more reliable
    }
    
    // Combine with base MEP data
    const fullData: WhoFundsData = {
      mep_id: mep.mep_id,
      name: mep.name,
      country: mep.country,
      party: mep.party,
      sources: {
        declaration_url: declarationUrl
      },
      last_updated_utc: new Date().toISOString(),
      income_and_interests: parsedData.income_and_interests || [],
      gifts_travel: parsedData.gifts_travel || [],
      data_quality: {
        confidence,
        parsing_method: parsedData.data_quality?.parsing_method || 'manual',
        issues: parsedData.data_quality?.issues || []
      }
    };
    
    // Validate the data
    try {
      validateWhoFundsData(fullData);
    } catch (validationError) {
      console.warn(`⚠️  Validation warning for ${mep.name}:`, validationError);
      fullData.data_quality.issues = [
        ...(fullData.data_quality.issues || []),
        'Data validation failed'
      ];
      fullData.data_quality.confidence = 'low';
    }
    
    return {
      mep_id: mep.mep_id,
      declaration_url: declarationUrl,
      data: fullData,
      confidence: fullData.data_quality.confidence
    };
    
  } catch (error) {
    console.error(`❌ Error processing ${mep.name}:`, error);
    return {
      mep_id: mep.mep_id,
      error: error instanceof Error ? error.message : 'Unknown error',
      confidence: 'low'
    };
  }
};

// Load seed list from CSV
const loadSeedList = async (): Promise<SeedMEP[]> => {
  const seedPath = path.join(__dirname, 'seed-list.csv');
  const meps: SeedMEP[] = [];
  
  return new Promise((resolve, reject) => {
    createReadStream(seedPath)
      .pipe(csv())
      .on('data', (row) => {
        meps.push({
          mep_id: row.mep_id,
          name: row.name,
          profile_url: row.profile_url,
          country: row.country,
          party: row.party
        });
      })
      .on('end', () => {
        console.log(`📋 Loaded ${meps.length} MEPs from seed list`);
        resolve(meps);
      })
      .on('error', reject);
  });
};

// Save individual MEP data
const saveMEPData = async (data: WhoFundsData): Promise<void> => {
  const outputDir = path.join(__dirname, '../../public/data/whofunds');
  await fs.mkdir(outputDir, { recursive: true });
  
  const filePath = path.join(outputDir, `${data.mep_id}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved data for ${data.name} to ${filePath}`);
};

// Update index file
const updateIndex = async (results: DeclarationResult[]): Promise<void> => {
  const outputDir = path.join(__dirname, '../../public/data/whofunds');
  const indexPath = path.join(outputDir, 'index.json');
  
  const index = {
    meta: {
      generated_at: new Date().toISOString(),
      total_meps: results.length,
      last_full_refresh: new Date().toISOString()
    },
    meps: results
      .filter(result => result.data)
      .map(result => {
        const data = result.data!;
        const totalEstimatedValue = [
          ...data.income_and_interests.map(i => i.amount_eur_max || i.amount_eur_min || 0),
          ...data.gifts_travel.map(g => g.value_eur || 0)
        ].reduce((sum, val) => sum + val, 0);
        
        return {
          mep_id: data.mep_id,
          name: data.name,
          country: data.country,
          party: data.party,
          last_updated_utc: data.last_updated_utc,
          total_income_entries: data.income_and_interests.length,
          total_gifts_entries: data.gifts_travel.length,
          total_estimated_value_eur: totalEstimatedValue > 0 ? totalEstimatedValue : undefined
        };
      })
      .sort((a, b) => (b.total_estimated_value_eur || 0) - (a.total_estimated_value_eur || 0))
  };
  
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  console.log(`📊 Updated index with ${index.meps.length} MEPs`);
};

// Main execution
const main = async () => {
  console.log('🚀 Starting WhoFunds ETL process...');
  
  try {
    // Load seed list
    const meps = await loadSeedList();
    
    // Process each MEP (limit to first 10 for demo)
    const demoMeps = meps.slice(0, 10);
    console.log(`\n📝 Processing ${demoMeps.length} MEPs (demo mode)`);
    
    const results: DeclarationResult[] = [];
    
    for (const mep of demoMeps) {
      const result = await processMEP(mep);
      results.push(result);
      
      // Save individual data if successful
      if (result.data) {
        await saveMEPData(result.data);
      }
      
      // Add delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Update index
    await updateIndex(results);
    
    // Summary
    const successful = results.filter(r => r.data).length;
    const errors = results.filter(r => r.error).length;
    
    console.log('\n📈 Summary:');
    console.log(`✅ Successfully processed: ${successful}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total MEPs: ${results.length}`);
    
    if (errors > 0) {
      console.log('\n❌ Errors:');
      results.filter(r => r.error).forEach(r => {
        console.log(`  - ${r.mep_id}: ${r.error}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

export { main, processMEP, generateMockData };