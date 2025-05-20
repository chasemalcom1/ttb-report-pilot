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

// Initial mock data
const INITIAL_MOCK_SPIRITS: Spirit[] = [
  {
    id: '1',
    name: 'Mountain Rye Whiskey',
    type: 'whiskey',
    defaultProof: 90,
    description: 'Our signature rye whiskey with notes of vanilla and oak',
    active: true,
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Peak Vodka',
    type: 'vodka',
    defaultProof: 80,
    description: 'Smooth wheat vodka, triple distilled',
    active: true,
    createdAt: new Date('2023-02-20'),
  },
  {
    id: '3',
    name: 'Alpine Gin',
    type: 'gin',
    defaultProof: 94,
    description: 'Botanical gin with notes of juniper and local herbs',
    active: true,
    createdAt: new Date('2023-03-10'),
  },
];

const INITIAL_MOCK_BATCHES: Batch[] = [
  {
    id: '1',
    spiritId: '1',
    batchNumber: 'RW-2023-001',
    productionDate: new Date('2023-04-05'),
    proof: 90,
    originalLiters: 400,
    currentLiters: 385,
    status: 'aging',
    notes: 'Aging in charred oak barrels',
    createdAt: new Date('2023-04-05'),
  },
  {
    id: '2',
    spiritId: '2',
    batchNumber: 'PV-2023-001',
    productionDate: new Date('2023-04-15'),
    proof: 80,
    originalLiters: 600,
    currentLiters: 550,
    status: 'ready_for_bottling',
    createdAt: new Date('2023-04-15'),
  },
  {
    id: '3',
    spiritId: '3',
    batchNumber: 'AG-2023-001',
    productionDate: new Date('2023-05-01'),
    proof: 94,
    originalLiters: 300,
    currentLiters: 300,
    status: 'in_production',
    createdAt: new Date('2023-05-01'),
  },
];

const INITIAL_MOCK_OPERATIONS: Operation[] = [
  {
    id: '1',
    type: 'production',
    date: new Date('2023-04-05'),
    spiritId: '1',
    batchId: '1',
    proof: 90,
    liters: 400,
    proofGallons: 95.1,
    notes: 'Initial distillation run for 2023',
    operatorId: '1',
    createdAt: new Date('2023-04-05'),
  },
  {
    id: '2',
    type: 'production',
    date: new Date('2023-04-15'),
    spiritId: '2',
    batchId: '2',
    proof: 80,
    liters: 600,
    proofGallons: 126.8,
    notes: 'Standard vodka run',
    operatorId: '1',
    createdAt: new Date('2023-04-15'),
  },
  {
    id: '3',
    type: 'loss',
    date: new Date('2023-04-30'),
    spiritId: '2',
    batchId: '2',
    proof: 80,
    liters: 50,
    proofGallons: 10.6,
    notes: 'Evaporation and sampling',
    operatorId: '2',
    createdAt: new Date('2023-04-30'),
  },
  {
    id: '4',
    type: 'production',
    date: new Date('2023-05-01'),
    spiritId: '3',
    batchId: '3',
    proof: 94,
    liters: 300,
    proofGallons: 74.6,
    notes: 'New gin recipe',
    operatorId: '2',
    createdAt: new Date('2023-05-01'),
  },
  {
    id: '5',
    type: 'bottling',
    date: new Date('2023-05-15'),
    spiritId: '1',
    batchId: '1',
    proof: 90,
    liters: 15,
    proofGallons: 3.6,
    bottles: 20,
    bottleSize: '750ml',
    notes: 'Small test bottling run',
    operatorId: '1',
    createdAt: new Date('2023-05-15'),
  },
];

// Get data from local storage or use initial data
export function getFromLocalStorage<T>(key: string, initialData: T[]): T[] {
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      // Parse and handle date objects correctly
      const parsed = JSON.parse(storedData, (key, value) => {
        if (key === 'createdAt' || key === 'productionDate' || key === 'date' || key === 'submittedAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
      return Array.isArray(parsed) ? parsed : initialData;
    }
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
  }
  return initialData;
}

// Save data to local storage
export function saveToLocalStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Export the persisted data
export let MOCK_SPIRITS = getFromLocalStorage<Spirit>('spirits', INITIAL_MOCK_SPIRITS);
export let MOCK_BATCHES = getFromLocalStorage<Batch>('batches', INITIAL_MOCK_BATCHES);
export let MOCK_OPERATIONS = getFromLocalStorage<Operation>('operations', INITIAL_MOCK_OPERATIONS);

export const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    type: 'form_5110_40',
    period: '2023-04',
    status: 'submitted',
    submittedAt: new Date('2023-05-15'),
    data: {
      totalProduction: 221.9,
      totalWithdrawal: 3.6,
      totalLoss: 10.6,
    },
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-05-15'),
  },
];

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

// Utility functions for calculations
export const literToProofGallon = (liters: number, proof: number): number => {
  // Convert liters to gallons (1 liter = 0.264172 gallons)
  const gallons = liters * 0.264172;
  // Calculate proof gallons
  const proofGallons = (gallons * proof) / 100;
  // Round to 1 decimal place
  return Math.round(proofGallons * 10) / 10;
};

export const sumOperationsByType = (
  operations: Operation[],
  type: OperationType,
  startDate: Date,
  endDate: Date
): number => {
  return operations
    .filter(
      (op) => 
        op.type === type && 
        op.date >= startDate && 
        op.date <= endDate
    )
    .reduce((sum, op) => sum + op.proofGallons, 0);
};
