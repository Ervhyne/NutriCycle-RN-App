import { create } from 'zustand';
import { Machine, Batch, MachineTelemetry } from '../types';

interface MachineStore {
  // Selected Machine
  selectedMachine: Machine | null;
  selectMachine: (machine: Machine) => void;
  clearMachine: () => void;
  
  // Machines List
  machines: Machine[];
  addMachine: (machine: Machine) => void;
  removeMachine: (machineId: string) => void;
  updateMachine: (machineId: string, updates: Partial<Machine>) => void;
  
  // Current Batch
  currentBatch: Batch | null;
  setCurrentBatch: (batch: Batch | null) => void;
  
  // Telemetry
  telemetry: MachineTelemetry | null;
  updateTelemetry: (data: MachineTelemetry) => void;
}

export const useMachineStore = create<MachineStore>((set) => ({
  // Selected Machine
  selectedMachine: null,
  selectMachine: (machine) => set({ selectedMachine: machine }),
  clearMachine: () => set({ selectedMachine: null }),
  
  // Machines List
  machines: [],
  addMachine: (machine) => set((state) => ({ 
    machines: [...state.machines, machine] 
  })),
  removeMachine: (machineId) => set((state) => ({
    machines: state.machines.filter((m) => m.id !== machineId)
  })),
  updateMachine: (machineId, updates) => set((state) => ({
    machines: state.machines.map((m) => 
      m.id === machineId ? { ...m, ...updates } : m
    )
  })),
  
  // Current Batch
  currentBatch: null,
  setCurrentBatch: (batch) => set({ currentBatch: batch }),
  
  // Telemetry
  telemetry: null,
  updateTelemetry: (data) => set({ telemetry: data }),
}));
