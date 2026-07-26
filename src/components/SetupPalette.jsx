import React from 'react';
import { Shuffle, RotateCcw, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { isValidGrid } from '../logic/bingoEngine';

export function SetupPalette({
  grid = [],
  selectedIdx = 0,
  onRandomize = () => {},
  onClear = () => {},
  onSelectNumberForCell = () => {},
  onReady = () => {},
  isReady = false,
  isWaitingForPeer = false,
}) {
  // Compute unplaced numbers 1 to 25
  const placedNumbers = new Set(grid.filter((n) => n !== null && n !== undefined));
  const remainingNumbers = Array.from({ length: 25 }, (_, i) => i + 1).filter(
    (n) => !placedNumbers.has(n)
  );

  const filledCount = placedNumbers.size;
  const isComplete = isValidGrid(grid);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-3 p-4 glass-panel rounded-2xl border border-slate-700/50 shadow-xl mt-4">
      {/* Top Header: Info & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/40 pb-3">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
          )}
          <div>
            <h3 className="font-bold text-sm text-white">Board Setup</h3>
            <p className="text-xs text-slate-400">
              {filledCount}/25 numbers placed {isComplete ? '(Complete!)' : '- Tap slot or pick below'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Randomize Button */}
          <button
            onClick={onRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition active:scale-95"
            title="Randomly fill grid 1-25"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Randomize</span>
          </button>

          {/* Clear Board Button */}
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition active:scale-95"
            title="Clear grid"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Unplaced Numbers Palette (Only if board is not full) */}
      {!isComplete && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Tap to place in slot #{selectedIdx + 1}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {remainingNumbers.map((num) => (
              <button
                key={num}
                onClick={() => onSelectNumberForCell(num)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700/70 text-slate-200 font-bold text-sm transition active:scale-95 flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ready / Start Game Button */}
      <button
        onClick={onReady}
        disabled={!isComplete || isWaitingForPeer}
        className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
          isWaitingForPeer
            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 animate-pulse cursor-wait'
            : isComplete
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 active:scale-95 cursor-pointer ring-2 ring-emerald-300'
            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
        }`}
      >
        {isWaitingForPeer ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
            <span>WAITING FOR OPPONENT TO READY UP...</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            <span>{isReady ? 'READY! START GAME' : 'READY (FILL ALL 25 SLOTS)'}</span>
          </>
        )}
      </button>
    </div>
  );
}
