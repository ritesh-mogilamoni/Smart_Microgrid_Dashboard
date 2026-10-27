import { Zap, Activity, Cpu, ShieldCheck, ShieldAlert } from 'lucide-react';

export const KPICards = ({ latest, thresholds }) => {
  const isFault = latest.faultStatus !== 'NORMAL';
  const isRelayClosed = latest.relayState === 'CONNECTED';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Bus Voltage */}
      <div className={`p-4 rounded-lg bg-[#111f33] border transition-colors ${
        latest.faultStatus === 'UNDERVOLTAGE' || latest.faultStatus === 'OVERVOLTAGE'
          ? 'border-[#ef4444]'
          : 'border-[#1e2e48]'
      }`}>
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-slate-300">Bus Voltage</span>
          <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
        </div>
        <div className="my-1.5 flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono tracking-tight text-white">
            {latest.voltage.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-[#38bdf8]">V</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Safe: <span className="font-mono text-slate-300">{thresholds.vmin} – {thresholds.vmax} V</span>
        </div>
      </div>

      {/* Load Current */}
      <div className={`p-4 rounded-lg bg-[#111f33] border transition-colors ${
        latest.faultStatus === 'OVERCURRENT'
          ? 'border-[#ef4444]'
          : 'border-[#1e2e48]'
      }`}>
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-slate-300">Load Current</span>
          <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
        </div>
        <div className="my-1.5 flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono tracking-tight text-white">
            {latest.current.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-[#38bdf8]">A</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Limit: <span className="font-mono text-slate-300">≤ {thresholds.imax} A</span>
        </div>
      </div>

      {/* Instantaneous Power */}
      <div className="p-4 rounded-lg bg-[#111f33] border border-[#1e2e48]">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-slate-300">Power</span>
          <Cpu className="w-3.5 h-3.5 text-[#14b8a6]" />
        </div>
        <div className="my-1.5 flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono tracking-tight text-white">
            {latest.power.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-[#14b8a6]">W</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Instantaneous output
        </div>
      </div>

      {/* System Status */}
      <div className={`p-4 rounded-lg bg-[#111f33] border transition-colors ${
        isFault ? 'border-[#ef4444]' : 'border-[#1e2e48]'
      }`}>
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-slate-300">System Status</span>
          {isFault ? (
            <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
          )}
        </div>
        <div className="my-1.5 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isFault ? 'bg-[#ef4444]' : 'bg-[#22c55e]'}`} />
          <span className={`text-2xl font-bold font-mono tracking-tight ${
            isFault ? 'text-[#ef4444]' : 'text-[#22c55e]'
          }`}>
            {latest.faultStatus}
          </span>
        </div>
        <div className={`text-[11px] ${isFault ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
          {isFault ? 'Fault condition flagged' : 'Operating within limits'}
        </div>
      </div>

      {/* Relay State */}
      <div className={`p-4 rounded-lg bg-[#111f33] border transition-colors ${
        !isRelayClosed ? 'border-[#ef4444]' : 'border-[#1e2e48]'
      }`}>
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-slate-300">Relay State</span>
          <span className="text-[10px] font-mono text-slate-400">GPIO 26</span>
        </div>
        <div className="my-1.5 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRelayClosed ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
          <span className={`text-2xl font-bold font-mono tracking-tight ${
            isRelayClosed ? 'text-[#22c55e]' : 'text-[#ef4444]'
          }`}>
            {isRelayClosed ? 'CLOSED' : 'OPEN'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          {isRelayClosed ? 'Load connected' : 'Load isolated'}
        </div>
      </div>
    </div>
  );
};
