import { format, startOfMonth, subMonths, addMonths } from 'date-fns';
import { getFromLocalStorage, saveToLocalStorage } from './storageUtils';
import { sumOperationsByType } from './calculationUtils';
import { Operation } from './types';

// Report data interfaces
export interface ReportFormData {
  id: string;
  reportPeriod: Date;
  registrationNumber: string;
  proprietorName: string;
  proprietorAddress: string;
  einNumber: string;
  reportType: 'original' | 'amended' | 'final';
  createdAt: Date;
  updatedAt: Date;
}

export interface Report5110_40Data extends ReportFormData {
  formType: '5110-40';
  inventory: {
    beginningInventory: number;
    production: number;
    transferIn: number;
    bottling: number;
    transferOut: number;
    loss: number;
    endingInventory: number;
  };
}

export interface Report5110_28Data extends ReportFormData {
  formType: '5110-28';  
  inventory: {
    beginningInventory: number;
    bottling: number;
    taxWithdrawal: number;
    endingInventory: number;
  };
}

export interface Report5110_11Data extends ReportFormData {
  formType: '5110-11';
  inventory: {
    beginningInventory: number;
    production: number;
    transferIn: number;
    bottling: number;
    loss: number;
    endingInventory: number;
  };
}

export type ReportData = Report5110_40Data | Report5110_28Data | Report5110_11Data;

// Storage keys
const STORAGE_KEYS = {
  '5110-40': 'reports_5110_40',
  '5110-28': 'reports_5110_28', 
  '5110-11': 'reports_5110_11'
} as const;

// Get current operations from localStorage
function getCurrentOperations(): Operation[] {
  console.log('Getting current operations from localStorage');
  const operations = getFromLocalStorage<Operation>('operations', []);
  console.log(`Found ${operations.length} operations in storage`);
  return operations;
}

// Get all reports for a specific form type
export function getReports<T extends ReportData>(formType: T['formType']): T[] {
  return getFromLocalStorage<T>(STORAGE_KEYS[formType], []);
}

// Get a specific report by month and form type
export function getReportByMonth<T extends ReportData>(
  formType: T['formType'], 
  reportPeriod: Date
): T | null {
  const reports = getReports<T>(formType);
  const monthKey = format(startOfMonth(reportPeriod), 'yyyy-MM');
  
  return reports.find(report => 
    format(startOfMonth(report.reportPeriod), 'yyyy-MM') === monthKey
  ) || null;
}

// Save a report
export function saveReport<T extends ReportData>(report: T): void {
  const reports = getReports<T>(report.formType);
  const monthKey = format(startOfMonth(report.reportPeriod), 'yyyy-MM');
  
  // Remove existing report for the same month if it exists
  const filteredReports = reports.filter(r => 
    format(startOfMonth(r.reportPeriod), 'yyyy-MM') !== monthKey
  );
  
  // Add the new/updated report
  const updatedReports = [...filteredReports, {
    ...report,
    updatedAt: new Date()
  }];
  
  saveToLocalStorage(STORAGE_KEYS[report.formType], updatedReports);
  console.log(`Saved ${report.formType} report for ${monthKey}:`, report);
}

// Calculate inventory data from operations for a given period
export function calculateInventoryFromOperations(
  reportPeriod: Date,
  formType: '5110-40' | '5110-28' | '5110-11'
): any {
  const startDate = startOfMonth(reportPeriod);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  
  // Get previous month's ending inventory
  const previousMonth = subMonths(reportPeriod, 1);
  const previousReport = getReportByMonth(formType, previousMonth);
  
  console.log(`Calculating inventory for ${formType} - ${format(reportPeriod, 'yyyy-MM')}`);
  console.log('Previous report:', previousReport);
  console.log('Date range:', startDate, 'to', endDate);
  
  // Get current operations from localStorage
  const allOperations = getCurrentOperations();
  console.log(`Total operations available: ${allOperations.length}`);
  
  // Filter operations for this month
  const monthOperations = allOperations.filter(op => 
    op.date >= startDate && op.date <= endDate
  );
  
  console.log(`Operations in period ${format(reportPeriod, 'yyyy-MM')}:`, monthOperations.length);
  monthOperations.forEach(op => {
    console.log(`- ${op.type}: ${op.proofGallons} PG on ${op.date.toISOString()}`);
  });
  
  // Base calculations from operations using the filtered month operations
  const production = sumOperationsByType(monthOperations, 'production');
  const transferIn = sumOperationsByType(monthOperations, 'transfer_in');
  const bottling = sumOperationsByType(monthOperations, 'bottling');
  const transferOut = sumOperationsByType(monthOperations, 'transfer_out');
  const taxWithdrawal = sumOperationsByType(monthOperations, 'tax_withdrawal');
  const loss = sumOperationsByType(monthOperations, 'loss') || 0;
  
  // Default beginning inventories (used if no previous report exists)
  const defaultBeginningInventory = {
    '5110-40': 245.6,
    '5110-28': 200.5,
    '5110-11': 310.2
  };
  
  const beginningInventory = previousReport?.inventory.endingInventory || defaultBeginningInventory[formType];
  
  console.log('Beginning inventory:', beginningInventory);
  console.log('Operations totals:', { production, transferIn, bottling, transferOut, taxWithdrawal, loss });
  
  // Form-specific calculations
  switch (formType) {
    case '5110-40':
      const endingInventory40 = beginningInventory + production + transferIn - bottling - transferOut - loss;
      return {
        beginningInventory,
        production,
        transferIn,
        bottling,
        transferOut,
        loss,
        endingInventory: endingInventory40
      };
      
    case '5110-28':
      const endingInventory28 = beginningInventory + bottling - taxWithdrawal;
      return {
        beginningInventory,
        bottling,
        taxWithdrawal,
        endingInventory: endingInventory28
      };
      
    case '5110-11':
      const endingInventory11 = beginningInventory + production + transferIn - bottling - loss;
      return {
        beginningInventory,
        production,
        transferIn,
        bottling,
        loss,
        endingInventory: endingInventory11
      };
      
    default:
      throw new Error(`Unknown form type: ${formType}`);
  }
}

// Create a new report with calculated data
export function createNewReport(
  formType: '5110-40' | '5110-28' | '5110-11',
  reportPeriod: Date,
  additionalData: Partial<ReportFormData> = {}
): ReportData {
  const inventory = calculateInventoryFromOperations(reportPeriod, formType);
  
  const baseReport: ReportFormData = {
    id: `${formType}-${format(reportPeriod, 'yyyy-MM')}-${crypto.randomUUID?.() || Date.now()}`,
    reportPeriod,
    registrationNumber: 'DSP-NY-12345',
    proprietorName: 'Mountain Spirits Distillery',
    proprietorAddress: '123 Main St, Springfield, NY 12345',
    einNumber: 'XX-XXXXXXX',
    reportType: 'original',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...additionalData
  };
  
  switch (formType) {
    case '5110-40':
      return {
        ...baseReport,
        formType: '5110-40',
        inventory
      } as Report5110_40Data;
      
    case '5110-28':
      return {
        ...baseReport,
        formType: '5110-28',
        inventory
      } as Report5110_28Data;
      
    case '5110-11':
      return {
        ...baseReport,
        formType: '5110-11',
        inventory
      } as Report5110_11Data;
      
    default:
      throw new Error(`Unknown form type: ${formType}`);
  }
}

// Get or create a report for a specific month
export function getOrCreateReport<T extends ReportData>(
  formType: T['formType'],
  reportPeriod: Date
): T {
  let report = getReportByMonth<T>(formType, reportPeriod);
  
  if (!report) {
    report = createNewReport(formType, reportPeriod) as T;
    saveReport(report);
    console.log(`Created new ${formType} report for ${format(reportPeriod, 'yyyy-MM')}`);
  } else {
    // Always recalculate inventory from current operations
    const freshInventory = calculateInventoryFromOperations(reportPeriod, formType);
    report = {
      ...report,
      inventory: freshInventory,
      updatedAt: new Date()
    } as T;
    saveReport(report);
    console.log(`Refreshed ${formType} report for ${format(reportPeriod, 'yyyy-MM')}`);
  }
  
  return report;
}

// Update a report's inventory (recalculate from operations)
export function refreshReportInventory<T extends ReportData>(
  formType: T['formType'],
  reportPeriod: Date
): T {
  console.log(`Refreshing ${formType} report inventory for ${format(reportPeriod, 'yyyy-MM')}`);
  
  const currentReport = getReportByMonth<T>(formType, reportPeriod);
  const newInventory = calculateInventoryFromOperations(reportPeriod, formType);
  
  const updatedReport = {
    ...currentReport,
    inventory: newInventory,
    updatedAt: new Date()
  } as T;
  
  if (currentReport) {
    updatedReport.id = currentReport.id;
    updatedReport.createdAt = currentReport.createdAt;
    // Keep other form fields
    updatedReport.registrationNumber = currentReport.registrationNumber;
    updatedReport.proprietorName = currentReport.proprietorName;
    updatedReport.proprietorAddress = currentReport.proprietorAddress;
    updatedReport.einNumber = currentReport.einNumber;
    updatedReport.reportType = currentReport.reportType;
    updatedReport.reportPeriod = currentReport.reportPeriod;
  } else {
    updatedReport.id = `${formType}-${format(reportPeriod, 'yyyy-MM')}-${crypto.randomUUID?.() || Date.now()}`;
    updatedReport.createdAt = new Date();
    updatedReport.registrationNumber = 'DSP-NY-12345';
    updatedReport.proprietorName = 'Mountain Spirits Distillery';
    updatedReport.proprietorAddress = '123 Main St, Springfield, NY 12345';
    updatedReport.einNumber = 'XX-XXXXXXX';
    updatedReport.reportType = 'original';
    updatedReport.reportPeriod = reportPeriod;
  }
  
  saveReport(updatedReport);
  console.log(`Refreshed ${formType} report inventory for ${format(reportPeriod, 'yyyy-MM')}:`, updatedReport);
  
  return updatedReport;
}

// Get list of available report months for a form type
export function getReportMonths(formType: '5110-40' | '5110-28' | '5110-11'): Date[] {
  const reports = getReports(formType);
  return reports
    .map(report => startOfMonth(report.reportPeriod))
    .sort((a, b) => b.getTime() - a.getTime()); // Most recent first
}

// Function to refresh all reports when operations change
export function refreshAllReportsForMonth(reportPeriod: Date): void {
  console.log(`Refreshing all reports for ${format(reportPeriod, 'yyyy-MM')}`);
  
  // Refresh each form type
  refreshReportInventory('5110-40', reportPeriod);
  refreshReportInventory('5110-28', reportPeriod);
  refreshReportInventory('5110-11', reportPeriod);
}
