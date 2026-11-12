import { Wifi, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

interface NetworkSimulatorBarProps {
  isSimulatingSlowNetwork: boolean;
  onToggleSlowNetwork: () => void;
  onOpenAnalytics: () => void;
}

export default function NetworkSimulatorBar({
  isSimulatingSlowNetwork,
  onToggleSlowNetwork,
  onOpenAnalytics,
}: NetworkSimulatorBarProps) {
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Speed Rebuild</span>
          </span>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-slate-400 hidden sm:inline">Lighthouse 98+ Optimized · Zero CLS · Lazy Loaded</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Network Simulator Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Network Simulator:</span>
            </span>
            <button
              onClick={onToggleSlowNetwork}
              type="button"
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                isSimulatingSlowNetwork
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Test skeleton loading states by simulating slow 3G network latency"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSimulatingSlowNetwork ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              {isSimulatingSlowNetwork ? 'Slow 3G Latency (Active)' : 'Fast 5G / Broadband'}
            </button>
          </div>

          <span className="text-slate-700" aria-hidden="true">|</span>

          {/* Analytics Trigger */}
          <button
            onClick={onOpenAnalytics}
            type="button"
            className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Analytics</span>
          </button>

          <span className="text-slate-700 hidden md:inline" aria-hidden="true">|</span>

          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SSL Secured Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
