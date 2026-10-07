import React from 'react';
import type { SimulationMode } from '../types/microgrid';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface SimulationControlsProps {
  currentMode: SimulationMode;
  onSelectMode: (mode: SimulationMode) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
}

export const DemoController: React.FC<SimulationControlsProps> = ({
  currentMode,
  onSelectMode,
  isRunning,
  onToggleRunning,
  onReset,
}) => {
  return (
    <div className="bg-[#111f33] border border-[#1e2e48] rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Simulation Controls:
        </span>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Pause / Resume */}
        <button
          onClick={onToggleRunning}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors border ${
            isRunning
              ? 'bg-[#18283f] text-slate-300 border-[#1e2e48] hover:bg-[#1e2e48]'
              : 'bg-[#22c55e] text-slate-950 border-[#22c55e] font-semibold'
          }`}
          title={isRunning ? 'Pause stream' : 'Resume stream'}
        >
          {isRunning ? (
            <>
              <Pause className="w-3 h-3" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3 h-3" /> Run
            </>
          )}
        </button>

        {/* Normal */}
        <button
          onClick={() => onSelectMode('AUTO_NORMAL')}
          className={`px-3 py-1 rounded text-xs transition-colors border ${
            currentMode === 'AUTO_NORMAL'
              ? 'bg-[#22c55e] text-slate-950 border-[#22c55e] font-semibold'
              : 'bg-[#18283f] text-slate-200 border-[#1e2e48] hover:bg-[#1e2e48]'
          }`}
        >
          Normal (6.0V, 0.48A)
        </button>

        {/* Undervoltage */}
        <button
          onClick={() => onSelectMode('UNDERVOLTAGE')}
          className={`px-3 py-1 rounded text-xs transition-colors border ${
            currentMode === 'UNDERVOLTAGE'
              ? 'bg-[#f59e0b] text-slate-950 border-[#f59e0b] font-semibold'
              : 'bg-[#18283f] text-slate-200 border-[#1e2e48] hover:bg-[#1e2e48]'
          }`}
        >
          Undervoltage (&lt;4.5V)
        </button>

        {/* Overvoltage */}
        <button
          onClick={() => onSelectMode('OVERVOLTAGE')}
          className={`px-3 py-1 rounded text-xs transition-colors border ${
            currentMode === 'OVERVOLTAGE'
              ? 'bg-[#ef4444] text-white border-[#ef4444] font-semibold'
              : 'bg-[#18283f] text-slate-200 border-[#1e2e48] hover:bg-[#1e2e48]'
          }`}
        >
          Overvoltage (&gt;6.8V)
        </button>

        {/* Overcurrent */}
        <button
          onClick={() => onSelectMode('OVERCURRENT')}
          className={`px-3 py-1 rounded text-xs transition-colors border ${
            currentMode === 'OVERCURRENT'
              ? 'bg-[#ef4444] text-white border-[#ef4444] font-semibold'
              : 'bg-[#18283f] text-slate-200 border-[#1e2e48] hover:bg-[#1e2e48]'
          }`}
        >
          Overcurrent (&gt;0.6A)
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-slate-300 hover:text-white bg-[#18283f] border border-[#1e2e48] hover:bg-[#1e2e48] transition-colors ml-1"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
    </div>
  );
};
