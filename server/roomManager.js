/**
 * ══════════════════════════════════════════════════════════════
 *  ROOM MANAGER
 *  server/roomManager.js
 * ══════════════════════════════════════════════════════════════
 *
 *  Manages game rooms for multiplayer. Each room:
 *  - Has a unique 4-letter code (e.g. "ABCD")
 *  - Tracks connected players (socket ID ↔ player mapping)
 *  - Has a lifecycle: waiting → playing → ended
 *
 *  Connected to:
 *  - server/index.js — creates/destroys rooms on socket events
 *  - server/gameHandler.js — reads room data to access game state
 *
 *  Key data structures:
 *    rooms: Map<roomCode, Room>
 *    socketToRoom: Map<socketId, roomCode>
 * ══════════════════════════════════════════════════════════════
 */

/**
 * Generate a random 4-letter room code.
 * Excludes I and O to avoid confusion with 1 and 0.
 * @returns {string}
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export class RoomManager {
  constructor() {
    /** @type {Map<string, Object>} roomCode → room object */
    this.rooms = new Map();
    /** @type {Map<string, string>} socketId → roomCode (reverse lookup) */
    this.socketToRoom = new Map();
  }

  /**
   * Create a new room with the given player as host.
   *
   * @param {string} socketId - Host's socket connection ID
   * @param {string} playerName - Display name for the host
   * @returns {{ room: Object, playerId: number }}
   */
  createRoom(socketId, playerName) {
    let code;
    do { code = generateRoomCode(); } while (this.rooms.has(code));

    const room = {
      code,
      hostSocketId: socketId,
      players: [{
        socketId,
        name: playerName || 'Player 1',
        ready: false,
        playerId: 0,         // Index in the game logic's players array
        connected: true,
      }],
      gameState: null,        // Set by gameHandler when game starts
      status: 'waiting',      // 'waiting' | 'playing' | 'ended'
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.socketToRoom.set(socketId, code);

    return { room, playerId: 0 };
  }

  /**
   * Add a player to an existing room.
   *
   * @param {string} socketId
   * @param {string} roomCode - 4-letter room code
   * @param {string} playerName
   * @returns {{ success: boolean, room?: Object, playerId?: number, error?: string }}
   */
  joinRoom(socketId, roomCode, playerName) {
    const code = roomCode.toUpperCase();
    const room = this.rooms.get(code);

    if (!room) return { success: false, error: 'Room not found' };
    if (room.status !== 'waiting') return { success: false, error: 'Game already in progress' };
    if (room.players.length >= 5) return { success: false, error: 'Room is full (max 5 players)' };

    // Prevent duplicate joins
    const existing = room.players.find(p => p.socketId === socketId);
    if (existing) return { success: true, room, playerId: existing.playerId };

    const playerId = room.players.length;
    room.players.push({
      socketId,
      name: playerName || `Player ${playerId + 1}`,
      ready: false,
      playerId,
      connected: true,
    });

    this.socketToRoom.set(socketId, code);
    return { success: true, room, playerId };
  }

  /**
   * Remove a player from their room.
   * During lobby: removes completely. During game: marks as disconnected.
   * If the host leaves in lobby, transfers host to next player.
   * If room is empty, destroys it.
   *
   * @param {string} socketId
   * @returns {{ room: Object|null, leftPlayer: Object|null, destroyed: boolean }}
   */
  leaveRoom(socketId) {
    const code = this.socketToRoom.get(socketId);
    if (!code) return { room: null, leftPlayer: null, destroyed: false };

    const room = this.rooms.get(code);
    if (!room) {
      this.socketToRoom.delete(socketId);
      return { room: null, leftPlayer: null, destroyed: false };
    }

    const playerIndex = room.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) {
      this.socketToRoom.delete(socketId);
      return { room, leftPlayer: null, destroyed: false };
    }

    const leftPlayer = room.players[playerIndex];

    // During game: keep player slot but mark disconnected (can reconnect)
    if (room.status === 'playing') {
      leftPlayer.connected = false;
      this.socketToRoom.delete(socketId);
      return { room, leftPlayer, destroyed: false };
    }

    // In lobby: fully remove the player
    room.players.splice(playerIndex, 1);
    this.socketToRoom.delete(socketId);

    // Reassign sequential player IDs
    room.players.forEach((p, i) => { p.playerId = i; });

    // Destroy empty rooms
    if (room.players.length === 0) {
      this.rooms.delete(code);
      return { room: null, leftPlayer, destroyed: true };
    }

    // Transfer host if the host left
    if (room.hostSocketId === socketId) {
      room.hostSocketId = room.players[0].socketId;
    }

    return { room, leftPlayer, destroyed: false };
  }

  /**
   * Toggle a player's ready status in the lobby.
   */
  setReady(socketId, ready) {
    const code = this.socketToRoom.get(socketId);
    if (!code) return null;
    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (player) player.ready = ready;
    return room;
  }

  // ── Lookup helpers ────────────────────────────────────────

  getRoom(code) { return this.rooms.get(code?.toUpperCase()) || null; }
  getRoomBySocket(socketId) {
    const code = this.socketToRoom.get(socketId);
    return code ? this.rooms.get(code) : null;
  }
  getPlayer(socketId) {
    const room = this.getRoomBySocket(socketId);
    return room?.players.find(p => p.socketId === socketId) || null;
  }

  /**
   * Clean up rooms older than 1 hour to prevent memory leaks.
   * Called on a timer from server/index.js.
   */
  cleanup() {
    const maxAge = 60 * 60 * 1000;
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      if (now - room.createdAt > maxAge) {
        for (const p of room.players) this.socketToRoom.delete(p.socketId);
        this.rooms.delete(code);
      }
    }
  }
}
