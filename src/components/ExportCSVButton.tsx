'use client';

import { useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Download } from 'lucide-react';
import { exportTableAsCSV, findExportableTable } from '@/lib/csv-export';

interface ExportCSVButtonProps {
  filename: string;
  className?: string;
}

export function ExportCSVButton({ filename, className }: ExportCSVButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const table = findExportableTable();
      
      if (!table) {
        console.warn('No exportable table found on the page');
        return;
      }
      
      exportTableAsCSV(table, filename);
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