// Re-export shared types and calculation utilities.
// Business records now live in Supabase — no client-side mocks or localStorage.
export type { SpiritType, OperationType, Spirit, Batch, Operation, Report } from './types';
export { literToProofGallon, sumOperationsByType } from './calculationUtils';
