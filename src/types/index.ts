// Machine Types
export interface Machine {
  id: string;
  name: string;
  machineId: string; // e.g. "NC-8F2A-91"
  isOnline: boolean;
  lastSeen?: Date;
  connectionStrength?: number; // 0-100
  imageUrl?: string;
  streamUrl?: string; // optional HLS/HTTP stream (m3u8, http/https)
}

// Process Types
export type ProcessType = 'feed' | 'compost' | 'mixed';
export type ProcessStep = number;

export interface Batch {
  id: string;
  batchNumber?: string;
  machineId: string;
  type: ProcessType;
  status: 'queued' | 'running' | 'idle' | 'completed' | 'error';
  currentStep: ProcessStep;
  startTime?: Date;
  endTime?: Date;
  estimatedWeight?: number;
  actualWeight?: number;
  compostOutput?: number; // kg
  feedOutput?: number; // kg
}

// Batch Process Types
export interface BatchProcess {
  id: string;
  batchNumber: string;
  startedAt?: Date | string;
  completedAt?: Date | string;
  feedOutputWeight?: number;
  compostOutputWeight?: number;
  feedStatus?: string;
  compostStatus?: string;
}

// API Response Types (Backend data structure)
export interface ApiBatch {
  id: string;
  batchNumber: string;
  machineId: string;
  userId: string;
  estimatedWeight: number;
  actualWeight?: number;
  compostOutput?: number;
  feedOutput?: number;
  startedAt?: string;
  endedAt?: string;
  status: string;
  createdAt: string;
  process?: BatchProcess; // Linked BatchProcess data
  machine?: {
    id: string;
    machineId: string;
    name?: string;
    status?: string;
  };
}

export interface ApiMachine {
  id: string;
  machineId: string;
  name?: string;
  ownerId?: string;
  status: string;
  lastCommandAt?: string;
  lastTelemetry?: any;
  createdAt: string;
  batches?: ApiBatch[]; // Linked batches with process data
}

// Telemetry Types
export interface MachineTelemetry {
  motorState: 'idle' | 'running' | 'paused';
  grinderRPM: number;
  dryerTemperature: number;
  humidity: number;
  diverterPosition: 'feed' | 'compost' | 'neutral';
  doorState: 'open' | 'closed';
}

// Machine State
export type MachineMode = 'auto' | 'manual';
export type MachineAction = 'idle' | 'processing' | 'paused' | 'error';
