import React from 'react';
import type { LatestState } from '../types/microgrid';
import { Sun, Radio, Shield, Lightbulb, Cpu, ArrowRight } from 'lucide-react';

interface SystemArchitectureViewProps {
  latest: LatestState;
}

export const EdgeHardwarePreview: React.FC<SystemArchitectureViewProps> = ({ latest }) => {
  const isHealthy = latest.faultStatus === 'NORMAL';
  const isRelayClosed = latest.relayState === 'CONNECTED';

  const statusStr = isHealthy ? 'OK' : 'TRIP';
  const line1 = `V: ${latest.voltage.toFixed(2)}V  I: ${latest.current.toFixed(2)}A`.padEnd(16, ' ').slice(0, 16);
  const line2 = `P: ${latest.power.toFixed(2)}W  ${statusStr}`.padEnd(16, ' ').slice(0, 16);

  return (
    <div className="bg-[#111f33] border border-[#1e2e48] rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1e2e48] gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            System Architecture & Signal Path
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Renewable PV branch with edge-side threshold evaluation and relay actuation
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="bg-[#18283f] px-2 py-0.5 rounded border border-[#1e2e48]">
            I2C: GPIO 21/22
          </span>
          <span className="bg-[#18283f] px-2 py-0.5 rounded border border-[#1e2e48]">
            Relay: GPIO 26
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
        {/* Block Diagram */}
        <div className="lg:col-span-8 flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-[#0a1424] rounded border border-[#1e2e48]">
          {/* Solar Panel */}
          <div className="flex-1 w-full md:w-auto p-3 rounded bg-[#111f33] border border-[#1e2e48]">
            <div className="flex items-center gap-2 text-slate-200 mb-1">
              <Sun className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-xs font-semibold">6V, 3W Panel</span>
            </div>
            <div className="text-xs font-mono text-[#f59e0b] font-medium">
              {latest.voltage.toFixed(2)} V
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Solar DC Source</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 md:rotate-0 flex-shrink-0" />

          {/* INA219 */}
          <div className="flex-1 w-full md:w-auto p-3 rounded bg-[#111f33] border border-[#1e2e48]">
            <div className="flex items-center gap-2 text-slate-200 mb-1">
              <Radio className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-xs font-semibold">INA219 Sensor</span>
            </div>
            <div className="text-xs font-mono text-[#38bdf8] font-medium">
              {latest.current.toFixed(2)} A
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">12-bit I2C Monitor</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 md:rotate-0 flex-shrink-0" />

          {/* ESP32 */}
          <div className="flex-1 w-full md:w-auto p-3 rounded bg-[#111f33] border border-[#1e2e48]">
            <div className="flex items-center gap-2 text-slate-200 mb-1">
              <Cpu className="w-4 h-4 text-[#14b8a6]" />
              <span className="text-xs font-semibold">ESP32 DevKit</span>
            </div>
            <div className="text-xs font-mono text-[#14b8a6] font-medium">
              {latest.power.toFixed(2)} W
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Edge Controller</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 md:rotate-0 flex-shrink-0" />

          {/* Relay */}
          <div className={`flex-1 w-full md:w-auto p-3 rounded border transition-colors ${
            isRelayClosed
              ? 'bg-[#111f33] border-[#1e2e48]'
              : 'bg-[#1a1215] border-[#ef4444]'
          }`}>
            <div className="flex items-center gap-2 text-slate-200 mb-1">
              <Shield className={`w-4 h-4 ${isRelayClosed ? 'text-[#22c55e]' : 'text-[#ef4444]'}`} />
              <span className="text-xs font-semibold">5V Relay</span>
            </div>
            <div className={`text-xs font-mono font-bold ${
              isRelayClosed ? 'text-[#22c55e]' : 'text-[#ef4444]'
            }`}>
              {isRelayClosed ? 'CLOSED' : 'OPEN'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">GPIO 26</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 md:rotate-0 flex-shrink-0" />

          {/* Load */}
          <div className={`flex-1 w-full md:w-auto p-3 rounded border transition-colors ${
            isRelayClosed
              ? 'bg-[#111f33] border-[#1e2e48]'
              : 'bg-[#0a1424] border-[#1e2e48] opacity-60'
          }`}>
            <div className="flex items-center gap-2 text-slate-200 mb-1">
              <Lightbulb className={`w-4 h-4 ${isRelayClosed ? 'text-[#f59e0b]' : 'text-slate-500'}`} />
              <span className="text-xs font-semibold">DC Load</span>
            </div>
            <div className={`text-xs font-mono ${
              isRelayClosed ? 'text-[#f59e0b] font-medium' : 'text-slate-500'
            }`}>
              {isRelayClosed ? 'Active' : 'Isolated'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">5V LED Lamp</div>
          </div>
        </div>

        {/* 16x2 Character LCD Mockup */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="w-full max-w-[290px] bg-[#0c180e] border-2 border-[#1c3822] rounded p-3 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#22c55e] pb-1 mb-1 border-b border-[#1c3822]">
              <span>16×2 I2C LCD (Local Display)</span>
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-[#22c55e]' : 'bg-[#ef4444] animate-pulse'}`} />
            </div>
            <div className="font-mono text-sm tracking-wider text-[#22c55e] bg-[#061008] p-2.5 rounded border border-[#142918] space-y-1 select-none">
              <div className="whitespace-pre">{line1}</div>
              <div className="whitespace-pre">{line2}</div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1.5 text-center">
              Independent of network connection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
