import React, { useState, useEffect, useCallback } from 'react';
import { BingoHeader } from './components/BingoHeader';
import { BingoGrid } from './components/BingoGrid';
import { SetupPalette } from './components/SetupPalette';
import { RoomModal } from './components/RoomModal';
import { GameOverModal } from './components/GameOverModal';
import {
  generateRandomGrid,
  isValidGrid,
  evaluateGrid,
  getSmartAIMove,
} from './logic/bingoEngine';
import { peerManager } from './network/peerManager';
import {
  playPop,
  playCross,
  playLineChime,
  playVictoryFanfare,
  playDefeat,
  getMuted,
  setMuted,
} from './audio/soundEffects';

export function App() {
  // Game Setup & State
  const [grid, setGrid] = useState(() => generateRandomGrid());
  const [selectedSetupIdx, setSelectedSetupIdx] = useState(0);
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup' | 'playing' | 'gameover'
  const [gameMode, setGameMode] = useState('ai'); // 'ai' | 'p2p'
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [crossedNumbers, setCrossedNumbers] = useState(new Set());
  const [lastCrossedNumber, setLastCrossedNumber] = useState(null);
  const [totalTurns, setTotalTurns] = useState(0);

  // Ready & Multiplayer States
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [opponentName, setOpponentName] = useState('AI Bot');
  const [roomId, setRoomId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [initialRoomCode, setInitialRoomCode] = useState('');

  // AI Opponent Grid
  const [aiGrid, setAiGrid] = useState(() => generateRandomGrid());

  // Audio Mute State
  const [isMutedState, setIsMutedState] = useState(() => getMuted());

  // Evaluated Scores
  const myEval = evaluateGrid(grid, crossedNumbers);
  const [opponentLettersCount, setOpponentLettersCount] = useState(0);
  const [prevMyLinesCount, setPrevMyLinesCount] = useState(0);

  // Victory / Defeat Modal States
  const [isWinner, setIsWinner] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

  // Check URL params for ?room=CODE on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInitialRoomCode(roomParam.toUpperCase());
      setIsRoomModalOpen(true);
      setGameMode('p2p');
    }
  }, []);

  // WebRTC P2P Event Listeners
  useEffect(() => {
    const handleRoomCreated = ({ roomId: id }) => {
      setRoomId(id);
      setConnectionStatus('connecting');
    };

    const handleConnected = ({ role }) => {
      setConnectionStatus('connected');
      setGameMode('p2p');
      setOpponentName(role === 'host' ? 'Guest Player' : 'Host Player');
    };

    const handlePeerDisconnected = () => {
      setConnectionStatus('disconnected');
      alert('Opponent disconnected from the room.');
    };

    const handleMessage = (data) => {
      if (data.type === 'READY') {
        setOpponentReady(true);
      } else if (data.type === 'START_GAME') {
        setGamePhase('playing');
        setIsMyTurn(data.currentTurn === peerManager.role);
      } else if (data.type === 'MARK_NUMBER') {
        const num = data.value;
        applyNumberCross(num, false);
      } else if (data.type === 'REMATCH_REQUEST') {
        resetGameForRematch();
      }
    };

    peerManager.on('room_created', handleRoomCreated);
    peerManager.on('connected', handleConnected);
    peerManager.on('peer_disconnected', handlePeerDisconnected);
    peerManager.on('message', handleMessage);

    return () => {
      peerManager.off('room_created', handleRoomCreated);
      peerManager.off('connected', handleConnected);
      peerManager.off('peer_disconnected', handlePeerDisconnected);
      peerManager.off('message', handleMessage);
    };
  }, [grid]);

  // Play line chime sound when player completes a new BINGO line
  useEffect(() => {
    if (myEval.count > prevMyLinesCount && gamePhase === 'playing') {
      playLineChime();
    }
    setPrevMyLinesCount(myEval.count);
  }, [myEval.count, gamePhase, prevMyLinesCount]);

  // Sound Mute Toggle Handler
  const handleToggleMute = () => {
    const nextMuted = !isMutedState;
    setIsMutedState(nextMuted);
    setMuted(nextMuted);
  };

  // Setup Phase: Cell and Palette Interactions
  const handleRandomizeGrid = () => {
    playPop();
    setGrid(generateRandomGrid());
    setSelectedSetupIdx(0);
  };

  const handleClearGrid = () => {
    playPop();
    setGrid(Array(25).fill(null));
    setSelectedSetupIdx(0);
  };

  const handleCellClickInSetup = (idx) => {
    playPop();
    setSelectedSetupIdx(idx);
  };

  const handleSelectNumberForCell = (num) => {
    playPop();
    const newGrid = [...grid];
    // Remove num if placed elsewhere
    const existingIdx = newGrid.indexOf(num);
    if (existingIdx !== -1) {
      newGrid[existingIdx] = null;
    }
    newGrid[selectedSetupIdx] = num;
    setGrid(newGrid);

    // Auto advance to next empty slot
    const nextEmpty = newGrid.findIndex((val, i) => i > selectedSetupIdx && val === null);
    if (nextEmpty !== -1) {
      setSelectedSetupIdx(nextEmpty);
    } else {
      const firstEmpty = newGrid.findIndex((val) => val === null);
      if (firstEmpty !== -1) setSelectedSetupIdx(firstEmpty);
    }
  };

  // Ready & Start Game Logic
  const handleReadyToPlay = () => {
    playPop();
    setMyReady(true);

    if (gameMode === 'ai') {
      // Instant Start in AI mode
      setAiGrid(generateRandomGrid());
      setOpponentReady(true);
      setGamePhase('playing');
      setIsMyTurn(true);
      setOpponentName('AI Bot');
      setCrossedNumbers(new Set());
      setOpponentLettersCount(0);
      setTotalTurns(0);
    } else {
      // P2P Multiplayer mode
      peerManager.send({ type: 'READY' });
      if (opponentReady && peerManager.role === 'host') {
        const firstTurn = Math.random() > 0.5 ? 'host' : 'guest';
        peerManager.send({ type: 'START_GAME', currentTurn: firstTurn });
        setGamePhase('playing');
        setIsMyTurn(firstTurn === 'host');
        setCrossedNumbers(new Set());
        setOpponentLettersCount(0);
        setTotalTurns(0);
      }
    }
  };

  // Trigger Host and Join Room
  const handleHostRoom = () => {
    peerManager.createRoom();
  };

  const handleJoinRoom = (code) => {
    peerManager.joinRoom(code);
  };

  // Core Action: Crossing a Number off the Board
  const applyNumberCross = useCallback(
    (num, wasMyMove) => {
      playCross();
      setLastCrossedNumber(num);
      setTotalTurns((prev) => prev + 1);

      setCrossedNumbers((prevSet) => {
        const nextSet = new Set(prevSet);
        nextSet.add(num);

        // Check Player Win
        const playerEval = evaluateGrid(grid, nextSet);

        // Check Opponent / AI Win
        let oppLinesCount = opponentLettersCount;
        if (gameMode === 'ai') {
          const aiEval = evaluateGrid(aiGrid, nextSet);
          oppLinesCount = aiEval.count;
          setOpponentLettersCount(oppLinesCount);
        }

        // Determine if Game Over
        if (playerEval.isWin || oppLinesCount >= 5) {
          setGamePhase('gameover');
          const playerWon = playerEval.isWin;
          setIsWinner(playerWon);
          setIsGameOverModalOpen(true);
          if (playerWon) {
            playVictoryFanfare();
          } else {
            playDefeat();
          }
          return nextSet;
        }

        // Switch Turn if Game Continues
        if (wasMyMove) {
          setIsMyTurn(false);

          if (gameMode === 'ai') {
            // Trigger AI Move with slight realistic delay
            setTimeout(() => {
              const aiChoice = getSmartAIMove(aiGrid, nextSet);
              if (aiChoice) {
                applyNumberCross(aiChoice, false);
                setIsMyTurn(true);
              }
            }, 800);
          } else {
            peerManager.send({ type: 'MARK_NUMBER', value: num });
          }
        } else {
          setIsMyTurn(true);
        }

        return nextSet;
      });
    },
    [grid, aiGrid, gameMode, opponentLettersCount]
  );

  const handleGameplayCellClick = (idx, num) => {
    if (!isMyTurn || gamePhase !== 'playing' || !num || crossedNumbers.has(num)) return;
    applyNumberCross(num, true);
  };

  // Rematch Reset
  const resetGameForRematch = () => {
    setCrossedNumbers(new Set());
    setLastCrossedNumber(null);
    setGamePhase('setup');
    setMyReady(false);
    setOpponentReady(false);
    setIsGameOverModalOpen(false);
    setPrevMyLinesCount(0);
    setOpponentLettersCount(0);
  };

  const handleRematchRequest = () => {
    resetGameForRematch();
    if (gameMode === 'p2p') {
      peerManager.send({ type: 'REMATCH_REQUEST' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-between p-3 sm:p-6 select-none">
      {/* Top Navigation & B-I-N-G-O Header */}
      <BingoHeader
        playerLetters={myEval.letters}
        opponentLettersCount={opponentLettersCount}
        isMyTurn={isMyTurn}
        gamePhase={gamePhase}
        gameMode={gameMode}
        opponentName={opponentName}
        isMuted={isMutedState}
        onToggleMute={handleToggleMute}
        onOpenRoomModal={() => setIsRoomModalOpen(true)}
      />

      {/* Main Center Area: 5x5 Bingo Grid */}
      <main className="w-full flex-1 flex flex-col items-center justify-center my-2">
        <BingoGrid
          grid={grid}
          crossedNumbers={crossedNumbers}
          completedLines={myEval.completedLines}
          gamePhase={gamePhase}
          isMyTurn={isMyTurn}
          selectedSetupIdx={selectedSetupIdx}
          onCellClick={gamePhase === 'setup' ? handleCellClickInSetup : handleGameplayCellClick}
          lastCrossedNumber={lastCrossedNumber}
        />

        {/* Setup Controls (Shown during setup phase) */}
        {gamePhase === 'setup' && (
          <SetupPalette
            grid={grid}
            selectedIdx={selectedSetupIdx}
            onRandomize={handleRandomizeGrid}
            onClear={handleClearGrid}
            onSelectNumberForCell={handleSelectNumberForCell}
            onReady={handleReadyToPlay}
            isReady={isValidGrid(grid)}
            isWaitingForPeer={myReady && !opponentReady && gameMode === 'p2p'}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="text-center text-[11px] text-slate-500 font-medium py-2">
        Serverless P2P WebRTC Bingo &bull; Created for GitHub Pages
      </footer>

      {/* Room Selection & Multiplayer Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSelectMode={(mode) => {
          setGameMode(mode);
          if (mode === 'ai') {
            peerManager.destroy();
            setRoomId(null);
            setConnectionStatus('disconnected');
          }
        }}
        roomId={roomId}
        connectionStatus={connectionStatus}
        onHostRoom={handleHostRoom}
        onJoinRoom={handleJoinRoom}
        initialRoomCode={initialRoomCode}
      />

      {/* Victory / Defeat Splash Modal */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        isWinner={isWinner}
        winnerName={isWinner ? 'You' : opponentName}
        myLinesCount={myEval.count}
        opponentLinesCount={opponentLettersCount}
        totalTurns={totalTurns}
        onRematch={handleRematchRequest}
        onMainMenu={() => {
          setIsGameOverModalOpen(false);
          setGamePhase('setup');
          setIsRoomModalOpen(true);
        }}
      />
    </div>
  );
}
