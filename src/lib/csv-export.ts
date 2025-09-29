/**
 * CSV export utilities for client-side data export
 */

/**
 * Convert a table element to CSV data
 * @param table - The HTML table element to export
 * @returns CSV string
 */
export function tableToCSV(table: HTMLTableElement): string {
  const rows: string[] = [];
  
  // Get all rows (including header)
  const tableRows = table.querySelectorAll('tr');
  
  tableRows.forEach((row) => {
    const cells: string[] = [];
    const cellElements = row.querySelectorAll('td, th');
    
    cellElements.forEach((cell) => {
      // Get text content and clean it up
      let text = cell.textContent || '';
      
      // Remove extra whitespace and newlines
      text = text.replace(/\s+/g, ' ').trim();
      
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        text = `"${text.replace(/"/g, '""')}"`;
      }
      
      cells.push(text);
    });
    
    if (cells.length > 0) {
      rows.push(cells.join(','));
    }
  });
  
  return rows.join('\n');
}

/**
 * Download CSV data as a file
 * @param csvData - The CSV string to download
 * @param filename - The filename for the download
 */
export function downloadCSV(csvData: string, filename: string): void {
  // Create blob with CSV data
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export a table as CSV and download it
 * @param table - The HTML table element to export
 * @param filename - The filename for the download (without .csv extension)
 */
export function exportTableAsCSV(table: HTMLTableElement, filename: string): void {
  const csvData = tableToCSV(table);
  const fullFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadCSV(csvData, fullFilename);
}

/**
 * Find the first exportable table on the page
 * @returns The first table with data-exportable="true" or null
 */
export function findExportableTable(): HTMLTableElement | null {
  const table = document.querySelector('table[data-exportable="true"]') as HTMLTableElement;
  return table;
}