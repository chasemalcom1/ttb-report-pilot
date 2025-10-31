
import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, rgb } from 'pdf-lib';
import { format } from 'date-fns';

// TTB Form field mappings and coordinates
export interface TTBFormData {
  reportPeriod: Date;
  registrationNumber: string;
  proprietorName: string;
  proprietorAddress: string;
  einNumber: string;
  inventory: {
    beginningInventory: number;
    production?: number;
    transferIn?: number;
    bottling: number;
    taxWithdrawal: number;
    transferOut?: number;
    loss?: number;
    endingInventory: number;
  };
  operations: Array<{
    date: Date;
    type: string;
    spiritType?: string;
    proofGallons: number;
    proof?: number;
    liters: number;
  }>;
}

// Form 5110.28 field mappings
const FORM_5110_28_FIELDS = {
  // Header fields
  registrationNumber: 'registration_number',
  proprietorName: 'proprietor_name',
  proprietorAddress: 'proprietor_address',
  einNumber: 'ein_number',
  reportPeriod: 'report_period',
  
  // Part I - Processing Operations
  beginningInventory: 'line_1_beginning_inventory',
  bottlingProduction: 'line_2_bottling_production',
  totalLines1And2: 'line_3_total',
  taxWithdrawals: 'line_4_tax_withdrawals',
  endingInventory: 'line_5_ending_inventory',
  
  // Report type checkboxes
  originalReport: 'original_report_checkbox',
  amendedReport: 'amended_report_checkbox',
  finalReport: 'final_report_checkbox'
};

// Form 5110.40 field mappings
const FORM_5110_40_FIELDS = {
  // Header fields
  registrationNumber: 'registration_number',
  proprietorName: 'proprietor_name',
  reportPeriod: 'report_period',
  
  // Part I - Transactions
  beginningInventory: 'line_1_beginning_inventory',
  producedThisMonth: 'line_14_produced',
  enteredProcessing: 'line_9_entered_processing',
  transfersInBond: 'line_10_transfers_in_bond',
  enteredStorage: 'line_11_entered_storage',
  
  // Spirit type classifications
  vodkaProduction: 'vodka_production',
  ginProduction: 'gin_production',
  rumProduction: 'rum_production',
  whiskeyProduction: 'whiskey_production',
  under190Proof: 'under_190_proof',
  over190Proof: 'over_190_proof'
};

// Form 5110.11 field mappings
const FORM_5110_11_FIELDS = {
  // Header fields
  registrationNumber: 'registration_number',
  proprietorName: 'proprietor_name',
  reportPeriod: 'report_period',
  
  // Storage operations by product type
  ginBeginning: 'gin_line_1_beginning',
  ginReceived: 'gin_line_2_received',
  ginWithdrawals: 'gin_line_7_withdrawals',
  ginEnding: 'gin_line_23_ending',
  
  vodkaBeginning: 'vodka_line_1_beginning',
  vodkaReceived: 'vodka_line_2_received',
  vodkaWithdrawals: 'vodka_line_7_withdrawals',
  vodkaEnding: 'vodka_line_23_ending',
  
  whiskeyBeginning: 'whiskey_line_1_beginning',
  whiskeyReceived: 'whiskey_line_2_received',
  whiskeyWithdrawals: 'whiskey_line_7_withdrawals',
  whiskeyEnding: 'whiskey_line_23_ending'
};

export class TTBPDFService {
  
  // Generate a filled PDF for Form 5110.28
  async generateForm5110_28(data: TTBFormData): Promise<Uint8Array> {
    console.log('Generating TTB Form 5110.28 PDF with data:', data);
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    
    const { width, height } = page.getSize();
    const fontSize = 10;
    
    // Draw form header
    page.drawText('TTB FORM 5110.28', {
      x: width / 2 - 60,
      y: height - 50,
      size: 14,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Monthly Report of Processing Operations', {
      x: width / 2 - 100,
      y: height - 70,
      size: 12,
      color: rgb(0, 0, 0),
    });
    
    // Draw form fields
    let yPosition = height - 120;
    
    // Header information
    page.drawText(`Period: ${format(data.reportPeriod, 'MMMM yyyy')}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    
    yPosition -= 20;
    page.drawText(`Registration Number: ${data.registrationNumber}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    
    yPosition -= 20;
    page.drawText(`Proprietor: ${data.proprietorName}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    
    yPosition -= 20;
    page.drawText(`Address: ${data.proprietorAddress}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    
    yPosition -= 40;
    page.drawText('PART I - PROCESSING OPERATIONS', {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 30;
    
    // Processing operations table
    const tableData = [
      ['1. Beginning inventory', data.inventory.beginningInventory.toFixed(1)],
      ['2. Bottling production', data.inventory.bottling.toFixed(1)],
      ['3. Total (Lines 1 & 2)', (data.inventory.beginningInventory + data.inventory.bottling).toFixed(1)],
      ['4. Tax withdrawals', data.inventory.taxWithdrawal.toFixed(1)],
      ['5. Ending inventory', data.inventory.endingInventory.toFixed(1)]
    ];
    
    tableData.forEach(([description, value]) => {
      page.drawText(description, {
        x: 50,
        y: yPosition,
        size: fontSize,
      });
      
      page.drawText(value, {
        x: 400,
        y: yPosition,
        size: fontSize,
      });
      
      yPosition -= 20;
    });
    
    // Add operations detail section
    yPosition -= 30;
    page.drawText('OPERATIONS DETAIL', {
      x: 50,
      y: yPosition,
      size: 12,
    });
    
    yPosition -= 20;
    page.drawText('Date', { x: 50, y: yPosition, size: 9 });
    page.drawText('Type', { x: 120, y: yPosition, size: 9 });
    page.drawText('Proof', { x: 200, y: yPosition, size: 9 });
    page.drawText('Liters', { x: 250, y: yPosition, size: 9 });
    page.drawText('Proof Gallons', { x: 320, y: yPosition, size: 9 });
    
    yPosition -= 15;
    
    // List operations (limited to fit on page)
    data.operations.slice(0, 15).forEach(op => {
      page.drawText(format(op.date, 'MM/dd/yyyy'), { x: 50, y: yPosition, size: 8 });
      page.drawText(op.type, { x: 120, y: yPosition, size: 8 });
      page.drawText((op.proof || 0).toString(), { x: 200, y: yPosition, size: 8 });
      page.drawText(op.liters.toFixed(1), { x: 250, y: yPosition, size: 8 });
      page.drawText(op.proofGallons.toFixed(1), { x: 320, y: yPosition, size: 8 });
      yPosition -= 12;
    });
    
    return await pdfDoc.save();
  }
  
  // Generate a filled PDF for Form 5110.40
  async generateForm5110_40(data: TTBFormData): Promise<Uint8Array> {
    console.log('Generating TTB Form 5110.40 PDF with data:', data);
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    // Draw form header
    page.drawText('TTB FORM 5110.40', {
      x: width / 2 - 60,
      y: height - 50,
      size: 14,
    });
    
    page.drawText('Monthly Report of Production Operations', {
      x: width / 2 - 110,
      y: height - 70,
      size: 12,
    });
    
    let yPosition = height - 120;
    
    // Header information
    page.drawText(`Period: ${format(data.reportPeriod, 'MMMM yyyy')}`, {
      x: 50,
      y: yPosition,
      size: 10,
    });
    
    yPosition -= 20;
    page.drawText(`Registration Number: ${data.registrationNumber}`, {
      x: 50,
      y: yPosition,
      size: 10,
    });
    
    yPosition -= 40;
    page.drawText('PART I - TRANSACTIONS', {
      x: 50,
      y: yPosition,
      size: 12,
    });
    
    yPosition -= 30;
    
    // Production operations
    const productionData = [
      ['14. Produced this month', (data.inventory.production || 0).toFixed(1)],
      ['9. Entered for processing', data.inventory.bottling.toFixed(1)],
      ['11. Entered for storage', (data.inventory.transferIn || 0).toFixed(1)]
    ];
    
    productionData.forEach(([description, value]) => {
      page.drawText(description, {
        x: 50,
        y: yPosition,
        size: 10,
      });
      
      page.drawText(value, {
        x: 400,
        y: yPosition,
        size: 10,
      });
      
      yPosition -= 20;
    });
    
    return await pdfDoc.save();
  }
  
  // Generate a filled PDF for Form 5110.11
  async generateForm5110_11(data: TTBFormData): Promise<Uint8Array> {
    console.log('Generating TTB Form 5110.11 PDF with data:', data);
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    // Draw form header
    page.drawText('TTB FORM 5110.11', {
      x: width / 2 - 60,
      y: height - 50,
      size: 14,
    });
    
    page.drawText('Monthly Report of Storage Operations', {
      x: width / 2 - 100,
      y: height - 70,
      size: 12,
    });
    
    let yPosition = height - 120;
    
    // Header information
    page.drawText(`Period: ${format(data.reportPeriod, 'MMMM yyyy')}`, {
      x: 50,
      y: yPosition,
      size: 10,
    });
    
    yPosition -= 40;
    page.drawText('STORAGE OPERATIONS BY PRODUCT', {
      x: 50,
      y: yPosition,
      size: 12,
    });
    
    yPosition -= 30;
    
    // Storage operations table
    const storageData = [
      ['1. Beginning inventory', data.inventory.beginningInventory.toFixed(1)],
      ['2. Received from production', (data.inventory.production || 0).toFixed(1)],
      ['3. Transfer in', (data.inventory.transferIn || 0).toFixed(1)],
      ['17. Transfer to processing', data.inventory.bottling.toFixed(1)],
      ['22. Losses', (data.inventory.loss || 0).toFixed(1)],
      ['23. Ending inventory', data.inventory.endingInventory.toFixed(1)]
    ];
    
    storageData.forEach(([description, value]) => {
      page.drawText(description, {
        x: 50,
        y: yPosition,
        size: 10,
      });
      
      page.drawText(value, {
        x: 400,
        y: yPosition,
        size: 10,
      });
      
      yPosition -= 20;
    });
    
    return await pdfDoc.save();
  }
  
  // Download PDF file
  downloadPDF(pdfBytes: Uint8Array, filename: string): void {
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const ttbPDFService = new TTBPDFService();
