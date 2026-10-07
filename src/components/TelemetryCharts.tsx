import React, { useState } from 'react';
import type { HistoryRecord } from '../types/microgrid';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TelemetryChartsProps {
  history: HistoryRecord[];
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ history }) => {
  const [metricView, setMetricView] = useState<'ALL' | 'VOLTAGE' | 'POWER' | 'CURRENT'>('ALL');

  return (
    <div className="bg-[#111f33] border border-[#1e2e48] rounded-lg p-4 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[#1e2e48] gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#14b8a6]" />
          <h2 className="text-sm font-semibold text-slate-200">
            Electrical Telemetry Trends
          </h2>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-1 bg-[#0a1424] p-0.5 rounded border border-[#1e2e48] text-[11px]">
          <button
            onClick={() => setMetricView('ALL')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metricView === 'ALL'
                ? 'bg-[#18283f] text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMetricView('VOLTAGE')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metricView === 'VOLTAGE'
                ? 'bg-[#f59e0b] text-slate-950 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voltage
          </button>
          <button
            onClick={() => setMetricView('POWER')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metricView === 'POWER'
                ? 'bg-[#14b8a6] text-slate-950 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Power
          </button>
          <button
            onClick={() => setMetricView('CURRENT')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metricView === 'CURRENT'
                ? 'bg-[#38bdf8] text-slate-950 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Current
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full mt-2 font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1e2e48" />

            <XAxis
              dataKey="timeStr"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={{ stroke: '#1e2e48' }}
              minTickGap={50} // Keeps ~6 to 8 clean labels
            />

            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={{ stroke: '#1e2e48' }}
              domain={[0, 8]}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#38bdf8"
              tick={{ fill: '#38bdf8', fontSize: 10 }}
              tickLine={{ stroke: '#1e2e48' }}
              domain={[0, 1.0]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0a1424',
                borderColor: '#1e2e48',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="plainline"
              wrapperStyle={{ paddingBottom: '6px', fontSize: '11px' }}
            />

            {(metricView === 'ALL' || metricView === 'VOLTAGE') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="voltage"
                name="Voltage (V)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#f59e0b' }}
                isAnimationActive={false}
              />
            )}

            {(metricView === 'ALL' || metricView === 'POWER') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="power"
                name="Power (W)"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#14b8a6' }}
                isAnimationActive={false}
              />
            )}

            {(metricView === 'ALL' || metricView === 'CURRENT') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="current"
                name="Current (A)"
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 4, fill: '#38bdf8' }}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-[#1e2e48]">
        <span>Left: V (0–8V), P (0–8W)</span>
        <span>Right: I (0–1.0A)</span>
      </div>
    </div>
  );
};
