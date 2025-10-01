#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { validateWhoFundsData, validateWhoFundsIndex, WhoFundsData, WhoFundsIndex } from '../../src/lib/zod/whofunds';

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

// Validate a single JSON file
const validateFile = async (filePath: string): Promise<ValidationResult> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Determine if it's an index file or individual MEP data
    if (filePath.endsWith('index.json')) {
      validateWhoFundsIndex(data);
    } else {
      validateWhoFundsData(data);
    }
    
    return {
      file: path.basename(filePath),
      valid: true,
      errors: []
    };
  } catch (error) {
    return {
      file: path.basename(filePath),
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

// Main validation function
const main = async () => {
  console.log('🔍 Validating WhoFunds data files...');
  
  const dataDir = path.join(__dirname, '../../public/data/whofunds');
  
  try {
    // Check if directory exists
    await fs.access(dataDir);
  } catch {
    console.log('❌ Data directory does not exist. Run whofunds:fetch first.');
    process.exit(1);
  }
  
  // Get all JSON files
  const files = await fs.readdir(dataDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  if (jsonFiles.length === 0) {
    console.log('❌ No JSON files found in data directory.');
    process.exit(1);
  }
  
  console.log(`📁 Found ${jsonFiles.length} JSON files to validate`);
  
  const results: ValidationResult[] = [];
  
  // Validate each file
  for (const file of jsonFiles) {
    const filePath = path.join(dataDir, file);
    const result = await validateFile(filePath);
    results.push(result);
    
    if (result.valid) {
      console.log(`✅ ${result.file}`);
    } else {
      console.log(`❌ ${result.file}`);
      result.errors.forEach(error => {
        console.log(`   ${error}`);
      });
    }
  }
  
  // Summary
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.filter(r => !r.valid).length;
  
  console.log(`\n📊 Validation Summary:`);
  console.log(`✅ Valid files: ${validCount}`);
  console.log(`❌ Invalid files: ${invalidCount}`);
  console.log(`📁 Total files: ${results.length}`);
  
  if (invalidCount > 0) {
    console.log('\n❌ Invalid files:');
    results.filter(r => !r.valid).forEach(result => {
      console.log(`  - ${result.file}: ${result.errors.join(', ')}`);
    });
    process.exit(1);
  }
  
  console.log('\n🎉 All files are valid!');
};

// Run if called directly
if (require.main === module) {
  main();
}

export { main, validateFile };
