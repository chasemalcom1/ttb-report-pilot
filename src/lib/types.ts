
// Spirit and batch types
export type SpiritType = 'whiskey' | 'vodka' | 'gin' | 'rum' | 'tequila' | 'brandy' | 'liqueur' | 'wine' | 'beer' | 'other';

export type OperationType = 
  | 'production' 
  | 'bottling' 
  | 'transfer_in' 
  | 'transfer_out' 
  | 'loss' 
  | 'addition' 
  | 'redistillation' 
  | 'tax_withdrawal';

export interface Spirit {
  id: string;
  name: string;
  type: SpiritType;
  defaultProof: number;
  description?: string;
  active: boolean;
  createdAt: Date;
}

export interface Batch {
  id: string;
  spiritId: string;
  batchNumber: string;
  productionDate: Date;
  proof: number;
  originalLiters: number;
  currentLiters: number;
  status: 'in_production' | 'aging' | 'ready_for_bottling' | 'bottled' | 'depleted';
  notes?: string;
  createdAt: Date;
}

export interface Operation {
  id: string;
  type: OperationType;
  date: Date;
  batchId?: string;
  spiritId?: string;
  proof?: number;
  liters: number;
  proofGallons: number;
  bottles?: number;
  bottleSize?: string;
  destinationOrSource?: string;
  notes?: string;
  operatorId: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  type: 'form_5110_40' | 'form_5110_28' | 'form_5110_11';
  period: string; // e.g., "2023-05" for May 2023
  status: 'draft' | 'submitted' | 'amended';
  submittedAt?: Date;
  data: Record<string, any>; // Report-specific data
  createdAt: Date;
  updatedAt: Date;
}
