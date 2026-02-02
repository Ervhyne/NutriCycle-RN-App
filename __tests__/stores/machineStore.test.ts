import { useMachineStore } from '../../src/stores/machineStore';
import { Machine, Batch } from '../../src/types';

// Mocks are set up in __tests__/setup.ts
jest.mock('../../src/config/api');

describe('Machine Store', () => {
  beforeEach(() => {
    // Clear store state before each test
    useMachineStore.setState({
      selectedMachine: null,
      machines: [],
      batches: [],
      currentBatch: null,
      telemetry: null,
    });
    jest.clearAllMocks();
  });

  describe('Machine Selection', () => {
    it('should select a machine', () => {
      const mockMachine: Machine = {
        id: 'machine-1',
        name: 'Machine 1',
        machineId: 'NC-1234-56',
        isOnline: true,
      };

      useMachineStore.getState().selectMachine(mockMachine);
      expect(useMachineStore.getState().selectedMachine).toEqual(mockMachine);
    });

    it('should clear selected machine', () => {
      const mockMachine: Machine = {
        id: 'machine-1',
        name: 'Machine 1',
        machineId: 'NC-1234-56',
        isOnline: true,
      };

      useMachineStore.getState().selectMachine(mockMachine);
      useMachineStore.getState().clearMachine();
      expect(useMachineStore.getState().selectedMachine).toBeNull();
    });
  });

  describe('Machines List Management', () => {
    it('should add a machine', () => {
      const mockMachine: Machine = {
        id: 'machine-1',
        name: 'Machine 1',
        machineId: 'NC-1234-56',
        isOnline: true,
      };

      useMachineStore.getState().addMachine(mockMachine);
      expect(useMachineStore.getState().machines).toHaveLength(1);
      expect(useMachineStore.getState().machines[0]).toEqual(mockMachine);
    });

    it('should set multiple machines', () => {
      const machines: Machine[] = [
        { id: '1', name: 'Machine 1', machineId: 'NC-1111-11', isOnline: true },
        { id: '2', name: 'Machine 2', machineId: 'NC-2222-22', isOnline: false },
      ];

      useMachineStore.getState().setMachines(machines);
      expect(useMachineStore.getState().machines).toHaveLength(2);
      expect(useMachineStore.getState().machines).toEqual(machines);
    });

    it('should add multiple machines to list', () => {
      const machine1: Machine = {
        id: 'machine-1',
        name: 'Machine 1',
        machineId: 'NC-1234-56',
        isOnline: true,
      };
      const machine2: Machine = {
        id: 'machine-2',
        name: 'Machine 2',
        machineId: 'NC-7890-12',
        isOnline: false,
      };

      useMachineStore.getState().addMachine(machine1);
      useMachineStore.getState().addMachine(machine2);

      expect(useMachineStore.getState().machines).toHaveLength(2);
    });
  });

  describe('Batch Management', () => {
    it('should add a batch', () => {
      const mockBatch: Batch = {
        id: 'batch-1',
        batchNumber: 'B001',
        machineId: 'NC-1234-56',
        type: 'feed',
        status: 'queued',
        currentStep: 0,
      };

      useMachineStore.getState().addBatch(mockBatch);
      expect(useMachineStore.getState().batches).toHaveLength(1);
      expect(useMachineStore.getState().batches[0]).toEqual(mockBatch);
    });

    it('should update a batch', () => {
      const mockBatch: Batch = {
        id: 'batch-1',
        batchNumber: 'B001',
        machineId: 'NC-1234-56',
        type: 'feed',
        status: 'queued',
        currentStep: 0,
      };

      useMachineStore.getState().addBatch(mockBatch);
      useMachineStore.getState().updateBatch('batch-1', { status: 'running', currentStep: 1 });

      const updatedBatch = useMachineStore.getState().batches[0];
      expect(updatedBatch.status).toBe('running');
      expect(updatedBatch.currentStep).toBe(1);
    });

    it('should remove a batch', () => {
      const mockBatch: Batch = {
        id: 'batch-1',
        batchNumber: 'B001',
        machineId: 'NC-1234-56',
        type: 'feed',
        status: 'queued',
        currentStep: 0,
      };

      useMachineStore.getState().addBatch(mockBatch);
      expect(useMachineStore.getState().batches).toHaveLength(1);

      useMachineStore.getState().removeBatch('batch-1');
      expect(useMachineStore.getState().batches).toHaveLength(0);
    });

    it('should advance batch step', () => {
      const mockBatch: Batch = {
        id: 'batch-1',
        batchNumber: 'B001',
        machineId: 'NC-1234-56',
        type: 'feed',
        status: 'running',
        currentStep: 0,
      };

      useMachineStore.getState().addBatch(mockBatch);
      useMachineStore.getState().setCurrentBatch(mockBatch);
      useMachineStore.getState().advanceBatchStep();

      expect(useMachineStore.getState().currentBatch?.currentStep).toBe(1);
    });
  });

  describe('Control Actions', () => {
    beforeEach(() => {
      const mockBatch: Batch = {
        id: 'batch-1',
        batchNumber: 'B001',
        machineId: 'NC-1234-56',
        type: 'feed',
        status: 'idle',
        currentStep: 0,
      };
      useMachineStore.getState().setCurrentBatch(mockBatch);
    });

    it('should start processing', () => {
      useMachineStore.getState().startProcessing();
      const batch = useMachineStore.getState().currentBatch;
      expect(batch?.status).toBe('running');
    });

    it('should pause processing', () => {
      useMachineStore.getState().startProcessing();
      useMachineStore.getState().pauseProcessing();
      const batch = useMachineStore.getState().currentBatch;
      // pauseProcessing actually sets status to 'idle', but motor to 'paused'
      expect(batch?.status).toBe('idle');
    });

    it('should stop processing', () => {
      useMachineStore.getState().startProcessing();
      useMachineStore.getState().stopProcessing();
      const batch = useMachineStore.getState().currentBatch;
      expect(batch?.status).toBe('idle');
    });
  });

  describe('Store Reset', () => {
    it('should reset all state', () => {
      const machine: Machine = {
        id: '1',
        name: 'Machine 1',
        machineId: 'NC-1234-56',
        isOnline: true,
      };
      const batch: Batch = {
        id: 'batch-1',
        machineId: 'NC-1234-56',
        type: 'feed',
        status: 'running',
        currentStep: 1,
      };

      useMachineStore.getState().selectMachine(machine);
      useMachineStore.getState().addBatch(batch);

      // Verify state is populated
      expect(useMachineStore.getState().selectedMachine).not.toBeNull();
      expect(useMachineStore.getState().batches).toHaveLength(1);

      // Reset
      useMachineStore.getState().reset();

      // Verify state is cleared
      expect(useMachineStore.getState().selectedMachine).toBeNull();
      expect(useMachineStore.getState().machines).toHaveLength(0);
      expect(useMachineStore.getState().batches).toHaveLength(0);
      expect(useMachineStore.getState().currentBatch).toBeNull();
      expect(useMachineStore.getState().telemetry).toBeNull();
    });
  });

  describe('Telemetry', () => {
    it('should update telemetry data', () => {
      useMachineStore.getState().updateTelemetry({
        motorState: 'running',
        grinderRPM: 1200,
        dryerTemperature: 65,
        humidity: 45,
        diverterPosition: 'feed',
        doorState: 'closed',
      });

      const telemetry = useMachineStore.getState().telemetry;
      expect(telemetry?.motorState).toBe('running');
      expect(telemetry?.grinderRPM).toBe(1200);
      expect(telemetry?.dryerTemperature).toBe(65);
    });

    it('should partially update telemetry', () => {
      useMachineStore.getState().updateTelemetry({
        motorState: 'running',
        grinderRPM: 1200,
        dryerTemperature: 65,
        humidity: 45,
        diverterPosition: 'feed',
        doorState: 'closed',
      });

      useMachineStore.getState().updateTelemetry({
        grinderRPM: 1500,
        dryerTemperature: 70,
      });

      const telemetry = useMachineStore.getState().telemetry;
      expect(telemetry?.motorState).toBe('running'); // unchanged
      expect(telemetry?.grinderRPM).toBe(1500); // updated
      expect(telemetry?.dryerTemperature).toBe(70); // updated
    });
  });
});
