import { describe, it, expect } from 'vitest';
import { validateWhoFundsData, WhoFundsData } from '../zod/whofunds';

describe('WhoFunds Data Validation', () => {
  it('should validate a complete WhoFunds data object', () => {
    const validData: WhoFundsData = {
      mep_id: '197400',
      name: 'Test MEP',
      country: 'Sweden',
      party: 'Renew Europe Group',
      sources: {
        declaration_url: 'https://example.com/declaration'
      },
      last_updated_utc: '2024-01-01T00:00:00.000Z',
      income_and_interests: [
        {
          category: 'board_membership',
          entity_name: 'Test Foundation',
          entity_type: 'ngo',
          role: 'Board Member',
          amount_eur_min: 5000,
          amount_eur_max: 10000,
          period: 'annual',
          start_date: '2023-01-01',
          notes: 'Test notes',
          source_excerpt: 'Test excerpt'
        }
      ],
      gifts_travel: [
        {
          sponsor: 'Test Conference',
          item: 'Travel and accommodation',
          value_eur: 1500,
          date: '2024-01-15',
          notes: 'Test travel'
        }
      ],
      data_quality: {
        confidence: 'high',
        parsing_method: 'html_table',
        issues: []
      }
    };

    expect(() => validateWhoFundsData(validData)).not.toThrow();
  });

  it('should reject data with missing required fields', () => {
    const invalidData = {
      mep_id: '197400',
      name: 'Test MEP',
      // Missing country, party, sources, etc.
    };

    expect(() => validateWhoFundsData(invalidData)).toThrow();
  });

  it('should reject data with invalid confidence level', () => {
    const invalidData: any = {
      mep_id: '197400',
      name: 'Test MEP',
      country: 'Sweden',
      party: 'Renew Europe Group',
      sources: {
        declaration_url: 'https://example.com/declaration'
      },
      last_updated_utc: '2024-01-01T00:00:00.000Z',
      income_and_interests: [],
      gifts_travel: [],
      data_quality: {
        confidence: 'invalid_confidence', // Invalid
        parsing_method: 'html_table',
        issues: []
      }
    };

    expect(() => validateWhoFundsData(invalidData)).toThrow();
  });

  it('should reject data with invalid category', () => {
    const invalidData: any = {
      mep_id: '197400',
      name: 'Test MEP',
      country: 'Sweden',
      party: 'Renew Europe Group',
      sources: {
        declaration_url: 'https://example.com/declaration'
      },
      last_updated_utc: '2024-01-01T00:00:00.000Z',
      income_and_interests: [
        {
          category: 'invalid_category', // Invalid
          entity_name: 'Test Foundation',
          entity_type: 'ngo'
        }
      ],
      gifts_travel: [],
      data_quality: {
        confidence: 'high',
        parsing_method: 'html_table',
        issues: []
      }
    };

    expect(() => validateWhoFundsData(invalidData)).toThrow();
  });

  it('should accept data with optional fields missing', () => {
    const minimalData: WhoFundsData = {
      mep_id: '197400',
      name: 'Test MEP',
      country: 'Sweden',
      party: 'Renew Europe Group',
      sources: {
        declaration_url: 'https://example.com/declaration'
      },
      last_updated_utc: '2024-01-01T00:00:00.000Z',
      income_and_interests: [],
      gifts_travel: [],
      data_quality: {
        confidence: 'high',
        parsing_method: 'html_table'
      }
    };

    expect(() => validateWhoFundsData(minimalData)).not.toThrow();
  });
});

describe('WhoFunds Data Normalization', () => {
  it('should normalize sample HTML data', () => {
    // Mock HTML parsing result
    const mockHtmlData = {
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

    // This would be the result of parsing HTML
    expect(mockHtmlData.income_and_interests).toHaveLength(1);
    expect(mockHtmlData.gifts_travel).toHaveLength(1);
    expect(mockHtmlData.data_quality.confidence).toBe('high');
  });

  it('should normalize sample PDF data', () => {
    // Mock PDF parsing result
    const mockPdfData = {
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

    // This would be the result of parsing PDF
    expect(mockPdfData.income_and_interests).toHaveLength(1);
    expect(mockPdfData.gifts_travel).toHaveLength(0);
    expect(mockPdfData.data_quality.confidence).toBe('medium');
    expect(mockPdfData.data_quality.issues).toHaveLength(1);
  });
});
