import { create } from 'zustand';
import { Machine, Batch, MachineTelemetry, ProcessStep, ProcessType } from '../types';

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
  
  // Batches
  batches: Batch[];
  addBatch: (batch: Batch) => void;
  updateBatch: (batchId: string, updates: Partial<Batch>) => void;
  removeBatch: (batchId: string) => void;
  advanceBatchStep: (batchId?: string) => void;
  revertBatchStep: (batchId?: string) => void;
  completeBatch: (batchId?: string) => void;
  
  // Current Batch
  currentBatch: Batch | null;
  setCurrentBatch: (batch: Batch | null) => void;
  
  // Telemetry
  telemetry: MachineTelemetry | null;
  updateTelemetry: (data: Partial<MachineTelemetry>) => void;
  
  // Control actions
  startProcessing: () => void;
  pauseProcessing: () => void;
  stopProcessing: () => void;
  emergencyStop: () => void;
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

  // Batches
  batches: [],
  addBatch: (batch) => set((state) => ({ batches: [...state.batches, batch] })),
  updateBatch: (batchId, updates) => set((state) => ({
    batches: state.batches.map((b) => b.id === batchId ? { ...b, ...updates } : b)
  })),
  removeBatch: (batchId) => set((state) => ({
    batches: state.batches.filter((b) => b.id !== batchId)
  })),
  
  // Current Batch
  currentBatch: null,
  setCurrentBatch: (batch) => set({ currentBatch: batch }),
  
  // Telemetry
  telemetry: null,
  updateTelemetry: (data) => set((state) => ({ telemetry: { ...state.telemetry, ...data } as MachineTelemetry })),

  // Control actions
  startProcessing: () => set((state) => {
    // set telemetry and batch status
    const updatedTelemetry: MachineTelemetry = {
      motorState: 'running',
      grinderRPM: state.telemetry?.grinderRPM ?? 0,
      dryerTemperature: state.telemetry?.dryerTemperature ?? 0,
      humidity: state.telemetry?.humidity ?? 0,
      diverterPosition: state.telemetry?.diverterPosition ?? 'neutral',
      doorState: state.telemetry?.doorState ?? 'closed',
    };

    // Continue from current progress - don't reset the step
    const updatedBatch = state.currentBatch ? ({ ...state.currentBatch, status: 'running', startTime: state.currentBatch.startTime ?? new Date() } as Batch) : null;

    return {
      telemetry: updatedTelemetry,
      currentBatch: updatedBatch,
      batches: updatedBatch ? state.batches.map((b) => b.id === updatedBatch.id ? updatedBatch : b) : state.batches,
    };
  }),
  pauseProcessing: () => set((state) => ({
    telemetry: { ...state.telemetry!, motorState: 'paused' } as MachineTelemetry,
    currentBatch: state.currentBatch ? ({ ...state.currentBatch, status: 'paused' } as Batch) : null,
  })),
  stopProcessing: () => set((state) => {
    // Stop but keep the batch with current progress - don't mark as completed
    const updatedBatch = state.currentBatch ? { ...state.currentBatch, status: 'paused' } as Batch : null;
    const updatedBatches = updatedBatch ? state.batches.map((b) => b.id === updatedBatch.id ? updatedBatch : b) : state.batches;
    
    return {
      telemetry: { ...state.telemetry!, motorState: 'idle' } as MachineTelemetry,
      batches: updatedBatches,
      currentBatch: updatedBatch,  // Keep the batch so we can see progress
    };
  }),
  advanceBatchStep: (batchId?: string) => set((state) => {
    const id = batchId ?? state.currentBatch?.id;
    if (!id) return {} as any;

    const batch = state.batches.find((b) => b.id === id);
    if (!batch) return {} as any;

    // Support different maximums: feed=5, compost=4, mixed=9 (feed then compost)
    let maxSteps = 5;
    if (batch.type === 'compost') maxSteps = 4;
    else if (batch.type === 'mixed') maxSteps = 9;

    if (batch.currentStep >= maxSteps) {
      // complete
      const completed = { ...batch, currentStep: maxSteps, status: 'completed', endTime: new Date() } as Batch;
      return {
        batches: state.batches.map((b) => b.id === completed.id ? completed : b),
        currentBatch: state.currentBatch && state.currentBatch.id === completed.id ? completed : state.currentBatch,
      };
    }

    const updated = { ...batch, currentStep: (batch.currentStep + 1) as ProcessStep, status: 'running' } as Batch;
    return {
      batches: state.batches.map((b) => b.id === updated.id ? updated : b),
      currentBatch: state.currentBatch && state.currentBatch.id === updated.id ? updated : state.currentBatch,
    };
  }),
  revertBatchStep: (batchId?: string) => set((state) => {
    const id = batchId ?? state.currentBatch?.id;
    if (!id) return {} as any;

    const batch = state.batches.find((b) => b.id === id);
    if (!batch) return {} as any;

    const prev = Math.max(1, batch.currentStep - 1) as ProcessStep;
    const updated = { ...batch, currentStep: prev, status: 'paused' } as Batch;
    return {
      batches: state.batches.map((b) => b.id === updated.id ? updated : b),
      currentBatch: state.currentBatch && state.currentBatch.id === updated.id ? updated : state.currentBatch,
    };
  }),
  completeBatch: (batchId?: string) => set((state) => {
    const id = batchId ?? state.currentBatch?.id;
    if (!id) return {} as any;

    const batch = state.batches.find((b) => b.id === id);
    if (!batch) return {} as any;

    const completed = { ...batch, status: 'completed', endTime: new Date(), currentStep: batch.type === 'feed' ? 5 : 4 } as Batch;
    return {
      batches: state.batches.map((b) => b.id === completed.id ? completed : b),
      currentBatch: state.currentBatch && state.currentBatch.id === completed.id ? null : state.currentBatch,
    };
  }),
  emergencyStop: () => set((state) => {
    const updatedBatches = state.currentBatch ? state.batches.map((b) => b.id === state.currentBatch!.id ? ({ ...b, status: 'error' } as Batch) : b) : state.batches;
    return {
      telemetry: { ...state.telemetry!, motorState: 'idle' } as MachineTelemetry,
      batches: updatedBatches,
      currentBatch: null,
    };
  }),
}));
