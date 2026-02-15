import React from 'react';
import { render } from '@testing-library/react-native';
import TelemetryCard from '../../src/components/TelemetryCard';
import { MachineTelemetry } from '../../src/types';

describe('TelemetryCard Component', () => {
  it('should render with null telemetry data', () => {
    const { getByText } = render(<TelemetryCard telemetry={null} />);
    
    expect(getByText('Motor Status')).toBeTruthy();
    expect(getByText('idle')).toBeTruthy();
    expect(getByText('Temperature')).toBeTruthy();
    expect(getByText('Humidity')).toBeTruthy();
  });

  it('should display telemetry data correctly', () => {
    const mockTelemetry: MachineTelemetry = {
      motorState: 'running',
      grinderRPM: 1500,
      dryerTemperature: 65,
      humidity: 50,
      diverterPosition: 'feed',
      doorState: 'closed',
    };

    const { getByText } = render(<TelemetryCard telemetry={mockTelemetry} />);
    
    expect(getByText('running')).toBeTruthy();
    expect(getByText('65')).toBeTruthy();
    expect(getByText('50')).toBeTruthy();
    expect(getByText('feed')).toBeTruthy();
  });

  it('should display default values when telemetry is null', () => {
    const { getAllByText } = render(<TelemetryCard telemetry={null} />);
    
    expect(getAllByText('idle')).toBeTruthy(); // default motorState
    const dashTexts = getAllByText('--');
    expect(dashTexts.length).toBeGreaterThan(0); // default values (multiple dashes)
  });

  it('should update when telemetry data changes', () => {
    const initialTelemetry: MachineTelemetry = {
      motorState: 'idle',
      grinderRPM: 0,
      dryerTemperature: 20,
      humidity: 30,
      diverterPosition: 'neutral',
      doorState: 'open',
    };

    const { rerender, getByText } = render(
      <TelemetryCard telemetry={initialTelemetry} />
    );

    expect(getByText('idle')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();

    const updatedTelemetry: MachineTelemetry = {
      motorState: 'running',
      grinderRPM: 2000,
      dryerTemperature: 75,
      humidity: 60,
      diverterPosition: 'compost',
      doorState: 'closed',
    };

    rerender(<TelemetryCard telemetry={updatedTelemetry} />);

    expect(getByText('running')).toBeTruthy();
    expect(getByText('75')).toBeTruthy();
  });

  it('should handle motor states correctly', () => {
    const motorStates: Array<'idle' | 'running' | 'paused'> = ['idle', 'running', 'paused'];

    motorStates.forEach((state) => {
      const telemetry: MachineTelemetry = {
        motorState: state,
        grinderRPM: 1000,
        dryerTemperature: 60,
        humidity: 45,
        diverterPosition: 'feed',
        doorState: 'closed',
      };

      const { getByText } = render(<TelemetryCard telemetry={telemetry} />);
      expect(getByText(state)).toBeTruthy();
    });
  });

  it('should display all diverter positions', () => {
    const diverterPositions: Array<'feed' | 'compost' | 'neutral'> = ['feed', 'compost', 'neutral'];

    diverterPositions.forEach((position) => {
      const telemetry: MachineTelemetry = {
        motorState: 'running',
        grinderRPM: 1000,
        dryerTemperature: 60,
        humidity: 45,
        diverterPosition: position,
        doorState: 'closed',
      };

      const { getByText } = render(<TelemetryCard telemetry={telemetry} />);
      expect(getByText(position)).toBeTruthy();
    });
  });

  it('should render container with correct structure', () => {
    const mockTelemetry: MachineTelemetry = {
      motorState: 'running',
      grinderRPM: 1500,
      dryerTemperature: 65,
      humidity: 50,
      diverterPosition: 'feed',
      doorState: 'closed',
    };

    const { getByText } = render(<TelemetryCard telemetry={mockTelemetry} />);
    
    // Verify all required sections are present
    expect(getByText('Motor Status')).toBeTruthy();
    expect(getByText('Temperature')).toBeTruthy();
    expect(getByText('Humidity')).toBeTruthy();
  });
});
