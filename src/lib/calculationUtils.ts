
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
  console.log(`Calculating sum for ${type} with ${operations.length} total operations`);
  console.log('Date range:', startDate ? startDate.toISOString() : 'no start', 'to', endDate ? endDate.toISOString() : 'no end');
  
  let filteredOperations = operations.filter(op => {
    const typeMatch = op.type === type;
    console.log(`Operation ${op.id}: type=${op.type}, matches=${typeMatch}`);
    return typeMatch;
  });
  
  console.log(`Found ${filteredOperations.length} operations of type ${type}`);
  
  // If date range is provided, filter by date range
  if (startDate && endDate) {
    filteredOperations = filteredOperations.filter(op => {
      const dateInRange = op.date >= startDate && op.date <= endDate;
      console.log(`Operation ${op.id}: date=${op.date.toISOString()}, in range=${dateInRange}`);
      return dateInRange;
    });
    console.log(`After date filtering: ${filteredOperations.length} operations`);
  }
  
  const total = filteredOperations.reduce((sum, op) => {
    console.log(`Adding operation ${op.id}: ${op.proofGallons} PG`);
    return sum + op.proofGallons;
  }, 0);
  
  console.log(`Final sum for ${type}: ${total} PG`);
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
