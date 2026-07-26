import { Peer } from 'peerjs';

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

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

  generateRoomCode() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `bingo-${randomNum}`;
  }

  createRoom(customCode = null) {
    this.destroy();
    const code = (customCode || this.generateRoomCode()).toLowerCase();
    this.role = 'host';
    this.roomId = code;

    try {
      this.peer = new Peer(code, PEER_CONFIG);

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

  joinRoom(hostRoomId) {
    this.destroy();
    const cleanId = hostRoomId.trim().toLowerCase();
    this.role = 'guest';
    this.roomId = cleanId;

    try {
      this.peer = new Peer(undefined, PEER_CONFIG);

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

    let hasOpened = false;

    const handleOpen = () => {
      if (hasOpened) return;
      hasOpened = true;
      this.emit('connected', { role: this.role, roomId: this.roomId });
    };

    if (this.conn.open) {
      handleOpen();
    } else {
      this.conn.on('open', handleOpen);
    }

    this.conn.on('data', (data) => {
      if (data && data.type) {
        this.emit('message', data);
      }
    });

    this.conn.on('close', () => {
      if (hasOpened) {
        this.emit('peer_disconnected');
      }
    });

    this.conn.on('error', (err) => {
      this.emit('error', err);
    });
  }

  send(payload) {
    if (this.conn && this.conn.open) {
      this.conn.send(payload);
    } else {
      console.warn('Cannot send payload - connection is not open');
    }
  }

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
