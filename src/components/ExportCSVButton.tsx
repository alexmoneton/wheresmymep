'use client';

import { useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Download } from 'lucide-react';
import { exportTableAsCSV, exportVotesAsCSV, findExportableTable, findExportableElement } from '@/lib/csv-export';

interface ExportCSVButtonProps {
  filename: string;
  selector?: string;
  className?: string;
}

export function ExportCSVButton({ filename, selector, className }: ExportCSVButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let element: HTMLElement | null = null;
      
      if (selector) {
        element = findExportableElement(selector);
      } else {
        element = findExportableTable();
      }
      
      if (!element) {
        console.warn('No exportable element found on the page');
        return;
      }
      
      // Check if it's a table or votes container
      if (element.tagName === 'TABLE') {
        exportTableAsCSV(element as HTMLTableElement, filename);
      } else {
        exportVotesAsCSV(element, filename);
      }
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
}