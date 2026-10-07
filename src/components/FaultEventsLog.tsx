import React from 'react';
import type { FaultEvent } from '../types/microgrid';
import { ListFilter } from 'lucide-react';

interface FaultEventsLogProps {
  events: FaultEvent[];
  onClear?: () => void;
}

export const FaultEventsLog: React.FC<FaultEventsLogProps> = ({ events, onClear }) => {
  return (
    <div className="bg-[#111f33] border border-[#1e2e48] rounded-lg p-4 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1e2e48]">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-[#38bdf8]" />
          <h2 className="text-sm font-semibold text-slate-200">
            Fault Event Log
          </h2>
        </div>

        {onClear && events.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="mt-2 flex-1 overflow-y-auto max-h-[268px]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2e48] text-slate-400 text-[11px]">
              <th className="pb-1.5 font-medium">Time</th>
              <th className="pb-1.5 font-medium">Event</th>
              <th className="pb-1.5 font-medium">V</th>
              <th className="pb-1.5 font-medium">I</th>
              <th className="pb-1.5 font-medium">Relay Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2e48] text-[11px]">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No fault events recorded.
                </td>
              </tr>
            ) : (
              events.map((evt) => {
                const isFault = evt.eventType !== 'NORMAL';
                return (
                  <tr key={evt.id} className="hover:bg-[#18283f]/40 transition-colors">
                    <td className="py-2 text-slate-400 font-mono whitespace-nowrap">
                      {evt.timeStr}
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isFault
                            ? 'bg-[#1a1215] text-[#ef4444] border border-[#ef4444]/40'
                            : 'bg-[#112419] text-[#22c55e] border border-[#22c55e]/40'
                        }`}
                      >
                        {evt.eventType}
                      </span>
                    </td>
                    <td className="py-2 text-slate-200 font-mono whitespace-nowrap">
                      {evt.voltage.toFixed(1)}V
                    </td>
                    <td className="py-2 text-slate-200 font-mono whitespace-nowrap">
                      {evt.current.toFixed(2)}A
                    </td>
                    <td className="py-2 text-slate-300">
                      <span className={isFault ? 'text-[#ef4444] font-medium' : 'text-[#22c55e]'}>
                        {isFault ? 'Trip to OPEN' : 'CLOSED'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400 pt-1.5 border-t border-[#1e2e48] mt-1 text-right">
        <span>Recent 20 state transitions</span>
      </div>
    </div>
  );
};
