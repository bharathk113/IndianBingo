import React, { useState, useEffect } from 'react';
import { Bot, Users, Copy, Check, Wifi, ArrowRight, X, Sparkles } from 'lucide-react';

export function RoomModal({
  isOpen = false,
  onClose = () => {},
  onSelectMode = () => {}, // mode: 'ai' | 'host' | 'join'
  roomId = null,
  connectionStatus = 'disconnected', // 'disconnected' | 'connecting' | 'connected'
  onHostRoom = () => {},
  onJoinRoom = () => {},
  initialRoomCode = '',
}) {
  const [activeTab, setActiveTab] = useState('host'); // 'host' | 'join' | 'ai'
  const [joinCodeInput, setJoinCodeInput] = useState(initialRoomCode);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialRoomCode) {
      setJoinCodeInput(initialRoomCode);
      setActiveTab('join');
    }
  }, [initialRoomCode]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!roomId) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinCodeInput.trim()) {
      onJoinRoom(joinCodeInput.trim().toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white">Game Mode & Multiplayer</h2>
            <p className="text-xs text-slate-400">Play vs AI offline or host/join P2P room</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('host')}
            className={`py-2 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              activeTab === 'host'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Host Game</span>
          </button>

          <button
            onClick={() => setActiveTab('join')}
            className={`py-2 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Join Room</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>VS AI</span>
          </button>
        </div>

        {/* Tab Content: Host Room */}
        {activeTab === 'host' && (
          <div className="flex flex-col gap-4">
            {!roomId ? (
              <button
                onClick={onHostRoom}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>CREATE MULTIPLAYER ROOM</span>
              </button>
            ) : (
              <div className="flex flex-col gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Your Room Code</span>
                <div className="font-black text-3xl text-amber-400 tracking-widest text-glow-amber">
                  {roomId}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span className={connectionStatus === 'connected' ? 'text-emerald-400' : 'text-amber-300'}>
                    {connectionStatus === 'connected' ? 'Peer Connected! Ready to play.' : 'Waiting for guest to join...'}
                  </span>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="mt-2 w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Invite Link Copied!' : 'Copy Room Invite Link'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Join Room */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Enter Host Room Code:</label>
              <input
                type="text"
                placeholder="e.g. BINGO-4921"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-black tracking-widest text-center text-lg focus:outline-none focus:border-amber-400 uppercase placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!joinCodeInput.trim() || connectionStatus === 'connecting'}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {connectionStatus === 'connecting' ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>CONNECTING TO HOST...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>CONNECT & JOIN GAME</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab Content: VS AI */}
        {activeTab === 'ai' && (
          <div className="flex flex-col gap-4 text-center">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <Bot className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-white mb-1">Play Against Smart Computer AI</h3>
              <p className="text-xs text-slate-400">
                No internet or friend required. Practice your setup and line strategies against the AI bot.
              </p>
            </div>

            <button
              onClick={() => {
                onSelectMode('ai');
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 fill-current" />
              <span>START VS AI GAME</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
