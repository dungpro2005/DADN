// Utility functions for exporting report data

export interface ReportData {
  timestamp: string;
  metrics: Record<string, any>;
  filters: Record<string, any>;
}

// Export to CSV
export const exportToCSV = (
  data: any[],
  filename: string,
  columns?: string[]
) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get column headers
  const headers = columns || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to JSON
export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate PDF report (basic HTML-based)
export const generatePDFReport = (
  title: string,
  content: string,
  filename: string
) => {
  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) {
    console.error('Unable to open print window');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #1f2937;
          border-bottom: 2px solid #f97316;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .report-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .report-footer {
          margin-top: 30px;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <h1>${title}</h1>
        <p>Ngày tạo báo cáo: ${new Date().toLocaleString('vi-VN')}</p>
      </div>
      <div class="report-content">
        ${content}
      </div>
      <div class="report-footer">
        <p>Báo cáo được tạo bởi hệ thống quản lý máy sấy</p>
      </div>
      <script>
        window.print();
        window.close();
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

// Format report data for display
export const formatReportData = (
  data: any[],
  dateFormat: 'short' | 'long' = 'short'
): any[] => {
  return data.map(item => ({
    ...item,
    timestamp: item.timestamp
      ? new Date(item.timestamp).toLocaleDateString('vi-VN')
      : '',
  }));
};

// Create summary statistics
export const generateSummaryStats = (data: any[], numericFields: string[]) => {
  const summary: Record<string, any> = {};

  numericFields.forEach(field => {
    const values = data
      .map((item: any) => parseFloat(item[field]))
      .filter((v: number) => !isNaN(v));

    if (values.length > 0) {
      summary[field] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 10) / 10,
        total: values.reduce((a: number, b: number) => a + b, 0),
        count: values.length,
      };
    }
  });

  return summary;
};

// Create HTML table from data
export const createHTMLTable = (
  data: any[],
  columns: string[],
  title?: string
): string => {
  if (!data || data.length === 0) {
    return '<p>Không có dữ liệu</p>';
  }

  const tableRows = data
    .map(
      (row) =>
        `<tr>${columns
          .map((col) => `<td>${row[col] || '-'}</td>`)
          .join('')}</tr>`
    )
    .join('');

  return `
    ${title ? `<h2>${title}</h2>` : ''}
    <table>
      <thead>
        <tr>${columns.map((col) => `<th>${col}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
};
