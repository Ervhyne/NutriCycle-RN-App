import { Machine, Batch, MachineTelemetry, ProcessType } from '../../src/types';

describe('Type Definitions and Validation', () => {
  describe('Machine Type', () => {
    it('should create a valid Machine object', () => {
      const machine: Machine = {
        id: 'machine-1',
        name: 'Machine 1',
        machineId: 'NC-1234-56',
        isOnline: true,
      };

      expect(machine.id).toBe('machine-1');
      expect(machine.name).toBe('Machine 1');
      expect(machine.machineId).toBe('NC-1234-56');
      expect(machine.isOnline).toBe(true);
    });

    it('should create a Machine with optional fields', () => {
      const machine: Machine = {
        id: 'machine-1',
        name: 'Machine 1',
        machineId: 'NC-1234-56',
        isOnline: true,
        lastSeen: new Date(),
        connectionStrength: 95,
        imageUrl: 'https://example.com/image.jpg',
        streamUrl: 'https://example.com/stream.m3u8',
      };

      expect(machine.lastSeen).toBeInstanceOf(Date);
      expect(machine.connectionStrength).toBe(95);
      expect(machine.imageUrl).toBeDefined();
      expect(machine.streamUrl).toBeDefined();
    });
  });

  describe('Batch Type', () => {
    it('should create a valid Batch object', () => {
      const batch: Batch = {
        id: 'batch-1',
        machineId: 'NC-1234-56',
        type: 'feed',
        status: 'queued',
        currentStep: 0,
      };

      expect(batch.id).toBe('batch-1');
      expect(batch.machineId).toBe('NC-1234-56');
      expect(batch.type).toBe('feed');
      expect(batch.status).toBe('queued');
      expect(batch.currentStep).toBe(0);
    });

    it('should support all batch types', () => {
      const types: ProcessType[] = ['feed', 'compost', 'mixed'];

      types.forEach((type) => {
        const batch: Batch = {
          id: 'batch-1',
          machineId: 'NC-1234-56',
          type,
          status: 'running',
          currentStep: 1,
        };

        expect(batch.type).toBe(type);
      });
    });

    it('should support all batch statuses', () => {
      const statuses = ['queued', 'running', 'idle', 'completed', 'error'] as const;

      statuses.forEach((status) => {
        const batch: Batch = {
          id: 'batch-1',
          machineId: 'NC-1234-56',
          type: 'feed',
          status,
          currentStep: 0,
        };

        expect(batch.status).toBe(status);
      });
    });

    it('should create a Batch with optional fields', () => {
      const now = new Date();
      const batch: Batch = {
        id: 'batch-1',
        batchNumber: 'B001',
        machineId: 'NC-1234-56',
        type: 'feed',
        status: 'completed',
        currentStep: 5,
        startTime: now,
        endTime: new Date(now.getTime() + 3600000),
        estimatedWeight: 50,
        actualWeight: 48.5,
      };

      expect(batch.batchNumber).toBe('B001');
      expect(batch.startTime).toEqual(now);
      expect(batch.endTime).toBeDefined();
      expect(batch.estimatedWeight).toBe(50);
      expect(batch.actualWeight).toBe(48.5);
    });
  });

  describe('MachineTelemetry Type', () => {
    it('should create a valid MachineTelemetry object', () => {
      const telemetry: MachineTelemetry = {
        motorState: 'running',
        grinderRPM: 1500,
        dryerTemperature: 65,
        humidity: 50,
        diverterPosition: 'feed',
        doorState: 'closed',
      };

      expect(telemetry.motorState).toBe('running');
      expect(telemetry.grinderRPM).toBe(1500);
      expect(telemetry.dryerTemperature).toBe(65);
      expect(telemetry.humidity).toBe(50);
      expect(telemetry.diverterPosition).toBe('feed');
      expect(telemetry.doorState).toBe('closed');
    });

    it('should support all motor states', () => {
      const motorStates = ['idle', 'running', 'paused'] as const;

      motorStates.forEach((state) => {
        const telemetry: MachineTelemetry = {
          motorState: state,
          grinderRPM: 1000,
          dryerTemperature: 60,
          humidity: 45,
          diverterPosition: 'feed',
          doorState: 'closed',
        };

        expect(telemetry.motorState).toBe(state);
      });
    });

    it('should support all diverter positions', () => {
      const positions = ['feed', 'compost', 'neutral'] as const;

      positions.forEach((position) => {
        const telemetry: MachineTelemetry = {
          motorState: 'running',
          grinderRPM: 1000,
          dryerTemperature: 60,
          humidity: 45,
          diverterPosition: position,
          doorState: 'closed',
        };

        expect(telemetry.diverterPosition).toBe(position);
      });
    });

    it('should support all door states', () => {
      const states = ['open', 'closed'] as const;

      states.forEach((state) => {
        const telemetry: MachineTelemetry = {
          motorState: 'running',
          grinderRPM: 1000,
          dryerTemperature: 60,
          humidity: 45,
          diverterPosition: 'feed',
          doorState: state,
        };

        expect(telemetry.doorState).toBe(state);
      });
    });
  });

  describe('Type Validation', () => {
    it('should validate numeric ranges for telemetry', () => {
      const telemetry: MachineTelemetry = {
        motorState: 'running',
        grinderRPM: 3000,
        dryerTemperature: 80,
        humidity: 99,
        diverterPosition: 'feed',
        doorState: 'closed',
      };

      expect(telemetry.grinderRPM).toBeGreaterThan(0);
      expect(telemetry.dryerTemperature).toBeGreaterThan(0);
      expect(telemetry.humidity).toBeLessThanOrEqual(100);
    });

    it('should handle batch step progression', () => {
      const batch: Batch = {
        id: 'batch-1',
        machineId: 'NC-1234-56',
        type: 'feed',
        status: 'running',
        currentStep: 0,
      };

      // Simulate step progression
      let currentStep = batch.currentStep;
      for (let i = 0; i < 5; i++) {
        currentStep++;
        expect(currentStep).toBeGreaterThan(i);
      }
    });
  });
});
