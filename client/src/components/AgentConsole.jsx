import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Terminal, Shield, Eye, RefreshCw, Cpu } from 'lucide-react';

export default function AgentConsole() {
  const { simulatedLogs, triggerRefresh } = useApp();
  const [filterAgent, setFilterAgent] = useState('All');

  const agents = ['All', 'Prediction Agent', 'Risk Detection Agent', 'Optimization Agent', 'Orchestrator Agent'];

  const filteredLogs = filterAgent === 'All' 
    ? simulatedLogs 
    : simulatedLogs.filter(log => log.agent === filterAgent);

  const getStatusColor = (status) => {
    switch (status) {
      case 'warning': return 'text-amber-400';
      case 'success': return 'text-emerald-400';
      default: return 'text-cyber-indigo';
    }
  };

  const getAgentBadge = (agent) => {
    switch (agent) {
      case 'Risk Detection Agent': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Optimization Agent': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Prediction Agent': return 'bg-cyber-violet/10 text-cyber-violet border-cyber-violet/30';
      default: return 'bg-cyber-indigo/10 text-cyber-indigo border-cyber-indigo/30';
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-gray-800 p-5 shadow-xl flex flex-col h-[400px]">
      
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="text-cyber-indigo h-5 w-5 animate-pulse" />
          <div>
            <h3 className="font-extrabold text-sm text-white tracking-wide uppercase flex items-center gap-1.5">
              AetherGro Agent Console
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Multi-Agent Autonomic Sync Loop</p>
          </div>
        </div>

        {/* Action button */}
        <button 
          onClick={triggerRefresh}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          title="Force Sync Run"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {agents.map(agent => (
          <button
            key={agent}
            onClick={() => setFilterAgent(agent)}
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md border transition-all ${
              (filterAgent === agent)
                ? 'bg-cyber-indigo text-white border-cyber-indigo shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                : 'bg-gray-900/60 text-gray-400 border-gray-850 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {agent === 'All' ? 'All Engines' : agent.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Console Terminal Log Stream */}
      <div className="flex-1 bg-gray-950/80 rounded-xl p-4 border border-gray-900 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-3 shadow-inner">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 italic uppercase tracking-wider text-[10px]">
            <Cpu className="h-4 w-4 mr-1.5 animate-spin" /> No active telemetry loaded. Run synchronization.
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className="flex gap-2.5 items-start border-b border-gray-900/40 pb-2.5 last:border-b-0">
              <span className="text-gray-500 font-semibold select-none flex-shrink-0">[{log.timestamp}]</span>
              
              <div className="flex-1 space-y-1">
                <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-semibold tracking-wider uppercase select-none ${getAgentBadge(log.agent)}`}>
                  {log.agent}
                </span>
                
                <p className={`mt-0.5 tracking-tight font-medium ${getStatusColor(log.status)}`}>
                  {log.message}
                </p>
              </div>
            </div>
          ))
        )}
        <div className="console-cursor"></div>
      </div>

      {/* System Telemetry stats */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-900/40 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
        <div className="flex items-center gap-1"><Cpu className="h-3 w-3 text-cyber-green" /> CPU load: 1.2%</div>
        <div className="flex items-center gap-1"><Shield className="h-3 w-3 text-cyber-violet" /> Security: Zero-Trust</div>
        <div className="flex items-center gap-1"><Eye className="h-3 w-3 text-cyber-indigo" /> Health: Active</div>
      </div>

    </div>
  );
}
