import React from 'react';
import { WINNING_LINE_PATTERNS } from '../logic/bingoEngine';

export function BingoGrid({
  grid = [],
  crossedNumbers = new Set(),
  completedLines = [],
  gamePhase = 'setup', // 'setup' | 'playing' | 'gameover'
  isMyTurn = false,
  selectedSetupIdx = null,
  onCellClick = () => {},
  lastCrossedNumber = null,
}) {
  const crossedSet = crossedNumbers instanceof Set ? crossedNumbers : new Set(crossedNumbers);

  // Helper to calculate SVG coordinate percentages for winning line strikethroughs
  const getLineCoordinates = (pattern) => {
    if (pattern.type === 'row') {
      const y = (pattern.index + 0.5) * 20;
      return { x1: '4%', y1: `${y}%`, x2: '96%', y2: `${y}%` };
    }
    if (pattern.type === 'col') {
      const x = (pattern.index + 0.5) * 20;
      return { x1: `${x}%`, y1: '4%', x2: `${x}%`, y2: '96%' };
    }
    if (pattern.id === 'diag-main') {
      return { x1: '6%', y1: '6%', x2: '94%', y2: '94%' };
    }
    if (pattern.id === 'diag-anti') {
      return { x1: '94%', y1: '6%', x2: '6%', y2: '94%' };
    }
    return { x1: '0%', y1: '0%', x2: '0%', y2: '0%' };
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square p-2 bg-slate-900/90 rounded-2xl border-2 border-slate-800 shadow-2xl overflow-hidden">
      {/* 5x5 Grid Layout */}
      <div className="grid grid-cols-5 grid-rows-5 gap-1.5 w-full h-full">
        {Array.from({ length: 25 }).map((_, idx) => {
          const val = grid[idx];
          const isCrossed = val && crossedSet.has(val);
          const isSelectedForSetup = gamePhase === 'setup' && selectedSetupIdx === idx;
          const isJustCrossed = val && lastCrossedNumber === val;

          return (
            <button
              key={idx}
              onClick={() => onCellClick(idx, val)}
              disabled={gamePhase === 'playing' && (!isMyTurn || isCrossed || !val)}
              className={`relative flex items-center justify-center rounded-xl font-black text-xl sm:text-2xl md:text-3xl transition-all duration-200 select-none overflow-hidden ${
                gamePhase === 'setup'
                  ? isSelectedForSetup
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-300 scale-95 z-10 shadow-lg shadow-amber-500/40'
                    : val
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80'
                    : 'bg-slate-950/80 hover:bg-slate-800/60 text-slate-600 border border-dashed border-slate-700'
                  : isCrossed
                  ? 'bg-slate-950/90 text-slate-500 border border-slate-900 shadow-inner'
                  : isMyTurn && val
                  ? 'bg-slate-800 hover:bg-amber-500/20 hover:border-amber-400/80 text-white border border-slate-700 hover:scale-[1.03] cursor-pointer shadow-md'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700/50 opacity-90'
              }`}
            >
              {/* Cell Number */}
              <span className={`relative z-10 ${isCrossed ? 'line-through text-slate-600 opacity-60' : ''}`}>
                {val !== null && val !== undefined ? val : idx + 1}
              </span>

              {/* Crossed Out 'X' Stamp Overlay */}
              {isCrossed && (
                <div
                  className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 ${
                    isJustCrossed ? 'animate-stamp' : ''
                  }`}
                >
                  <span className="font-black text-4xl sm:text-5xl text-red-500/90 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] select-none">
                    ✕
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* SVG Winning Lines Overlay */}
      {completedLines.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 p-2">
          <defs>
            <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {completedLines.map((pattern) => {
            const coords = getLineCoordinates(pattern);
            return (
              <line
                key={pattern.id}
                x1={coords.x1}
                y1={coords.y1}
                x2={coords.x2}
                y2={coords.y2}
                stroke="url(#lineGlow)"
                strokeWidth="7"
                strokeLinecap="round"
                filter="url(#glow)"
                className="transition-all duration-500 opacity-90 animate-pulse"
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
