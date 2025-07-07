
import { Operation, OperationType } from './types';

// Utility functions for calculations
export const literToProofGallon = (liters: number, proof: number): number => {
  // Convert liters to gallons (1 liter = 0.264172 gallons)
  const gallons = liters * 0.264172;
  // Calculate proof gallons
  const proofGallons = (gallons * proof) / 100;
  // Round to 1 decimal place
  return Math.round(proofGallons * 10) / 10;
};

// Function to sum operations by type with optional date filtering
export function sumOperationsByType(
  operations: Operation[],
  type: OperationType,
  startDate?: Date,
  endDate?: Date
): number {
  let filteredOperations = operations.filter(op => op.type === type);
  
  // If date range is provided, filter by date range
  if (startDate && endDate) {
    filteredOperations = filteredOperations.filter(
      op => op.date >= startDate && op.date <= endDate
    );
  }
  
  const total = filteredOperations.reduce((sum, op) => sum + op.proofGallons, 0);
  console.log(`Sum for ${type} (${startDate ? format(startDate, 'yyyy-MM-dd') : 'all'} to ${endDate ? format(endDate, 'yyyy-MM-dd') : 'all'}):`, total);
  return total;
}

// Helper function to format dates
function format(date: Date, formatStr: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (formatStr === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`;
  }
  
  return date.toISOString();
}
