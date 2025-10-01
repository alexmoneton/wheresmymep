import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { WhoFundsData, WhoFundsIndex, validateWhoFundsData, validateWhoFundsIndex } from '@/lib/zod/whofunds';
import { isProEAR } from '@/lib/pro-ear';
import { ENV_DEFAULTS } from '@/lib/flags';

interface ExportFilter {
  country?: string;
  party?: string;
  minIncome?: number;
  maxIncome?: number;
  category?: string;
}

// Check if user has access to export (Pro subscription required)
function hasExportAccess(): boolean {
  return isProEAR();
}

// Convert data to CSV format
function convertToCSV(data: WhoFundsData[]): string {
  const headers = [
    'MEP ID',
    'Name',
    'Country',
    'Party',
    'Category',
    'Entity Name',
    'Entity Type',
    'Role',
    'Amount Min (EUR)',
    'Amount Max (EUR)',
    'Period',
    'Start Date',
    'End Date',
    'Notes',
    'Source Excerpt',
    'Last Updated'
  ];
  
  const rows: string[] = [headers.join(',')];
  
  for (const mep of data) {
    if (mep.income_and_interests.length === 0) {
      // MEP with no income data
      rows.push([
        mep.mep_id,
        `"${mep.name}"`,
        `"${mep.country}"`,
        `"${mep.party}"`,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        mep.last_updated_utc
      ].join(','));
    } else {
      // MEP with income data
      for (const income of mep.income_and_interests) {
        rows.push([
          mep.mep_id,
          `"${mep.name}"`,
          `"${mep.country}"`,
          `"${mep.party}"`,
          income.category,
          `"${income.entity_name}"`,
          income.entity_type,
          `"${income.role || ''}"`,
          income.amount_eur_min || '',
          income.amount_eur_max || '',
          `"${income.period || ''}"`,
          income.start_date || '',
          income.end_date || '',
          `"${income.notes || ''}"`,
          `"${income.source_excerpt || ''}"`,
          mep.last_updated_utc
        ].join(','));
      }
    }
  }
  
  return rows.join('\n');
}

// Filter data based on criteria
function filterData(data: WhoFundsData[], filter: ExportFilter): WhoFundsData[] {
  return data.filter(mep => {
    // Country filter
    if (filter.country && mep.country !== filter.country) {
      return false;
    }
    
    // Party filter
    if (filter.party && mep.party !== filter.party) {
      return false;
    }
    
    // Category filter
    if (filter.category) {
      const hasCategory = mep.income_and_interests.some(
        income => income.category === filter.category
      );
      if (!hasCategory) {
        return false;
      }
    }
    
    // Income range filter
    if (filter.minIncome !== undefined || filter.maxIncome !== undefined) {
      const totalIncome = mep.income_and_interests.reduce((sum, income) => {
        const amount = income.amount_eur_max || income.amount_eur_min || 0;
        return sum + amount;
      }, 0);
      
      if (filter.minIncome !== undefined && totalIncome < filter.minIncome) {
        return false;
      }
      
      if (filter.maxIncome !== undefined && totalIncome > filter.maxIncome) {
        return false;
      }
    }
    
    return true;
  });
}

export async function POST(request: NextRequest) {
  // Feature flag guard
  if (!ENV_DEFAULTS.whofunds) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 404 }
    );
  }

  try {
    // Check if user has export access
    if (!hasExportAccess()) {
      return NextResponse.json(
        { error: 'Export requires Pro subscription' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const filter: ExportFilter = body.filter || {};
    
    // Load index to get list of MEPs
    const indexPath = path.join(process.cwd(), 'public/data/whofunds/index.json');
    
    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      const indexData = JSON.parse(indexContent);
      const validatedIndex = validateWhoFundsIndex(indexData);
      
      // Load data for each MEP
      const mepData: WhoFundsData[] = [];
      
      for (const mepEntry of validatedIndex.meps) {
        try {
          const dataPath = path.join(process.cwd(), 'public/data/whofunds', `${mepEntry.mep_id}.json`);
          const dataContent = await fs.readFile(dataPath, 'utf-8');
          const data = JSON.parse(dataContent);
          const validatedData = validateWhoFundsData(data);
          mepData.push(validatedData);
        } catch (error) {
          console.warn(`Failed to load data for MEP ${mepEntry.mep_id}:`, error);
        }
      }
      
      // Apply filters
      const filteredData = filterData(mepData, filter);
      
      // Convert to CSV
      const csvContent = convertToCSV(filteredData);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `whofunds-export-${timestamp}.csv`;
      
      // Return CSV file
      const headers = new Headers();
      headers.set('Content-Type', 'text/csv');
      headers.set('Content-Disposition', `attachment; filename="${filename}"`);
      headers.set('Cache-Control', 'no-cache');
      
      return new NextResponse(csvContent, {
        status: 200,
        headers
      });
      
    } catch (indexError) {
      return NextResponse.json(
        { error: 'Index data not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error exporting data:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for export options
export async function GET() {
  // Feature flag guard
  if (!ENV_DEFAULTS.whofunds) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 404 }
    );
  }

  try {
    // Load index to get available filter options
    const indexPath = path.join(process.cwd(), 'public/data/whofunds/index.json');
    
    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      const indexData = JSON.parse(indexContent);
      const validatedIndex = validateWhoFundsIndex(indexData);
      
      // Extract unique values for filters
      const countries = [...new Set(validatedIndex.meps.map(mep => mep.country))].sort();
      const parties = [...new Set(validatedIndex.meps.map(mep => mep.party))].sort();
      
      return NextResponse.json({
        availableFilters: {
          countries,
          parties,
          categories: [
            'board_membership',
            'consulting',
            'speaking',
            'writing',
            'teaching',
            'investment',
            'other'
          ]
        },
        totalMEPs: validatedIndex.meps.length,
        lastUpdated: validatedIndex.meta.generated_at
      });
      
    } catch (indexError) {
      return NextResponse.json(
        { error: 'Index data not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error getting export options:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
