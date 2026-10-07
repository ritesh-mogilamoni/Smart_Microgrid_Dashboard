import { useState, useEffect, useRef } from 'react';
import type {
  LatestState,
  HistoryRecord,
  FaultEvent,
  SimulationMode,
  SystemThresholds,
} from './types/microgrid';
import {
  DEFAULT_THRESHOLDS,
  generateInitialHistory,
  generateInitialEvents,
  computeNextReading,
} from './services/simulator';
import { KPICards } from './components/KPICards';
import { EdgeHardwarePreview } from './components/EdgeHardwarePreview';
import { Hardware3DViewer } from './components/Hardware3DViewer';
import { TelemetryCharts } from './components/TelemetryCharts';
import { FaultEventsLog } from './components/FaultEventsLog';
import { DemoController } from './components/DemoController';
import { Cpu, Database, Box, Layers, Activity } from 'lucide-react';

export function App() {
  const [thresholds] = useState<SystemThresholds>(DEFAULT_THRESHOLDS);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('AUTO_NORMAL');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  
  // True tab switcher: System Architecture (Default) vs 3D Hardware Model
  const [activeTab, setActiveTab] = useState<'SCHEMATIC' | '3D'>('SCHEMATIC');

  // Initialize state
  const initialHistory = useRef(generateInitialHistory(12));
  const [history, setHistory] = useState<HistoryRecord[]>(initialHistory.current);
  const [events, setEvents] = useState<FaultEvent[]>(generateInitialEvents());

  const lastHistoryRecord = initialHistory.current[initialHistory.current.length - 1];
  const [latest, setLatest] = useState<LatestState>({
    timestamp: lastHistoryRecord.timestamp,
    voltage: lastHistoryRecord.voltage,
    current: lastHistoryRecord.current,
    power: lastHistoryRecord.power,
    faultStatus: lastHistoryRecord.faultStatus,
    relayState: lastHistoryRecord.relayState,
  });

  const prevFaultStatusRef = useRef(latest.faultStatus);
  const secondsCounterRef = useRef(0);

  // 1-second local evaluation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      secondsCounterRef.current += 1;

      const reading = computeNextReading(simulationMode, thresholds);
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString([], {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const updatedLatest: LatestState = {
        timestamp: now,
        voltage: reading.voltage,
        current: reading.current,
        power: reading.power,
        faultStatus: reading.faultStatus,
        relayState: reading.relayState,
      };

      setLatest(updatedLatest);

      // Fault transition -> Instant event log
      if (reading.faultStatus !== prevFaultStatusRef.current) {
        const newEvent: FaultEvent = {
          id: `evt_${now}`,
          timestamp: now,
          timeStr,
          eventType: reading.faultStatus,
          voltage: reading.voltage,
          current: reading.current,
          power: reading.power,
          description: reading.reason,
        };

        setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
        prevFaultStatusRef.current = reading.faultStatus;

        const histItem: HistoryRecord = {
          id: `hist_${now}`,
          timestamp: now,
          timeStr,
          voltage: reading.voltage,
          current: reading.current,
          power: reading.power,
          faultStatus: reading.faultStatus,
          relayState: reading.relayState,
        };
        setHistory((prev) => [...prev.slice(-24), histItem]);
      } else if (secondsCounterRef.current % 5 === 0) {
        // Standard 5-second history cycle
        const histItem: HistoryRecord = {
          id: `hist_${now}`,
          timestamp: now,
          timeStr,
          voltage: reading.voltage,
          current: reading.current,
          power: reading.power,
          faultStatus: reading.faultStatus,
          relayState: reading.relayState,
        };
        setHistory((prev) => [...prev.slice(-24), histItem]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, simulationMode, thresholds]);

  const handleReset = () => {
    setSimulationMode('AUTO_NORMAL');
    const newHist = generateInitialHistory(12);
    setHistory(newHist);
    const lastRec = newHist[newHist.length - 1];
    setLatest({
      timestamp: lastRec.timestamp,
      voltage: lastRec.voltage,
      current: lastRec.current,
      power: lastRec.power,
      faultStatus: 'NORMAL',
      relayState: 'CONNECTED',
    });
    prevFaultStatusRef.current = 'NORMAL';
    setEvents(generateInitialEvents());
    setIsRunning(true);
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100 flex flex-col font-sans">
      {/* Compact Header */}
      <header className="border-b border-[#1e2e48] bg-[#0c1728] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight m-0">
              Renewable Energy Monitoring & Fault Detection
            </h1>
            <span className="text-[10px] bg-[#111f33] text-[#38bdf8] border border-[#1e2e48] px-2 py-0.5 rounded font-mono font-medium">
              SCADA
            </span>
          </div>

          {/* 3 Small Status Indicators */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111f33] border border-[#1e2e48] text-[#f59e0b]">
              <Activity className="w-3 h-3" />
              <span>Simulation Mode</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111f33] border border-[#1e2e48] text-[#38bdf8]">
              <Cpu className="w-3 h-3" />
              <span>Virtual ESP32</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111f33] border border-[#1e2e48] text-[#14b8a6]">
              <Database className="w-3 h-3" />
              <span>Firebase Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
        {/* 1. Compact Simulation Controls */}
        <DemoController
          currentMode={simulationMode}
          onSelectMode={(mode) => setSimulationMode(mode)}
          isRunning={isRunning}
          onToggleRunning={() => setIsRunning(!isRunning)}
          onReset={handleReset}
        />

        {/* 2. Key Measurements (Simplified KPI Cards) */}
        <KPICards latest={latest} thresholds={thresholds} />

        {/* 3. System Visualization (True Tabs) */}
        <div className="space-y-3">
          {/* Tab Switcher */}
          <div className="flex items-center border-b border-[#1e2e48] pb-1 gap-2 text-xs">
            <button
              onClick={() => setActiveTab('SCHEMATIC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-medium transition-colors border-b-2 ${
                activeTab === 'SCHEMATIC'
                  ? 'border-[#38bdf8] text-white bg-[#111f33]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>System Architecture</span>
            </button>

            <button
              onClick={() => setActiveTab('3D')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-medium transition-colors border-b-2 ${
                activeTab === '3D'
                  ? 'border-[#38bdf8] text-white bg-[#111f33]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-[#14b8a6]" />
              <span>3D Hardware Model</span>
            </button>
          </div>

          {/* Tab Content: Only show one at a time */}
          {activeTab === 'SCHEMATIC' ? (
            <EdgeHardwarePreview latest={latest} />
          ) : (
            <Hardware3DViewer latest={latest} />
          )}
        </div>

        {/* 4. Trends (65%) + Event Log (35%) Side-by-Side on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Electrical Trends (65% ~ 8 cols) */}
          <div className="lg:col-span-8">
            <TelemetryCharts history={history} />
          </div>

          {/* Fault Event Log (35% ~ 4 cols) */}
          <div className="lg:col-span-4">
            <FaultEventsLog events={events} onClear={() => setEvents([])} />
          </div>
        </div>
      </main>

      {/* Small Clean Footer */}
      <footer className="border-t border-[#1e2e48] bg-[#0c1728] py-3 text-xs text-slate-400 text-center font-sans">
        <span>INA219 • ESP32 DevKit V1 • Firebase RTDB • Anurag University</span>
      </footer>
    </div>
  );
}

export default App;
