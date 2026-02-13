import { create } from 'zustand';
import { Machine, Batch, BatchProcess, MachineTelemetry, ProcessStep, ProcessType } from '../types';
import { fetchWithAuth } from '../config/api';

let telemetryInterval: ReturnType<typeof setInterval> | null = null;

const getRandomInRange = (min: number, max: number) => {
  return Math.round(min + Math.random() * (max - min));
};

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

const drift = (current: number | undefined, min: number, max: number, step: number) => {
  const base = typeof current === 'number' && !Number.isNaN(current) && current > 0
    ? current
    : getRandomInRange(min, max);
  const delta = Math.round((Math.random() * 2 - 1) * step);
  return clamp(base + delta, min, max);
};

const startTelemetrySimulation = (set: any) => {
  if (telemetryInterval) return;

  telemetryInterval = setInterval(() => {
    set((state: MachineStore) => {
      if (state.telemetry?.motorState !== 'running') {
        return {} as any;
      }

      const next: MachineTelemetry = {
        motorState: 'running',
        grinderRPM: drift(state.telemetry?.grinderRPM, 90, 110, 2),
        dryerTemperature: drift(state.telemetry?.dryerTemperature, 33, 37, 1),
        humidity: drift(state.telemetry?.humidity, 52, 58, 1),
        diverterPosition: state.telemetry?.diverterPosition ?? 'neutral',
        doorState: state.telemetry?.doorState ?? 'closed',
      };

      return { telemetry: next };
    });
  }, 2000);
};

const stopTelemetrySimulation = () => {
  if (telemetryInterval) {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
  }
};

interface MachineStore {
  // Selected Machine
  selectedMachine: Machine | null;
  selectMachine: (machine: Machine) => void;
  clearMachine: () => void;
  setMachines: (machines: Machine[]) => void;
  reset: () => void;
  
  // Machines List
  machines: Machine[];
  addMachine: (machine: Machine) => void;
  removeMachine: (machineId: string) => Promise<void>;
  updateMachine: (machineId: string, updates: Partial<Machine>) => Promise<void>;
  
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
  
  // Current Batch Process
  currentBatchProcess: BatchProcess | null;
  setCurrentBatchProcess: (batchProcess: BatchProcess | null) => void;
  fetchBatchProcess: () => Promise<void>;
  
  // Telemetry
  telemetry: MachineTelemetry | null;
  updateTelemetry: (data: Partial<MachineTelemetry>) => void;
  
  // Control actions
  startProcessing: () => void;
  pauseProcessing: () => void;
  stopProcessing: () => void;
  emergencyStop: () => void;
  
  // API actions for batch control
  startBatchAPI: () => Promise<void>;
  stopBatchAPI: () => Promise<void>;
  completeBatchAPI: () => Promise<void>;
  
  // API actions for batch process
  createBatchProcess: (type: 'feed' | 'compost') => Promise<any>;
  updateBatchProcessStage: (feedStatus?: string | null, compostStatus?: string | null) => Promise<any>;
  getBatchProcess: () => Promise<any>;
  
  // RPI control actions (send commands to Raspberry Pi)
  startRPIProcessing: () => Promise<void>;
  stopRPIProcessing: () => Promise<void>;
  getRPIStatus: () => Promise<any>;
}

export const useMachineStore = create<MachineStore>((set) => ({
  // Selected Machine
  selectedMachine: null,
  selectMachine: (machine) => set({ selectedMachine: machine }),
  clearMachine: () => set({ selectedMachine: null }),

  // Machines List setters
  setMachines: (machines) => set({ machines }),
  reset: () => set({
    selectedMachine: null,
    machines: [],
    batches: [],
    currentBatch: null,
    currentBatchProcess: null,
    telemetry: null,
  }),
  
  // Machines List
  machines: [],
  addMachine: (machine) => set((state) => ({ 
    machines: [...state.machines, machine] 
  })),
  removeMachine: async (machineId) => {
    try {
      // Find the machine to get its machineId (the hardware ID)
      const state = useMachineStore.getState();
      const machine = state.machines.find((m) => m.id === machineId);
      
      if (!machine) {
        console.error('Machine not found in store');
        throw new Error('Machine not found in local store');
      }

      if (!machine.machineId) {
        console.error('Machine missing machineId field:', machine);
        throw new Error('Machine is missing hardware ID (machineId)');
      }

      console.log(`[Machine API] Deleting machine ${machine.machineId}`);
      
      const response = await fetchWithAuth(`/machines/${machine.machineId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Machine API] Error response:', { status: response.status, body: errorBody });
        throw new Error(`Failed to delete machine: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[Machine API] Machine deleted:', result);

      set((state) => ({
        machines: state.machines.filter((m) => m.id !== machineId),
        selectedMachine: state.selectedMachine?.id === machineId ? null : state.selectedMachine,
      }));
    } catch (error) {
      console.error('[Machine API] Failed to delete machine:', error);
      throw error;
    }
  },
  updateMachine: async (machineId, updates) => {
    try {
      // Find the machine to get its machineId (the hardware ID)
      const state = useMachineStore.getState();
      const machine = state.machines.find((m) => m.id === machineId);
      
      if (!machine) {
        console.error('Machine not found in store. Available machines:', state.machines.map(m => ({ id: m.id, name: m.name, machineId: m.machineId })));
        throw new Error('Machine not found in local store');
      }

      if (!machine.machineId) {
        console.error('Machine missing machineId field:', machine);
        throw new Error('Machine is missing hardware ID (machineId)');
      }

      console.log(`[Machine API] Updating machine ${machine.machineId} with:`, updates);
      
      const response = await fetchWithAuth(`/machines/${machine.machineId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Machine API] Error response:', { status: response.status, body: errorBody });
        throw new Error(`Failed to update machine: ${response.status} ${response.statusText}`);
      }

      const updatedMachine = await response.json();
      console.log('[Machine API] Machine updated:', updatedMachine);

      set((state) => ({
        machines: state.machines.map((m) => 
          m.id === machineId ? { ...m, ...updates } : m
        ),
        selectedMachine: state.selectedMachine?.id === machineId 
          ? { ...state.selectedMachine, ...updates } 
          : state.selectedMachine,
      }));
    } catch (error) {
      console.error('[Machine API] Failed to update machine:', error);
      throw error;
    }
  },

  // Batches
  batches: [],
  addBatch: (batch) => set((state) => ({ batches: [...state.batches, batch] })),
  updateBatch: (batchId, updates) => {
    if (updates.status === 'running') {
      startTelemetrySimulation(set);
    }
    if (updates.status === 'idle' || updates.status === 'completed' || updates.status === 'error') {
      stopTelemetrySimulation();
    }

    return set((state) => ({
      batches: state.batches.map((b) => b.id === batchId ? { ...b, ...updates } : b)
    }));
  },
  removeBatch: (batchId) => set((state) => ({
    batches: state.batches.filter((b) => b.id !== batchId)
  })),
  
  // Current Batch
  currentBatch: null,
  setCurrentBatch: (batch) => {
    if (batch?.status === 'running') {
      startTelemetrySimulation(set);
    } else {
      stopTelemetrySimulation();
    }
    set({ currentBatch: batch });
  },
  
  // Current Batch Process
  currentBatchProcess: null,
  setCurrentBatchProcess: (batchProcess) => set({ currentBatchProcess: batchProcess }),
  fetchBatchProcess: async () => {
    const { currentBatch } = useMachineStore.getState();
    if (!currentBatch) {
      console.log('[fetchBatchProcess] No current batch');
      return;
    }
    
    try {
      console.log(`[fetchBatchProcess] Fetching process for batch: ${currentBatch.id}`);
      const response = await fetchWithAuth(`/batches/${currentBatch.id}/process`, {
        method: 'GET',
      });
      
      const data = await response.json();
      console.log('[fetchBatchProcess] Response:', data);
      
      if (data?.process) {
        set({ currentBatchProcess: data.process });
      }
    } catch (error) {
      console.error('[fetchBatchProcess] Error:', error);
    }
  },
  
  // Telemetry
  telemetry: {
    motorState: 'idle',
    grinderRPM: 0,
    dryerTemperature: 0,
    humidity: 0,
    diverterPosition: 'neutral',
    doorState: 'closed',
  },
  updateTelemetry: (data) => set((state) => ({ telemetry: { ...state.telemetry, ...data } as MachineTelemetry })),

  // Control actions
  startProcessing: () => set((state) => {
    // set telemetry and batch status
    const updatedTelemetry: MachineTelemetry = {
      motorState: 'running',
      grinderRPM: drift(state.telemetry?.grinderRPM, 90, 110, 2),
      dryerTemperature: drift(state.telemetry?.dryerTemperature, 33, 37, 1),
      humidity: drift(state.telemetry?.humidity, 52, 58, 1),
      diverterPosition: state.telemetry?.diverterPosition ?? 'neutral',
      doorState: state.telemetry?.doorState ?? 'closed',
    };

    // Initialize step to 1 if it's 0 (new batch), otherwise continue from current progress
    const updatedBatch = state.currentBatch ? ({ 
      ...state.currentBatch, 
      status: 'running', 
      currentStep: state.currentBatch.currentStep === 0 ? 1 : state.currentBatch.currentStep,
      startTime: state.currentBatch.startTime ?? new Date() 
    } as Batch) : null;

    startTelemetrySimulation(set);

    return {
      telemetry: updatedTelemetry,
      currentBatch: updatedBatch,
      batches: updatedBatch ? state.batches.map((b) => b.id === updatedBatch.id ? updatedBatch : b) : state.batches,
    };
  }),
  pauseProcessing: () => {
    stopTelemetrySimulation();
    return set((state) => ({
    telemetry: { ...state.telemetry!, motorState: 'paused' } as MachineTelemetry,
    currentBatch: state.currentBatch ? ({ ...state.currentBatch, status: 'idle' } as Batch) : null,
    }));
  },
  stopProcessing: () => {
    stopTelemetrySimulation();
    return set((state) => {
    // Stop but keep the batch with current progress - don't mark as completed
    const updatedBatch = state.currentBatch ? { ...state.currentBatch, status: 'idle' } as Batch : null;
    const updatedBatches = updatedBatch ? state.batches.map((b) => b.id === updatedBatch.id ? updatedBatch : b) : state.batches;
    
    return {
      telemetry: { ...state.telemetry!, motorState: 'idle' } as MachineTelemetry,
      batches: updatedBatches,
      currentBatch: updatedBatch,  // Keep the batch so we can see progress
    };
    });
  },
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
    const updated = { ...batch, currentStep: prev, status: 'idle' } as Batch;
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
  emergencyStop: () => {
    stopTelemetrySimulation();
    return set((state) => {
    const updatedBatches = state.currentBatch ? state.batches.map((b) => b.id === state.currentBatch!.id ? ({ ...b, status: 'error' } as Batch) : b) : state.batches;
    return {
      telemetry: { ...state.telemetry!, motorState: 'idle' } as MachineTelemetry,
      batches: updatedBatches,
      currentBatch: null,
    };
    });
  },
  
  // API actions for batch control
  startBatchAPI: async () => {
    const { currentBatch } = useMachineStore.getState();
    if (!currentBatch) {
      console.error('No current batch to start');
      return;
    }
    
    try {
      console.log(`[Batch API] Starting batch - ID: ${currentBatch.id}, batchNumber: ${currentBatch.batchNumber}`);
      console.log(`[Batch API] Full currentBatch:`, JSON.stringify(currentBatch, null, 2));
      
      const response = await fetchWithAuth(`/batches/${currentBatch.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: 'running',
          startedAt: currentBatch.startTime ? undefined : new Date().toISOString()
        }),
      });
      
      const updatedBatch = await response.json();
      console.log('[Batch API] Batch status updated in database:', updatedBatch.status);
      console.log('[Batch API] Machine table status is NOT changed (remains online/offline)');
      
      startTelemetrySimulation(set);

      set((state) => ({
        currentBatch: { ...state.currentBatch, status: 'running', startTime: updatedBatch.startedAt ? new Date(updatedBatch.startedAt) : state.currentBatch?.startTime } as Batch,
        batches: state.batches.map((b) => 
          b.id === currentBatch.id 
            ? { ...b, status: 'running', startTime: updatedBatch.startedAt ? new Date(updatedBatch.startedAt) : b.startTime } as Batch
            : b
        ),
      }));
    } catch (error) {
      console.error('[Batch API] Failed to start batch:', error);
      throw error;
    }
  },
  
  stopBatchAPI: async () => {
    const { currentBatch } = useMachineStore.getState();
    if (!currentBatch) {
      console.error('No current batch to stop');
      return;
    }
    
    try {
      console.log(`[Batch API] Stopping batch ${currentBatch.id} - Updating Batch table status to "idle"`);
      
      const response = await fetchWithAuth(`/batches/${currentBatch.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'idle' }),
      });
      
      const updatedBatch = await response.json();
      console.log('[Batch API] Batch status updated in database:', updatedBatch.status);
      console.log('[Batch API] Machine table status is NOT changed (remains online/offline)');
      
      stopTelemetrySimulation();

      set((state) => ({
        currentBatch: { ...state.currentBatch, status: 'idle' } as Batch,
        batches: state.batches.map((b) => 
          b.id === currentBatch.id 
            ? { ...b, status: 'idle' } as Batch
            : b
        ),
      }));
    } catch (error) {
      console.error('[Batch API] Failed to stop batch:', error);
      throw error;
    }
  },
  
  completeBatchAPI: async () => {
    const { currentBatch } = useMachineStore.getState();
    if (!currentBatch) {
      console.error('No current batch to complete');
      return;
    }
    
    try {
      console.log(`[Batch API] Completing batch ${currentBatch.id} - Updating Batch table status to "completed"`);
      
      const response = await fetchWithAuth(`/batches/${currentBatch.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: 'completed',
          endedAt: new Date().toISOString()
        }),
      });
      
      const updatedBatch = await response.json();
      console.log('[Batch API] Batch marked as completed in database:', updatedBatch.status);
      
      stopTelemetrySimulation();

      set((state) => ({
        currentBatch: { ...state.currentBatch, status: 'completed' } as Batch,
        batches: state.batches.map((b) => 
          b.id === currentBatch.id 
            ? { ...b, status: 'completed', endTime: new Date() } as Batch
            : b
        ),
      }));
    } catch (error) {
      console.error('[Batch API] Failed to complete batch:', error);
      throw error;
    }
  },
  
  // Process API actions
  createBatchProcess: async (type: 'feed' | 'compost') => {
    const { currentBatch } = useMachineStore.getState();
    if (!currentBatch) {
      console.error('No current batch to create process');
      return;
    }
    
    try {
      console.log(`[Process API] Creating ${type} process for batch ${currentBatch.id}`);
      
      const body: any = {
        startedAt: new Date().toISOString(),
      };

      if (type === 'feed') {
        body.feedStatus = 'Sorting';
      } else {
        body.compostStatus = 'Vermicasting';
      }
      
      const response = await fetchWithAuth(`/batches/${currentBatch.id}/process`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      
      const process = await response.json();
      console.log('[Process API] Process created:', process);
      return process;
    } catch (error) {
      console.error('[Process API] Failed to create process:', error);
      throw error;
    }
  },
  
  updateBatchProcessStage: async (feedStatus?: string | null, compostStatus?: string | null) => {
    const { currentBatch } = useMachineStore.getState();
    if (!currentBatch) {
      console.error('No current batch to update process');
      return;
    }
    
    try {
      const body: any = {};
      // Only include fields that are being updated (not null or undefined)
      if (feedStatus !== undefined && feedStatus !== null) {
        body.feedStatus = feedStatus;
      }
      if (compostStatus !== undefined && compostStatus !== null) {
        body.compostStatus = compostStatus;
      }

      console.log(`[Process API] Updating status:`, body);
      
      const response = await fetchWithAuth(`/batches/${currentBatch.id}/process`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      
      const process = await response.json();
      console.log('[Process API] Status updated:', process);
      return process;
    } catch (error) {
      console.error('[Process API] Failed to update status:', error);
      throw error;
    }
  },
  
  getBatchProcess: async () => {
    const { currentBatch } = useMachineStore.getState();
    if (!currentBatch) {
      console.error('[Process API] No current batch to get process');
      return null;
    }
    
    try {
      console.log(`[Process API] Fetching process for batch ID: ${currentBatch.id}`);
      const response = await fetchWithAuth(`/batches/${currentBatch.id}/process`, {
        method: 'GET',
      });
      
      const process = await response.json();
      console.log('[Process API] Process fetched:', process);
      return process;
    } catch (error) {
      console.error('[Process API] Failed to fetch process:', error);
      return null;
    }
  },

  // RPI control actions
  startRPIProcessing: async () => {
    const { currentBatch, selectedMachine } = useMachineStore.getState();
    if (!currentBatch) {
      console.error('[RPI API] No current batch to start');
      throw new Error('No batch selected');
    }

    if (!selectedMachine?.id) {
      console.error('[RPI API] No machine selected');
      throw new Error('No machine selected');
    }

    try {
      console.log(`[RPI API] Sending start command to port 8080 for batch ${currentBatch.id}, machine ${selectedMachine.id}`);
      
      const response = await fetchWithAuth('/rpi/start', {
        method: 'POST',
        body: JSON.stringify({
          batchId: currentBatch.id,
          machineId: selectedMachine.id,
        }),
      });
      
      const result = await response.json();
      console.log('[RPI API] Start command sent:', result);
      return result;
    } catch (error) {
      console.error('[RPI API] Failed to start RPI processing:', error);
      throw error;
    }
  },

  stopRPIProcessing: async () => {
    const { currentBatch, selectedMachine } = useMachineStore.getState();
    if (!currentBatch) {
      console.error('[RPI API] No current batch to stop');
      throw new Error('No batch selected');
    }

    if (!selectedMachine?.id) {
      console.error('[RPI API] No machine selected');
      throw new Error('No machine selected');
    }

    try {
      console.log(`[RPI API] Sending stop command to port 8080 for batch ${currentBatch.id}, machine ${selectedMachine.id}`);
      
      const response = await fetchWithAuth('/rpi/stop', {
        method: 'POST',
        body: JSON.stringify({
          batchId: currentBatch.id,
          machineId: selectedMachine.id,
        }),
      });
      
      const result = await response.json();
      console.log('[RPI API] Stop command sent:', result);
      return result;
    } catch (error) {
      console.error('[RPI API] Failed to stop RPI processing:', error);
      throw error;
    }
  },

  getRPIStatus: async () => {
    const { currentBatch } = useMachineStore.getState();
    if (!currentBatch) {
      console.error('[RPI API] No current batch to check status');
      return null;
    }

    try {
      console.log(`[RPI API] Fetching Raspberry Pi status for batch ${currentBatch.id}`);
      
      const response = await fetchWithAuth(`/rpi/status/${currentBatch.id}`, {
        method: 'GET',
      });
      
      const result = await response.json();
      console.log('[RPI API] RPI status:', result);
      return result;
    } catch (error) {
      console.error('[RPI API] Failed to fetch RPI status:', error);
      return null;
    }
  },
}));
