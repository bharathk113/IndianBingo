import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Frown, RotateCcw, Home, Sparkles } from 'lucide-react';
import { BINGO_LETTERS } from '../logic/bingoEngine';

export function GameOverModal({
  isOpen = false,
  isWinner = false,
  winnerName = 'Winner',
  myLinesCount = 0,
  opponentLinesCount = 0,
  totalTurns = 0,
  onRematch = () => {},
  onMainMenu = () => {},
}) {
  useEffect(() => {
    if (isOpen && isWinner) {
      // Trigger canvas confetti celebration burst
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, isWinner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden text-center">
        {/* Decorative Top Aura */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-40 ${
            isWinner ? 'bg-amber-400' : 'bg-red-500'
          }`}
        />

        {/* Icon & Title Header */}
        <div className="relative z-10 flex flex-col items-center gap-2 mb-4">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-1 border ${
              isWinner
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 border-amber-300 shadow-amber-500/30 animate-bounce'
                : 'bg-slate-800 text-red-400 border-red-500/40'
            }`}
          >
            {isWinner ? <Trophy className="w-10 h-10 fill-current" /> : <Frown className="w-10 h-10" />}
          </div>

          <h2 className="font-black text-3xl text-white tracking-wide">
            {isWinner ? (
              <span className="text-amber-400 text-glow-amber">BINGO! YOU WIN!</span>
            ) : (
              <span className="text-red-400">GAME OVER</span>
            )}
          </h2>

          <p className="text-xs text-slate-300 font-medium">
            {isWinner ? 'You lit up all 5 B-I-N-G-O letters first!' : `${winnerName} completed 5 lines first.`}
          </p>
        </div>

        {/* Match Statistics Card */}
        <div className="relative z-10 flex flex-col gap-2 p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs mb-6">
          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
            <span className="font-semibold">Your Lines Completed:</span>
            <span className="font-black text-amber-400 text-sm">{myLinesCount} / 5</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
            <span className="font-semibold">Opponent Lines:</span>
            <span className="font-black text-slate-400 text-sm">{opponentLinesCount} / 5</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold">Total Turns Played:</span>
            <span className="font-black text-white">{totalTurns}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col gap-2.5">
          <button
            onClick={onRematch}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN / REMATCH</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
}
