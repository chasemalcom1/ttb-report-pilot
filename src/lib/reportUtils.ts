
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
  // Filter operations for the specified date range
  const periodOperations = MOCK_OPERATIONS.filter(
    op => op.date >= startDate && op.date <= endDate
  );
  
  // Calculate values from operations
  const production = sumOperationsByType(periodOperations, 'production');
  const transferIn = sumOperationsByType(periodOperations, 'transfer_in');
  const bottling = sumOperationsByType(periodOperations, 'bottling');
  const taxWithdrawal = sumOperationsByType(periodOperations, 'tax_withdrawal');
  const transferOut = sumOperationsByType(periodOperations, 'transfer_out');
  const loss = sumOperationsByType(periodOperations, 'loss') || 1.8; // Default loss if no loss operations
  
  // Calculate ending inventory
  const endingInventory = beginningInventory + production + transferIn - bottling - taxWithdrawal - transferOut - loss;
  
  return {
    beginningInventory,
    production,
    transferIn,
    bottling,
    taxWithdrawal,
    transferOut,
    loss,
    endingInventory
  };
};

// Helper function to sum operations by type
const sumOperationsByType = (operations: Operation[], type: Operation['type']): number => {
  return operations
    .filter(op => op.type === type)
    .reduce((sum, op) => sum + op.proofGallons, 0);
};
