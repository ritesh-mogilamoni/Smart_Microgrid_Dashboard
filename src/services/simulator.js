import { USE_FIREBASE, getFirebaseDB, latestRef, historyRef, eventsRef, set, push } from './firebase';

export const DEFAULT_THRESHOLDS = {
  vmin: 4.50, // Vmin in Volts
  vmax: 6.80, // Vmax in Volts
  imax: 0.60, // Imax in Amperes
};

// Generates initial history data so the charts look active immediately on launch
export function generateInitialHistory(count = 12) {
  const records = [];
  const now = Date.now();
  const stepMs = 5000; // 5-second cloud publish interval as per Section IV-B

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * stepMs;
    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Natural solar variance around 6.0V, 0.48A
    const noiseV = (Math.sin(i * 0.7) * 0.08) + (Math.random() * 0.04 - 0.02);
    const noiseI = (Math.cos(i * 0.5) * 0.015) + (Math.random() * 0.01 - 0.005);

    const voltage = parseFloat((6.08 + noiseV).toFixed(2));
    const current = parseFloat((0.48 + noiseI).toFixed(2));
    const power = parseFloat((voltage * current).toFixed(2));

    records.push({
      id: `hist_init_${i}`,
      timestamp,
      timeStr,
      voltage,
      current,
      power,
      faultStatus: 'NORMAL',
      relayState: 'CONNECTED',
    });
  }

  return records;
}

// Initial events list demonstrating audit trail
export function generateInitialEvents() {
  const now = Date.now();
  return [
    {
      id: 'evt_init_1',
      timestamp: now - 180000,
      timeStr: new Date(now - 180000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventType: 'NORMAL',
      voltage: 6.12,
      current: 0.48,
      power: 2.94,
      description: 'System initialized. Edge controller (ESP32) baseline operational.',
    }
  ];
}

// Generate the next sensor readings based on current active mode
export function computeNextReading(mode, thresholds) {
  let baseV = 6.05;
  let baseI = 0.48;

  switch (mode) {
    case 'UNDERVOLTAGE':
      // Panel output drop (e.g. heavy cloud cover / solar obstruction)
      baseV = 3.82 + (Math.random() * 0.2 - 0.1);
      baseI = 0.18 + (Math.random() * 0.04 - 0.02);
      break;

    case 'OVERVOLTAGE':
      // Solar voltage spike beyond upper safety threshold
      baseV = 7.35 + (Math.random() * 0.2 - 0.1);
      baseI = 0.51 + (Math.random() * 0.02 - 0.01);
      break;

    case 'OVERCURRENT':
      // DC load overload / abnormal low-resistance condition
      baseV = 5.75 + (Math.random() * 0.15 - 0.07);
      baseI = 0.82 + (Math.random() * 0.06 - 0.03);
      break;

    case 'AUTO_NORMAL':
    default:
      // Normal operating branch (nominal ~6V, 3W solar source)
      baseV = 6.05 + (Math.random() * 0.12 - 0.06);
      baseI = 0.48 + (Math.random() * 0.02 - 0.01);
      break;
  }

  const voltage = parseFloat(baseV.toFixed(2));
  const current = parseFloat(baseI.toFixed(2));
  // Equation (1): Instantaneous power P(k) = V(k) * I(k)
  const power = parseFloat((voltage * current).toFixed(2));

  // Equation (2): Threshold-based Fault Detection Logic
  // F(k) = 1 if V(k) ∉ [Vmin, Vmax] or I(k) > Imax; else 0
  let faultStatus = 'NORMAL';
  let relayState = 'CONNECTED';
  let reason = 'Operating within safe parameters';

  if (voltage < thresholds.vmin) {
    faultStatus = 'UNDERVOLTAGE';
    relayState = 'ISOLATED';
    reason = `Bus voltage (${voltage}V) below minimum limit (${thresholds.vmin}V). Load isolated via Relay (GPIO 26).`;
  } else if (voltage > thresholds.vmax) {
    faultStatus = 'OVERVOLTAGE';
    relayState = 'ISOLATED';
    reason = `Bus voltage (${voltage}V) exceeded maximum limit (${thresholds.vmax}V). Load isolated via Relay (GPIO 26).`;
  } else if (current > thresholds.imax) {
    faultStatus = 'OVERCURRENT';
    relayState = 'ISOLATED';
    reason = `Load current (${current}A) crossed maximum limit (${thresholds.imax}A). Load isolated via Relay (GPIO 26).`;
  }

  return { voltage, current, power, faultStatus, relayState, reason };
}

// ─── Firebase Write Helpers ────────────────────────────────────────────────────
// These are fire-and-forget. They are complete no-ops when USE_FIREBASE = false,
// so the simulation is 100% unaffected until you flip the flag.

/**
 * Overwrites /latest/ with the most recent sensor reading.
 * Called every second from App.jsx's interval loop.
 */
export async function writeLatestToFirebase(state) {
  if (!USE_FIREBASE) return;
  const db = getFirebaseDB();
  if (!db) return;
  try {
    await set(latestRef(db), state);
  } catch (err) {
    console.warn('[Firebase] writeLatest failed:', err);
  }
}

/**
 * Pushes a new record to /history/ (append-only time series).
 * Called every 5 seconds or on fault transitions from App.jsx.
 */
export async function writeHistoryToFirebase(record) {
  if (!USE_FIREBASE) return;
  const db = getFirebaseDB();
  if (!db) return;
  try {
    await push(historyRef(db), record);
  } catch (err) {
    console.warn('[Firebase] writeHistory failed:', err);
  }
}

/**
 * Pushes a new fault event to /events/ (audit log).
 * Called only when fault state transitions occur.
 */
export async function writeEventToFirebase(event) {
  if (!USE_FIREBASE) return;
  const db = getFirebaseDB();
  if (!db) return;
  try {
    await push(eventsRef(db), event);
  } catch (err) {
    console.warn('[Firebase] writeEvent failed:', err);
  }
}
