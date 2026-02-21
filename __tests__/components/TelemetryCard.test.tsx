import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { waitFor } from '@testing-library/react-native';
import TelemetryCard from '../../src/components/TelemetryCard';
import * as api from '../../src/config/api';
import { MachineTelemetry } from '../../src/types';

describe('TelemetryCard Component', () => {
    beforeAll(() => {
      jest.spyOn(api, 'fetchWithAuth').mockImplementation(async () => {
        return {
          json: async () => [{
            humidity: 50,
            temperature: 65,
            feedStatus: 'feed',
          }],
        };
      });
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });
  it('should render with null telemetry data and show batch values', async () => {
    const { getByText } = render(<TelemetryCard telemetry={null} batchStatus={null} />);
    expect(getByText('Motor Status')).toBeTruthy();
    expect(getByText('idle')).toBeTruthy();
    expect(getByText('Temperature')).toBeTruthy();
    expect(getByText('Humidity')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('65')).toBeTruthy(); // batch temperature
      expect(getByText('50')).toBeTruthy(); // batch humidity
      expect(getByText('feed')).toBeTruthy(); // batch feedStatus
    });
  });

  it('should display motor state and batch values', async () => {
    const mockTelemetry: MachineTelemetry = {
      motorState: 'running',
      grinderRPM: 1500,
      dryerTemperature: 65,
      humidity: 50,
      diverterPosition: 'feed',
      doorState: 'closed',
    };
    const { getByText } = render(<TelemetryCard telemetry={mockTelemetry} batchStatus={null} />);
    expect(getByText('running')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('65')).toBeTruthy(); // batch temperature
      expect(getByText('50')).toBeTruthy(); // batch humidity
      expect(getByText('feed')).toBeTruthy(); // batch feedStatus
    });
  });

  it('should display default values when offline', async () => {
    const { getAllByText } = render(<TelemetryCard telemetry={null} batchStatus={null} isOnline={false} />);
    expect(getAllByText('idle')).toBeTruthy(); // default motorState
    const dashTexts = getAllByText('--');
    expect(dashTexts.length).toBeGreaterThan(0); // default values (multiple dashes)
  });

  it('should update motor state when telemetry changes', async () => {
    const initialTelemetry: MachineTelemetry = {
      motorState: 'idle',
      grinderRPM: 0,
      dryerTemperature: 20,
      humidity: 30,
      diverterPosition: 'neutral',
      doorState: 'open',
    };
    const rendered = render(
      <TelemetryCard telemetry={initialTelemetry} batchStatus={null} />
    );
    const { rerender, getByText } = rendered;
    expect(getByText('idle')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('65')).toBeTruthy(); // batch temperature
    });
    const updatedTelemetry: MachineTelemetry = {
      motorState: 'running',
      grinderRPM: 2000,
      dryerTemperature: 75,
      humidity: 60,
      diverterPosition: 'compost',
      doorState: 'closed',
    };
    rerender(<TelemetryCard telemetry={updatedTelemetry} batchStatus={null} />);
    expect(getByText('running')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('65')).toBeTruthy(); // batch temperature
    });
  });

  it('should handle motor states correctly', () => {
    const motorStates: Array<'idle' | 'running' | 'paused'> = ['idle', 'running', 'paused'];
    motorStates.forEach((state) => {
      const rendered = render(<TelemetryCard telemetry={{
        motorState: state,
        grinderRPM: 1000,
        dryerTemperature: 60,
        humidity: 45,
        diverterPosition: 'feed',
        doorState: 'closed',
      }} batchStatus={null} />);
      const { getByText } = rendered;
      expect(getByText(state === 'paused' ? 'idle' : state)).toBeTruthy();
    });
  });

  it('should display batch feedStatus (processing)', async () => {
    const { getByText } = render(<TelemetryCard telemetry={null} batchStatus={null} />);
    await waitFor(() => {
      expect(getByText('feed')).toBeTruthy(); // batch feedStatus
    });
  });

  it('should render container with correct structure', async () => {
    const mockTelemetry: MachineTelemetry = {
      motorState: 'running',
      grinderRPM: 1500,
      dryerTemperature: 65,
      humidity: 50,
      diverterPosition: 'feed',
      doorState: 'closed',
    };
    const { getByText } = render(<TelemetryCard telemetry={mockTelemetry} batchStatus={null} />);
    // Verify all required sections are present
    expect(getByText('Motor Status')).toBeTruthy();
    expect(getByText('Temperature')).toBeTruthy();
    expect(getByText('Humidity')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('65')).toBeTruthy();
      expect(getByText('50')).toBeTruthy();
      expect(getByText('feed')).toBeTruthy();
    });
  });
});
