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
 * Convert a div with vote cards to CSV data
 * @param container - The HTML div element containing vote cards
 * @returns CSV string
 */
export function votesToCSV(container: HTMLElement): string {
  const rows: string[] = [];
  
  // Add header row
  rows.push('Title,Date,Position,Result,Source');
  
  // Get all vote cards
  const voteCards = container.querySelectorAll('[data-exportable="true"] > div');
  
  voteCards.forEach((card) => {
    const cells: string[] = [];
    
    // Extract title
    const titleEl = card.querySelector('h3');
    const title = titleEl ? titleEl.textContent || '' : '';
    
    // Extract date
    const dateEl = card.querySelector('span');
    const date = dateEl ? dateEl.textContent || '' : '';
    
    // Extract position
    const positionEl = card.querySelector('.px-2.py-1.rounded');
    const position = positionEl ? positionEl.textContent || '' : '';
    
    // Extract result
    const resultEl = card.querySelector('.text-sm.text-gray-600');
    const result = resultEl ? resultEl.textContent || '' : '';
    
    // Extract source (link)
    const linkEl = card.querySelector('a[href]');
    const source = linkEl ? linkEl.getAttribute('href') || '' : '';
    
    // Clean and escape each cell
    [title, date, position, result, source].forEach(text => {
      let cleanText = text.replace(/\s+/g, ' ').trim();
      if (cleanText.includes(',') || cleanText.includes('"') || cleanText.includes('\n')) {
        cleanText = `"${cleanText.replace(/"/g, '""')}"`;
      }
      cells.push(cleanText);
    });
    
    if (cells.some(cell => cell.trim() !== '')) {
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
 * Export votes as CSV and download it
 * @param container - The HTML element containing vote cards
 * @param filename - The filename for the download (without .csv extension)
 */
export function exportVotesAsCSV(container: HTMLElement, filename: string): void {
  const csvData = votesToCSV(container);
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

/**
 * Find an exportable element by selector
 * @param selector - CSS selector for the element
 * @returns The element or null
 */
export function findExportableElement(selector: string): HTMLElement | null {
  const element = document.querySelector(selector) as HTMLElement;
  return element;
}