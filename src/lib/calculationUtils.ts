
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

// Overloaded function signatures to support both use cases
export function sumOperationsByType(
  operations: Operation[],
  type: OperationType
): number;

export function sumOperationsByType(
  operations: Operation[],
  type: OperationType,
  startDate: Date,
  endDate: Date
): number;

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
  
  return filteredOperations.reduce((sum, op) => sum + op.proofGallons, 0);
}
