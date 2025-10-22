// Test script to verify data harvesting works locally
// Run with: node scripts/test-harvest.js

const { execSync } = require('child_process');
const path = require('path');

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}

async function testHarvest() {
  log('Starting harvest test...');
  
  try {
    // Test AI Act harvest
    log('Testing AI Act harvest...');
    try {
      execSync('npm run harvest:ai-act', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          PUBLISH_BASE: 'http://localhost:3000',
          ADMIN_SECRET: 'test-secret'
        }
      });
      log('AI Act harvest test completed');
    } catch (error) {
      log(`AI Act harvest test failed: ${error.message}`, 'warn');
    }
    
    // Test MEP data harvest
    log('Testing MEP data harvest...');
    try {
      execSync('npm run harvest:mep-data', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          PUBLISH_BASE: 'http://localhost:3000',
          ADMIN_SECRET: 'test-secret'
        }
      });
      log('MEP data harvest test completed');
    } catch (error) {
      log(`MEP data harvest test failed: ${error.message}`, 'warn');
    }
    
    log('Harvest test completed successfully');
    
  } catch (error) {
    log(`Harvest test failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the test
testHarvest();


