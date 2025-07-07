
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

// Function to sum operations by type from a pre-filtered array
export function sumOperationsByType(
  operations: Operation[],
  type: OperationType
): number {
  console.log(`Calculating sum for ${type} with ${operations.length} operations`);
  
  const filteredOperations = operations.filter(op => {
    const typeMatch = op.type === type;
    console.log(`Operation ${op.id}: type=${op.type}, matches=${typeMatch}, PG=${op.proofGallons}`);
    return typeMatch;
  });
  
  console.log(`Found ${filteredOperations.length} operations of type ${type}`);
  
  const total = filteredOperations.reduce((sum, op) => {
    console.log(`Adding operation ${op.id}: ${op.proofGallons} PG (${op.liters}L at ${op.proof} proof)`);
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
