
import { Spirit, Batch, Operation, Report } from './types';
import { INITIAL_MOCK_SPIRITS, INITIAL_MOCK_BATCHES, INITIAL_MOCK_OPERATIONS, INITIAL_MOCK_REPORTS } from './mockData';
import { getFromLocalStorage, saveToLocalStorage } from './storageUtils';
import { literToProofGallon, sumOperationsByType } from './calculationUtils';

// Re-export types
export type { SpiritType, OperationType, Spirit, Batch, Operation, Report } from './types';

// Export utility functions
export { literToProofGallon, sumOperationsByType };

// Export the persisted data
export let MOCK_SPIRITS = getFromLocalStorage<Spirit>('spirits', INITIAL_MOCK_SPIRITS);
export let MOCK_BATCHES = getFromLocalStorage<Batch>('batches', INITIAL_MOCK_BATCHES);
export let MOCK_OPERATIONS = getFromLocalStorage<Operation>('operations', INITIAL_MOCK_OPERATIONS);
export const MOCK_REPORTS: Report[] = INITIAL_MOCK_REPORTS;

// Helper functions to add new items and persist them
export function addSpirit(spirit: Spirit): void {
  const newSpirit = { 
    ...spirit, 
    id: crypto.randomUUID() || `spirit-${Date.now()}`,
    createdAt: new Date() 
  };
  MOCK_SPIRITS = [...MOCK_SPIRITS, newSpirit];
  saveToLocalStorage('spirits', MOCK_SPIRITS);
  console.info('Adding new spirit:', newSpirit);
}

export function updateSpirit(updatedSpirit: Spirit): void {
  MOCK_SPIRITS = MOCK_SPIRITS.map(spirit => 
    spirit.id === updatedSpirit.id ? updatedSpirit : spirit
  );
  saveToLocalStorage('spirits', MOCK_SPIRITS);
  console.info('Updated spirit:', updatedSpirit);
}

export function deleteSpirit(spiritId: string): void {
  MOCK_SPIRITS = MOCK_SPIRITS.filter(spirit => spirit.id !== spiritId);
  saveToLocalStorage('spirits', MOCK_SPIRITS);
  console.info('Deleted spirit:', spiritId);
}

export function addBatch(batch: Batch): void {
  const newBatch = { 
    ...batch, 
    id: crypto.randomUUID() || `batch-${Date.now()}`,
    createdAt: new Date() 
  };
  MOCK_BATCHES = [...MOCK_BATCHES, newBatch];
  saveToLocalStorage('batches', MOCK_BATCHES);
  console.info('Adding new batch:', newBatch);
}

export function updateBatch(updatedBatch: Batch): void {
  MOCK_BATCHES = MOCK_BATCHES.map(batch => 
    batch.id === updatedBatch.id ? updatedBatch : batch
  );
  saveToLocalStorage('batches', MOCK_BATCHES);
  console.info('Updated batch:', updatedBatch);
}

export function deleteBatch(batchId: string): void {
  MOCK_BATCHES = MOCK_BATCHES.filter(batch => batch.id !== batchId);
  saveToLocalStorage('batches', MOCK_BATCHES);
  console.info('Deleted batch:', batchId);
}

export function addOperation(operation: Operation): void {
  const newOperation = { 
    ...operation, 
    id: crypto.randomUUID() || `operation-${Date.now()}`,
    createdAt: new Date() 
  };
  MOCK_OPERATIONS = [...MOCK_OPERATIONS, newOperation];
  saveToLocalStorage('operations', MOCK_OPERATIONS);
  console.info('Adding new operation:', newOperation);
}

export function updateOperation(updatedOperation: Operation): void {
  MOCK_OPERATIONS = MOCK_OPERATIONS.map(operation => 
    operation.id === updatedOperation.id ? updatedOperation : operation
  );
  saveToLocalStorage('operations', MOCK_OPERATIONS);
  console.info('Updated operation:', updatedOperation);
}

export function deleteOperation(operationId: string): void {
  MOCK_OPERATIONS = MOCK_OPERATIONS.filter(operation => operation.id !== operationId);
  saveToLocalStorage('operations', MOCK_OPERATIONS);
  console.info('Deleted operation:', operationId);
}
