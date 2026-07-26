import React from 'react';
import { Volume2, VolumeX, Sparkles, User, Bot, Wifi } from 'lucide-react';
import { BINGO_LETTERS } from '../logic/bingoEngine';

export function BingoHeader({
  playerLetters = [],
  opponentLettersCount = 0,
  isMyTurn = false,
  gamePhase = 'setup', // 'setup' | 'playing' | 'gameover'
  gameMode = 'ai', // 'ai' | 'p2p'
  opponentName = 'Opponent',
  isMuted = false,
  onToggleMute = () => {},
  onOpenRoomModal = () => {},
}) {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-3 p-4 glass-panel rounded-2xl border border-slate-700/50 shadow-2xl mb-4">
      {/* Top Bar: Title & Controls */}
      <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
            🎯
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wide leading-none flex items-center gap-1.5">
              INDIAN <span className="text-amber-400">BINGO</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">5x5 Paper & Pen P2P</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Room / Mode Badge */}
          <button
            onClick={onOpenRoomModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            {gameMode === 'ai' ? (
              <>
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>VS AI</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>P2P Room</span>
              </>
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* B-I-N-G-O Letters Banner */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 w-full justify-center">
          {BINGO_LETTERS.map((letter) => {
            const isUnlocked = playerLetters.includes(letter);
            return (
              <div
                key={letter}
                className={`relative flex-1 max-w-[64px] aspect-square rounded-xl flex items-center justify-center font-black text-2xl sm:text-3xl transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 scale-105 shadow-lg shadow-amber-500/50 ring-2 ring-amber-300 animate-pop'
                    : 'bg-slate-800/60 text-slate-600 border border-slate-700/50'
                }`}
              >
                <span>{letter}</span>
                {isUnlocked && (
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-200 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Turn Indicator & Opponent Progress (During Gameplay) */}
      {gamePhase === 'playing' && (
        <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800/80 text-xs">
          {/* Turn Banner */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isMyTurn ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className={`font-bold ${isMyTurn ? 'text-emerald-400 text-sm' : 'text-slate-400'}`}>
              {isMyTurn ? '👉 YOUR TURN! Click a number' : `⏳ ${opponentName}'s turn...`}
            </span>
          </div>

          {/* Opponent BINGO Progress */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px] font-medium">{opponentName}:</span>
            <div className="flex gap-0.5 font-extrabold text-xs tracking-widest">
              {BINGO_LETTERS.map((letter, idx) => (
                <span
                  key={letter}
                  className={idx < opponentLettersCount ? 'text-amber-400 font-black' : 'text-slate-600'}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
