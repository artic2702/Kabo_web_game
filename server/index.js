/**
 * ══════════════════════════════════════════════════════════════
 *  KABO MULTIPLAYER SERVER
 *  server/index.js — Main entry point
 * ══════════════════════════════════════════════════════════════
 *
 *  This file sets up the Express HTTP server and Socket.IO
 *  WebSocket server that powers online multiplayer.
 *
 *  Architecture:
 *  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
 *  │ Socket.IO    │◄───►│ RoomManager  │◄───►│ GameHandler  │
 *  │ (transport)  │     │ (rooms/users)│     │ (game logic) │
 *  └─────────────┘     └──────────────┘     └──────────────┘
 *
 *  The GameHandler imports the SAME pure game logic used by the
 *  client (src/game/), ensuring rules are identical everywhere.
 *
 *  How to run:  npm run server
 *  Runs on:     http://localhost:3001
 * ══════════════════════════════════════════════════════════════
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomManager } from './roomManager.js';
import { initGameHandler } from './gameHandler.js';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;

/**
 * Socket.IO server configuration.
 * In dev: only allow Vite dev server ports.
 * In production: allow all origins (same server serves frontend).
 */
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;

const io = new Server(httpServer, {
  cors: isProduction
    ? { origin: true }
    : {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
                 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178',
                 'http://localhost:5179', 'http://localhost:5180'],
        methods: ['GET', 'POST'],
      },
});

// ── Initialize managers ─────────────────────────────────────
const roomManager = new RoomManager();
const gameHandler = initGameHandler(io, roomManager);

// Clean up stale rooms every 10 minutes
setInterval(() => roomManager.cleanup(), 10 * 60 * 1000);

// ── REST API ────────────────────────────────────────────────

/** Health check endpoint for monitoring. */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', rooms: roomManager.rooms.size });
});

// ── Socket.IO Connection Handler ────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Connect] ${socket.id}`);

  // ── Room: Create ──────────────────────────────────────────
  // Client sends { playerName } → receives { roomCode, playerId, players }
  socket.on('room:create', ({ playerName }, callback) => {
    const { room, playerId } = roomManager.createRoom(socket.id, playerName);
    socket.join(room.code);
    console.log(`[Room] ${playerName} created room ${room.code}`);

    callback({
      roomCode: room.code,
      playerId,
      players: serializePlayers(room.players),
    });
  });

  // ── Room: Join ────────────────────────────────────────────
  // Client sends { roomCode, playerName } → receives { success, playerId, players }
  socket.on('room:join', ({ roomCode, playerName }, callback) => {
    const result = roomManager.joinRoom(socket.id, roomCode, playerName);

    if (!result.success) {
      callback({ success: false, error: result.error });
      return;
    }

    socket.join(result.room.code);
    console.log(`[Room] ${playerName} joined room ${result.room.code}`);

    const playersInfo = serializePlayers(result.room.players);

    // Notify existing players that someone new joined
    socket.to(result.room.code).emit('room:player-joined', {
      players: playersInfo,
      newPlayer: { name: playerName, playerId: result.playerId },
    });

    callback({
      success: true,
      playerId: result.playerId,
      players: playersInfo,
      roomCode: result.room.code,
    });
  });

  // ── Room: Leave ───────────────────────────────────────────
  socket.on('room:leave', () => {
    handleLeave(socket);
  });

  // ── Room: Ready Toggle ────────────────────────────────────
  // Client sends { ready: boolean }
  socket.on('room:ready', ({ ready }) => {
    const room = roomManager.setReady(socket.id, ready);
    if (!room) return;

    io.to(room.code).emit('room:player-ready', {
      players: serializePlayers(room.players),
    });
  });

  // ── Room: Start Game (host only) ──────────────────────────
  socket.on('room:start', async (_, callback) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) { callback?.({ success: false, error: 'Room not found' }); return; }
    if (room.hostSocketId !== socket.id) { callback?.({ success: false, error: 'Only the host can start' }); return; }
    if (room.players.length < 2) { callback?.({ success: false, error: 'Need at least 2 players' }); return; }

    await gameHandler.startGame(room.code);
    console.log(`[Game] Started in room ${room.code} with ${room.players.length} players`);

    io.to(room.code).emit('game:started', { playerCount: room.players.length });
    callback?.({ success: true });
  });

  // ── Game: Action ──────────────────────────────────────────
  // Client sends an ACTION_TYPES action → server validates, processes, broadcasts
  socket.on('game:action', async (action, callback) => {
    const result = await gameHandler.processAction(socket.id, action);
    if (!result.success) {
      socket.emit('game:error', { message: result.error });
    }
    callback?.(result);
  });

  // ── Disconnect ────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`[Disconnect] ${socket.id}: ${reason}`);
    handleLeave(socket);
  });

  // ── Helper: handle player leaving ─────────────────────────
  function handleLeave(socket) {
    const { room, leftPlayer, destroyed } = roomManager.leaveRoom(socket.id);
    if (destroyed || !room) return;

    if (leftPlayer) {
      io.to(room.code).emit('room:player-left', {
        players: serializePlayers(room.players),
        leftPlayer: { name: leftPlayer.name, playerId: leftPlayer.playerId },
      });
    }
    socket.leave(room?.code);
  }
});

/** Strip socket IDs from player data before sending to clients. */
function serializePlayers(players) {
  return players.map(p => ({
    name: p.name,
    playerId: p.playerId,
    ready: p.ready,
    connected: p.connected,
  }));
}

// ── Serve frontend in production ────────────────────────────
// When deployed, the server serves the built React app from dist/
import fs from 'fs';
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('[Server] Serving static frontend from dist/');
}

// ── Start server ────────────────────────────────────────────
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🃏 Kabo server running on http://localhost:${PORT}`);
});
