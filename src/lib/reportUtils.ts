
import { Operation } from './types';
import { MOCK_OPERATIONS } from './models';

/**
 * Calculate the current inventory for a specific date range
 * @param startDate beginning of the period
 * @param endDate end of the period
 * @param beginningInventory the initial inventory value
 * @returns calculated ending inventory based on operations
 */
export const calculateInventory = (
  startDate: Date, 
  endDate: Date, 
  beginningInventory: number = 0
): {
  beginningInventory: number;
  production: number;
  transferIn: number;
  bottling: number;
  taxWithdrawal: number;
  transferOut: number;
  loss: number;
  endingInventory: number;
} => {
  console.log('Calculating inventory for period:', startDate, 'to', endDate);
  console.log('Beginning inventory:', beginningInventory);
  
  // Filter operations for the specified date range
  const periodOperations = MOCK_OPERATIONS.filter(
    op => op.date >= startDate && op.date <= endDate
  );
  
  console.log('Operations in period:', periodOperations);
  
  // Calculate values from operations
  const production = sumOperationsByType(periodOperations, 'production');
  const transferIn = sumOperationsByType(periodOperations, 'transfer_in');
  const bottling = sumOperationsByType(periodOperations, 'bottling');
  const taxWithdrawal = sumOperationsByType(periodOperations, 'tax_withdrawal');
  const transferOut = sumOperationsByType(periodOperations, 'transfer_out');
  const loss = sumOperationsByType(periodOperations, 'loss') || 1.8; // Default loss if no loss operations
  
  // Calculate ending inventory
  const endingInventory = beginningInventory + production + transferIn - bottling - taxWithdrawal - transferOut - loss;
  
  const result = {
    beginningInventory,
    production,
    transferIn,
    bottling,
    taxWithdrawal,
    transferOut,
    loss,
    endingInventory
  };
  
  console.log('Calculated inventory:', result);
  
  return result;
};

/**
 * Calculate processing operations specific to Form 5110.28
 */
export const calculateProcessingOperations = (
  startDate: Date, 
  endDate: Date, 
  beginningInventory: number = 200.5
): {
  beginningInventory: number;
  bottling: number;
  taxWithdrawal: number;
  endingInventory: number;
} => {
  console.log('Calculating processing operations for period:', startDate, 'to', endDate);
  
  const periodOperations = MOCK_OPERATIONS.filter(
    op => op.date >= startDate && op.date <= endDate
  );
  
  const bottling = sumOperationsByType(periodOperations, 'bottling');
  const taxWithdrawal = sumOperationsByType(periodOperations, 'tax_withdrawal');
  
  const endingInventory = beginningInventory + bottling - taxWithdrawal;
  
  const result = {
    beginningInventory,
    bottling,
    taxWithdrawal,
    endingInventory
  };
  
  console.log('Calculated processing operations:', result);
  return result;
};

/**
 * Calculate storage operations specific to Form 5110.11
 */
export const calculateStorageOperations = (
  startDate: Date, 
  endDate: Date, 
  beginningInventory: number = 310.2
): {
  beginningInventory: number;
  production: number;
  transferIn: number;
  bottling: number;
  loss: number;
  endingInventory: number;
} => {
  console.log('Calculating storage operations for period:', startDate, 'to', endDate);
  
  const periodOperations = MOCK_OPERATIONS.filter(
    op => op.date >= startDate && op.date <= endDate
  );
  
  const production = sumOperationsByType(periodOperations, 'production');
  const transferIn = sumOperationsByType(periodOperations, 'transfer_in');
  const bottling = sumOperationsByType(periodOperations, 'bottling');
  const loss = sumOperationsByType(periodOperations, 'loss') || 1.8;
  
  const endingInventory = beginningInventory + production + transferIn - bottling - loss;
  
  const result = {
    beginningInventory,
    production,
    transferIn,
    bottling,
    loss,
    endingInventory
  };
  
  console.log('Calculated storage operations:', result);
  return result;
};

// Helper function to sum operations by type
const sumOperationsByType = (operations: Operation[], type: Operation['type']): number => {
  const total = operations
    .filter(op => op.type === type)
    .reduce((sum, op) => sum + op.proofGallons, 0);
  
  console.log(`Sum for ${type}:`, total);
  return total;
};
