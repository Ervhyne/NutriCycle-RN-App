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
  machineId: string;
  type: ProcessType;
  status: 'queued' | 'running' | 'idle' | 'completed' | 'error';
  currentStep: ProcessStep;
  startTime?: Date;
  endTime?: Date;
  estimatedWeight?: number;
  actualWeight?: number;
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
