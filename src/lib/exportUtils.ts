/**
 * Export and Document Reporting Utilities
 * Generates structured Excel (.xls XML / .csv) and clinical-grade PDF reports.
 */

export interface ExportColumn {
  header: string;
  key: string;
  width?: number; // Approximate width in characters for Excel
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'date';
}

export interface SummaryMetric {
  label: string;
  value: string | number;
  subtext?: string;
}

export interface ReportExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  period?: string;
  generatedBy?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  summaryMetrics?: SummaryMetric[];
  notes?: string;
}

/**
 * Clean and format value for spreadsheet cells
 */
function sanitizeCellValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'Ya' : 'Tidak';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val).trim();
}

/**
 * 1. Export Data to Clean CSV with UTF-8 BOM
 */
export function exportToCsv(options: ReportExportOptions): void {
  const { filename, columns, data } = options;

  const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(';');

  const rows = data.map((item) =>
    columns
      .map((col) => {
        const rawVal = sanitizeCellValue(item[col.key]);
        return `"${rawVal.replace(/"/g, '""')}"`;
      })
      .join(';')
  );

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerFileDownload(blob, `${filename}.csv`);
}

/**
 * 2. Export Data to Native Excel XML Spreadsheet (.xls)
 * Opens cleanly in Microsoft Excel, Google Sheets, and LibreOffice with proper headers, styles, and widths.
 */
export function exportToExcelXml(options: ReportExportOptions): void {
  const {
    filename,
    title,
    subtitle,
    period,
    generatedBy = 'Administrator',
    columns,
    data,
    summaryMetrics,
  } = options;

  const generatedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#4A154B"/>
  </Style>
  <Style ss:ID="Subtitle">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="KpiLabel">
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#475569"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="KpiValue">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4A154B" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#330D33"/>
   </Borders>
  </Style>
  <Style ss:ID="CellLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="CellRight">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="CellZebraLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="CellZebraCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="CellZebraRight">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Laporan">
  <Table>
`;

  // Define Column widths
  columns.forEach((col) => {
    const width = Math.max(80, (col.width || 15) * 8);
    xml += `   <Column ss:Width="${width}"/>\n`;
  });

  // Report Header Title
  xml += `   <Row ss:Height="24">
    <Cell ss:StyleID="Title"><Data ss:Type="String">${escapeXml(title)}</Data></Cell>
   </Row>\n`;

  if (subtitle || period) {
    const sub = [subtitle, period ? `Periode: ${period}` : ''].filter(Boolean).join(' | ');
    xml += `   <Row ss:Height="16">
    <Cell ss:StyleID="Subtitle"><Data ss:Type="String">${escapeXml(sub)}</Data></Cell>
   </Row>\n`;
  }

  xml += `   <Row ss:Height="16">
    <Cell ss:StyleID="Subtitle"><Data ss:Type="String">Diterbitkan oleh: ${escapeXml(generatedBy)} | Waktu: ${escapeXml(generatedDate)} WIB</Data></Cell>
   </Row>\n`;

  xml += `   <Row ss:Height="10"></Row>\n`;

  // Optional KPI Metrics row
  if (summaryMetrics && summaryMetrics.length > 0) {
    xml += `   <Row ss:Height="18">\n`;
    summaryMetrics.forEach((m) => {
      xml += `    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">${escapeXml(m.label)}</Data></Cell>\n`;
    });
    xml += `   </Row>\n`;

    xml += `   <Row ss:Height="20">\n`;
    summaryMetrics.forEach((m) => {
      xml += `    <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${escapeXml(String(m.value))}</Data></Cell>\n`;
    });
    xml += `   </Row>\n`;
    xml += `   <Row ss:Height="12"></Row>\n`;
  }

  // Table Headers
  xml += `   <Row ss:Height="26">\n`;
  columns.forEach((col) => {
    xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>\n`;
  });
  xml += `   </Row>\n`;

  // Data Rows
  data.forEach((row, rowIndex) => {
    const isZebra = rowIndex % 2 === 1;
    xml += `   <Row ss:Height="20">\n`;

    columns.forEach((col) => {
      const val = sanitizeCellValue(row[col.key]);
      const align = col.align || 'left';

      let styleId: string;
      if (align === 'center') {
        styleId = isZebra ? 'CellZebraCenter' : 'CellCenter';
      } else if (align === 'right') {
        styleId = isZebra ? 'CellZebraRight' : 'CellRight';
      } else {
        styleId = isZebra ? 'CellZebraLeft' : 'CellLeft';
      }

      // Check if numeric
      const isNum = !isNaN(Number(val)) && val !== '' && !val.startsWith('0') && col.format === 'number';

      xml += `    <Cell ss:StyleID="${styleId}"><Data ss:Type="${isNum ? 'Number' : 'String'}">${escapeXml(val)}</Data></Cell>\n`;
    });

    xml += `   </Row>\n`;
  });

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerFileDownload(blob, `${filename}.xls`);
}

/**
 * 3. Print / Export to Clinical PDF Report
 * Generates an executive-ready layout with letterhead, summary stats, and table.
 */
export function printPdfReport(options: ReportExportOptions): void {
  const {
    title,
    subtitle,
    period,
    generatedBy = 'Administrator Operasional',
    columns,
    data,
    summaryMetrics,
    notes,
  } = options;

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Pop-up terblokir oleh peramban. Izinkan pop-up untuk mencetak atau mengekspor PDF.');
    return;
  }

  const kpisHtml =
    summaryMetrics && summaryMetrics.length > 0
      ? `
    <div class="kpi-grid">
      ${summaryMetrics
        .map(
          (m) => `
        <div class="kpi-card">
          <div class="kpi-label">${escapeHtml(m.label)}</div>
          <div class="kpi-value">${escapeHtml(String(m.value))}</div>
          ${m.subtext ? `<div class="kpi-subtext">${escapeHtml(m.subtext)}</div>` : ''}
        </div>
      `
        )
        .join('')}
    </div>
  `
      : '';

  const tableHeaderHtml = columns
    .map(
      (c) =>
        `<th style="text-align: ${c.align || 'left'}; width: ${c.width ? c.width * 7 + 'px' : 'auto'}">${escapeHtml(
          c.header
        )}</th>`
    )
    .join('');

  const tableRowsHtml = data
    .map(
      (row, idx) => `
      <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
        ${columns
          .map((col) => {
            const val = sanitizeCellValue(row[col.key]);
            return `<td style="text-align: ${col.align || 'left'}">${escapeHtml(val)}</td>`;
          })
          .join('')}
      </tr>
    `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} - Rekapitulasi Soulaide</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 20px;
      font-size: 11px;
      line-height: 1.4;
    }
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #4a154b;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #4a154b;
      letter-spacing: -0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-tagline {
      font-size: 10px;
      color: #64748b;
      font-weight: 500;
      margin-top: 2px;
    }
    .report-meta {
      text-align: right;
      font-size: 10px;
      color: #475569;
    }
    .report-title-section {
      margin-bottom: 14px;
    }
    .report-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 3px 0;
    }
    .report-subtitle {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
      margin-bottom: 16px;
    }
    .kpi-card {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .kpi-label {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
    }
    .kpi-value {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .kpi-subtext {
      font-size: 9px;
      color: #94a3b8;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 8px;
    }
    th {
      background-color: #4a154b;
      color: #ffffff;
      font-weight: 700;
      padding: 7px 8px;
      border: 1px solid #4a154b;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }
    tr.zebra td {
      background-color: #f8fafc;
    }
    tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .footer-section {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      break-inside: avoid;
      page-break-inside: avoid;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    .notes-box {
      font-size: 9.5px;
      color: #64748b;
      max-width: 60%;
    }
    .signature-box {
      text-align: center;
      min-width: 180px;
    }
    .signature-line {
      margin-top: 45px;
      border-top: 1px solid #475569;
      padding-top: 4px;
      font-weight: 700;
      font-size: 10px;
      color: #0f172a;
    }
    .signature-title {
      font-size: 9px;
      color: #64748b;
    }
    .print-bar {
      background: #f1f5f9;
      border-bottom: 1px solid #cbd5e1;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .btn-print {
      background: #4a154b;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
    @media print {
      .print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span style="font-size: 11px; font-weight: 600; color: #334155;">
      Pratinjau Dokumen Siap Cetak (A4 Landscape)
    </span>
    <div>
      <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
      <button class="btn-print" style="background: #64748b; margin-left: 6px;" onclick="window.close()">Tutup</button>
    </div>
  </div>

  <div class="header-container">
    <div>
      <h1 class="brand-title">SOULAIDE</h1>
      <div class="brand-tagline">Layanan Psikologi &amp; Konseling Kesehatan Mental Terpadu</div>
    </div>
    <div class="report-meta">
      <div><strong>Dokumen Resmi Operasional</strong></div>
      <div>Waktu Cetak: ${escapeHtml(printDate)} WIB</div>
      ${period ? `<div>Rentang: <strong>${escapeHtml(period)}</strong></div>` : ''}
    </div>
  </div>

  <div class="report-title-section">
    <h2 class="report-title">${escapeHtml(title)}</h2>
    ${subtitle ? `<p class="report-subtitle">${escapeHtml(subtitle)}</p>` : ''}
  </div>

  ${kpisHtml}

  <table>
    <thead>
      <tr>${tableHeaderHtml}</tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>

  <div class="footer-section">
    <div class="notes-box">
      ${notes ? `<strong>Catatan:</strong> ${escapeHtml(notes)}<br>` : ''}
      <em>Dokumen ini dicetak secara otomatis dari Portal Resmi Soulaide. Data bersifat rahasia dan digunakan untuk keperluan evaluasi operasional &amp; manajerial klinik.</em>
    </div>
    <div class="signature-box">
      <div>Mengetahui,</div>
      <div class="signature-line">${escapeHtml(generatedBy)}</div>
      <div class="signature-title">Penanggung Jawab Operasional</div>
    </div>
  </div>

  <script>
    // Automatically open print dialog
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Helper to trigger browser file download
 */
function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
