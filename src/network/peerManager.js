import { Peer } from 'peerjs';

/**
 * PeerManager handles serverless WebRTC connections via PeerJS
 */
class PeerManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.role = null; // 'host' | 'guest' | null
    this.roomId = null;
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, callbacks);
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(payload));
    }
  }

  /**
   * Helper to generate a short readable 6-character room code (e.g. "BINGO-4921")
   */
  generateRoomCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BINGO-${code}`;
  }

  /**
   * Initialize Host Room
   */
  createRoom(customCode = null) {
    this.destroy();
    const code = customCode || this.generateRoomCode();
    this.role = 'host';
    this.roomId = code;

    try {
      this.peer = new Peer(code, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.emit('room_created', { roomId: id });
      });

      this.peer.on('connection', (connection) => {
        this.conn = connection;
        this.setupConnectionListeners();
        this.emit('peer_connected', { role: 'guest' });
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS Host Error:', err);
        // If room ID is taken, fallback to random code
        if (err.type === 'unavailable-id') {
          this.createRoom();
        } else {
          this.emit('error', err);
        }
      });
    } catch (err) {
      this.emit('error', err);
    }

    return code;
  }

  /**
   * Join an existing Host Room
   */
  joinRoom(hostRoomId) {
    this.destroy();
    const cleanId = hostRoomId.trim().toUpperCase();
    this.role = 'guest';
    this.roomId = cleanId;

    try {
      this.peer = new Peer({
        debug: 1,
      });

      this.peer.on('open', () => {
        this.conn = this.peer.connect(cleanId, {
          reliable: true,
        });

        this.setupConnectionListeners();
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS Guest Error:', err);
        this.emit('error', err);
      });
    } catch (err) {
      this.emit('error', err);
    }
  }

  setupConnectionListeners() {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.emit('connected', { role: this.role, roomId: this.roomId });
    });

    this.conn.on('data', (data) => {
      if (data && data.type) {
        this.emit('message', data);
      }
    });

    this.conn.on('close', () => {
      this.emit('peer_disconnected');
    });

    this.conn.on('error', (err) => {
      this.emit('error', err);
    });
  }

  /**
   * Send JSON message payload over WebRTC data channel
   */
  send(payload) {
    if (this.conn && this.conn.open) {
      this.conn.send(payload);
    } else {
      console.warn('Cannot send payload - connection is not open');
    }
  }

  /**
   * Clean up Peer instance & connections
   */
  destroy() {
    if (this.conn) {
      try {
        this.conn.close();
      } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
      this.peer = null;
    }
    this.role = null;
    this.roomId = null;
  }
}

export const peerManager = new PeerManager();
