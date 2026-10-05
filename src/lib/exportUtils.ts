import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Harvest, MonthlyFarmerSummary, MonthlyGrandTotal, Farmer } from '../types/index.ts';

export const ORG_NAME = 'HIGHLANDS COFFEE GROWERS COOPERATIVE UNION';
export const ORG_TAGLINE = 'Farmer Harvest Collection & Quality Assurance System';
export const ORG_CONTACT = 'P.O. Box 450-30100 Eldoret | Tel: +254 700 123 456 | Email: info@highlandscoffee.co.ke';

// CSV and Excel Export Helper
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitize = (val: string | number) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(','),
    ...rows.map(row => row.map(sanitize).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate PDF Receipt
export function generateReceiptPDF(harvest: Harvest) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // A5 receipt format for mobile & portable printing
  });

  // Header
  doc.setFillColor(34, 84, 61); // Deep coffee emerald
  doc.rect(0, 0, 148, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(ORG_NAME, 74, 10, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL COFFEE COLLECTION RECEIPT', 74, 16, { align: 'center' });
  doc.text(ORG_CONTACT, 74, 21, { align: 'center' });

  // Receipt Number & Date Box
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`RECEIPT NO: ${harvest.receipt_number}`, 14, 32);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${harvest.collection_date}`, 134, 32, { align: 'right' });
  doc.text(`Collection Point: ${harvest.satellite}`, 14, 38);
  doc.text(`Recorded By: ${harvest.recorded_by}`, 134, 38, { align: 'right' });

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 42, 134, 42);

  // Farmer Details
  doc.setFont('helvetica', 'bold');
  doc.text('FARMER PARTICULARS', 14, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(`Farmer Name: ${harvest.farmer_name}`, 14, 54);
  doc.text(`Farmer ID / Code: ${harvest.farmer_id}`, 134, 54, { align: 'right' });
  doc.text(`Group: ${harvest.group}`, 14, 60);

  // Harvest Breakdown Table
  const tableData = [
    ['Cherry Heavy (CH)', `${harvest.cherry_heavy.toFixed(1)} kg`],
    ['Cherry Light (CL)', `${harvest.cherry_light.toFixed(1)} kg`],
    ['Mbuni (MB)', `${harvest.mbuni.toFixed(1)} kg`],
  ];

  autoTable(doc, {
    startY: 66,
    head: [['Coffee Category', 'Net Delivered Weight (kg)']],
    body: tableData,
    foot: [['TOTAL KILOGRAMS', `${harvest.total_kg.toFixed(1)} kg`]],
    theme: 'grid',
    headStyles: { fillColor: [44, 98, 70], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [240, 245, 240], textColor: [20, 70, 40], fontStyle: 'bold', fontSize: 11 },
    styles: { fontSize: 9, cellPadding: 3.5 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Remarks
  if (harvest.remarks) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Remarks: ${harvest.remarks}`, 14, finalY);
  }

  // Signatures section
  const sigY = finalY + 18;
  doc.setDrawColor(120, 120, 120);
  doc.line(14, sigY, 65, sigY);
  doc.line(83, sigY, 134, sigY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Farmer Signature', 39, sigY + 5, { align: 'center' });
  doc.text('Collection Officer Signature', 108, sigY + 5, { align: 'center' });

  // Security barcode text simulation
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(`* ${harvest.receipt_number} * OFFICIAL ORIGINAL COPY *`, 74, sigY + 16, { align: 'center' });

  doc.save(`Receipt_${harvest.receipt_number}.pdf`);
}

// Generate Farmer Monthly Slip PDF
export function generateFarmerSlipPDF(
  farmer: Farmer,
  monthName: string,
  year: number,
  deliveries: Harvest[],
  summary: { heavy: number; light: number; mbuni: number; total: number }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(34, 84, 61);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(ORG_NAME, 105, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('COFFEE HARVEST COLLECTION STATEMENT', 105, 19, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Statement Period: ${monthName} ${year}`, 105, 25, { align: 'center' });

  // Farmer Information Card
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FARMER PARTICULARS', 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Farmer Name: ${farmer.farmer_name}`, 14, 45);
  doc.text(`Farmer ID / Code: ${farmer.farmer_id}`, 110, 45);
  doc.text(`Group: ${farmer.group}`, 14, 52);
  doc.text(`Satellite / Centre: ${farmer.satellite}`, 110, 52);
  doc.text(`Farm / Member No: ${farmer.farm_member_number || 'N/A'}`, 14, 59);
  doc.text(`Status: ${farmer.status}`, 110, 59);

  // Table of deliveries
  const rows = deliveries.map(d => [
    d.collection_date,
    d.receipt_number,
    d.cherry_heavy.toFixed(1),
    d.cherry_light.toFixed(1),
    d.mbuni.toFixed(1),
    d.total_kg.toFixed(1),
    d.recorded_by,
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['Date', 'Receipt #', 'Heavy kg', 'Light kg', 'Mbuni kg', 'Total kg', 'Officer']],
    body: rows,
    foot: [
      [
        'MONTHLY TOTAL',
        `${deliveries.length} Deliveries`,
        `${summary.heavy.toFixed(1)} kg`,
        `${summary.light.toFixed(1)} kg`,
        `${summary.mbuni.toFixed(1)} kg`,
        `${summary.total.toFixed(1)} kg`,
        '',
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: [44, 98, 70], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [230, 244, 234], textColor: [20, 70, 40], fontStyle: 'bold', fontSize: 10 },
    styles: { fontSize: 8.5, cellPadding: 3 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  // Highlight Total
  doc.setFillColor(245, 247, 245);
  doc.roundedRect(14, finalY, 182, 18, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 70, 40);
  doc.text(`FARMER GRAND TOTAL DELIVERED: ${summary.total.toFixed(1)} KG`, 105, finalY + 11, { align: 'center' });

  // Signatures
  const sigY = finalY + 40;
  doc.setTextColor(60, 60, 60);
  doc.setDrawColor(100, 100, 100);
  doc.line(20, sigY, 75, sigY);
  doc.line(85, sigY, 135, sigY);
  doc.line(145, sigY, 190, sigY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Farmer Signature', 47.5, sigY + 5, { align: 'center' });
  doc.text('Collection Officer Signature', 110, sigY + 5, { align: 'center' });
  doc.text('Date', 167.5, sigY + 5, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text('Generated from KahawaHarvest Mobile System. Retain this slip for seasonal payment verification.', 105, 285, { align: 'center' });

  doc.save(`FarmerSlip_${farmer.farmer_id}_${monthName}_${year}.pdf`);
}

// Generate Monthly Organization / Group / Satellite Report PDF
export function generateMonthlyReportPDF(
  reportTitle: string,
  periodText: string,
  filterDesc: string,
  summaries: MonthlyFarmerSummary[],
  grandTotal: MonthlyGrandTotal
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFillColor(34, 84, 61);
  doc.rect(0, 0, 297, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(ORG_NAME, 148.5, 10, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(reportTitle.toUpperCase(), 148.5, 17, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Period: ${periodText} | Scope: ${filterDesc}`, 148.5, 23, { align: 'center' });

  const tableRows = summaries.map((s, idx) => [
    idx + 1,
    s.farmer_id,
    s.farmer_name,
    s.group,
    s.satellite,
    s.delivery_count,
    s.heavy_total.toFixed(1),
    s.light_total.toFixed(1),
    s.mbuni_total.toFixed(1),
    s.overall_total.toFixed(1),
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[
      '#',
      'Farmer ID',
      'Farmer Name',
      'Group',
      'Satellite',
      'Deliveries',
      'Heavy (kg)',
      'Light (kg)',
      'Mbuni (kg)',
      'Total Kg',
    ]],
    body: tableRows,
    foot: [[
      'GRAND TOTAL',
      '',
      `${summaries.length} Farmers`,
      '',
      '',
      `${grandTotal.delivery_count} Total Deliv`,
      `${grandTotal.heavy_total.toFixed(1)} kg`,
      `${grandTotal.light_total.toFixed(1)} kg`,
      `${grandTotal.mbuni_total.toFixed(1)} kg`,
      `${grandTotal.grand_total.toFixed(1)} kg`,
    ]],
    theme: 'grid',
    headStyles: { fillColor: [44, 98, 70], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    footStyles: { fillColor: [225, 242, 230], textColor: [15, 65, 35], fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleString()} | Official Cooperative Audit Report`, 14, Math.min(finalY, 200));

  doc.save(`${reportTitle.replace(/\s+/g, '_')}_${periodText}.pdf`);
}
