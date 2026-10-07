export type FaultStatus = 'NORMAL' | 'UNDERVOLTAGE' | 'OVERVOLTAGE' | 'OVERCURRENT';
export type RelayState = 'CONNECTED' | 'ISOLATED';

export interface LatestState {
  timestamp: number;
  voltage: number;      // in Volts (V)
  current: number;      // in Amperes (A)
  power: number;        // in Watts (W) = V * I
  faultStatus: FaultStatus;
  relayState: RelayState;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  timeStr: string;
  voltage: number;
  current: number;
  power: number;
  faultStatus: FaultStatus;
  relayState: RelayState;
}

export interface FaultEvent {
  id: string;
  timestamp: number;
  timeStr: string;
  eventType: FaultStatus;
  voltage: number;
  current: number;
  power: number;
  description: string;
}

export interface SystemThresholds {
  vmin: number;         // Lower voltage threshold (e.g. 4.5 V)
  vmax: number;         // Upper voltage threshold (e.g. 6.8 V)
  imax: number;         // Max load current (e.g. 0.60 A)
}

export type SimulationMode = 'AUTO_NORMAL' | 'UNDERVOLTAGE' | 'OVERVOLTAGE' | 'OVERCURRENT';
