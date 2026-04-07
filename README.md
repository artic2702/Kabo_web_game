# 🃏 KABO — Multiplayer Card Game

A fully functional, real-time multiplayer card game built with **React**, **Node.js**, and **Socket.IO**.

Play locally on the same device, or online with friends using room codes!

---

## 📋 Table of Contents

- [How to Play Kabo](#-how-to-play-kabo)
- [Quick Start](#-quick-start)
- [How to Play with Friends Online](#-how-to-play-with-friends-online)
- [How WebSockets Work (Explained Simply)](#-how-websockets-work-explained-simply)
- [Project Architecture](#-project-architecture)
- [Folder Structure](#-folder-structure)
- [Technologies Used](#-technologies-used)

---

## 🎮 How to Play Kabo

Kabo is a memory card game where the goal is to have the **lowest total hand value**.

### Setup

- Each player gets **4 face-down cards**
- At the start, you peek at **2 of your 4 cards** — memorize them!
- The remaining 2 cards are unknown to you

### Card Values

| Card      | Value      |
| --------- | ---------- |
| King (K)  | 0          |
| Ace (A)   | 1          |
| 2–10      | Face value |
| Jack (J)  | 11         |
| Queen (Q) | 12         |

### On Your Turn

1. **Draw** from the deck (face-down) or the discard pile (face-up)
2. **Decide**: Either swap it with one of your hand cards, or throw it away
   - If you draw from discard, you **must** swap (no throwing back)
3. **Power-ups** trigger when you throw certain cards:
   - **Queen (Q)** → Swap any 2 cards between different players
   - **9** → Peek at one of your own face-down cards
4. **Stack rule**: After a card is discarded, other players (NOT the one who discarded) have **8 seconds** to drop a matching-rank card from their hand. Only the first player to react gets to stack!
   - Correct stack → card is removed from your hand (fewer cards = lower score!)
   - Wrong stack → penalty card drawn from the deck

### Calling KABO

- At the **start of your turn**, you can call "KABO!" if you think you have the lowest hand
- You still play your turn normally
- Everyone else gets **one more turn** (final round)
- Then all cards are revealed:
  - ✅ If Kabo caller has the lowest score → they win!
  - ❌ If someone else tied or beat them → Kabo caller gets **+10 penalty**

### Winning

The player with the **lowest total hand value** wins!

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ installed

### Install & Run

```bash
# 1. Clone the project
cd kabo

# 2. Install dependencies
npm install

# 3. Start the game server (for multiplayer)
npm run server

# 4. In a NEW terminal, start the frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

- **Local Play**: Click "Start Local Game" — players take turns on the same screen
- **Online Play**: Click "Play Online" → Create Room → Share the code!

---

## 🌐 How to Play with Friends Online

### Step-by-Step Guide

#### Player 1 (Host):

1. Run `npm run server` and `npm run dev` on your computer
2. Open the game in your browser
3. Click **"Play Online"**
4. Enter your name and click **"Create Room"**
5. You'll get a **4-letter room code** (e.g., `MWPK`)
6. Share this code with your friends!
7. Click **"Ready"** when everyone has joined
8. Click **"Start Game"** to begin

#### Player 2+ (Friends):

1. Open the game URL in their browser
2. Click **"Play Online"**
3. Enter their name and click **"Join Room"**
4. Type the **room code** the host shared
5. Click **"Ready"**
6. Wait for the host to start the game!

### Playing on the Same Network (LAN)

If your friends are on the same WiFi network:

1. Find your computer's local IP address:
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address": something like 192.168.1.5
   ```
2. Your friends open `http://192.168.1.5:5173` in their browser
3. Make sure the server is running on your machine (`npm run server`)

### Playing Over the Internet

To play with friends NOT on your network, you need to either:

- **Deploy** the server to a cloud service (Render, Railway, Heroku)
- Use a **tunneling tool** like [ngrok](https://ngrok.com/):
  ```bash
  # Expose your local server to the internet
  ngrok http 3001
  ```
  Then share the ngrok URL with friends. Update the `VITE_SERVER_URL` env variable to match.

## 🏗️ Project Architecture

The project is split into **4 clear responsibility areas**:

### 1. Game Logic (`src/game/`) — The Rules Engine

Pure JavaScript, zero dependencies. Contains all game rules as **pure functions** — given a state and an action, it returns a new state. No React, no DOM, no side effects.

This is the brain of the game. The same code runs on both the client (local mode) and the server (multiplayer mode).

### 2. UI Components (`src/components/`) — What You See

React components that render the game. They never contain game rules — they just display state and collect user input.

### 3. Hooks (`src/hooks/`) — The Bridge

React hooks that connect the components to the game logic:

- **Local mode**: `useGameState` runs the game reducer directly in the browser
- **Online mode**: `useMultiplayerState` sends actions to the server via WebSocket and receives state updates

### 4. Server (`server/`) — The Multiplayer Brain

Node.js + Express + Socket.IO server that:

- Manages rooms (create/join/leave)
- Runs the same game reducer for multiplayer games
- Filters state per player (anti-cheat)
- Broadcasts updates in real-time

```
┌─────────────────────────────────────────────────────┐
│                    SHARED LOGIC                      │
│                  src/game/*.js                        │
│   (pure functions — runs on client AND server)       │
└────────┬─────────────────────────────────┬──────────┘
         │                                 │
    ┌────▼────┐                      ┌─────▼─────┐
    │ CLIENT  │                      │  SERVER   │
    │ React   │◄═══ WebSocket ═══►   │  Node.js  │
    │ Hooks   │                      │  Rooms    │
    │ UI      │                      │  Filter   │
    └─────────┘                      └───────────┘
```

---

## 📁 Folder Structure

```
kabo/
│
├── server/                          # Backend (multiplayer)
│   ├── index.js                     # Express + Socket.IO server entry
│   ├── roomManager.js               # Room create/join/leave logic
│   ├── gameHandler.js               # Processes game actions via shared reducer
│   └── stateFilter.js               # Hides opponents' cards before sending
│
├── src/
│   ├── game/                        # Pure game logic (shared client + server)
│   │   ├── constants.js             # All game enums and config
│   │   ├── types.js                 # JSDoc type definitions
│   │   ├── deck.js                  # Card deck creation + shuffling
│   │   ├── rules.js                 # Game initialization (createInitialState)
│   │   ├── actions.js               # Core game reducer (gameReducer)
│   │   ├── validators.js            # Action validation logic
│   │   ├── scoring.js               # End-game scoring with Kabo bonus/penalty
│   │   └── index.js                 # Barrel export for clean imports
│   │
│   ├── hooks/                       # React state management
│   │   ├── useGameState.js          # Local game state (runs reducer in browser)
│   │   ├── useMultiplayerState.js   # Online state (Socket.IO ↔ server)
│   │   ├── useGameEvents.js         # Event consumer for animations
│   │   └── useAnimationQueue.js     # Sequential animation queue
│   │
│   ├── components/                  # React UI components
│   │   ├── Card.jsx                 # Individual card (face-up/down, animations)
│   │   ├── PlayerHand.jsx           # Row of cards for a player
│   │   ├── PlayerPosition.jsx       # Circular table positioning for a player
│   │   ├── TableCenter.jsx          # Deck pile + discard pile + drawn card
│   │   ├── GameBoard.jsx            # Local play game board (orchestrator)
│   │   ├── MultiplayerGameBoard.jsx # Online play game board (orchestrator)
│   │   ├── StartScreen.jsx          # Main menu (local vs online)
│   │   ├── LobbyScreen.jsx          # Room create/join/ready interface
│   │   ├── PeekPhaseUI.jsx          # Setup phase — peek at your cards
│   │   ├── PowerUpUI.jsx            # Queen swap / Nine peek overlay
│   │   ├── StackPhaseUI.jsx         # Stack rule with countdown timer
│   │   ├── GameEndScreen.jsx        # Final scores & winner
│   │   └── GameStatus.jsx           # Top bar (turn, phase, connection)
│   │
│   ├── styles/                      # CSS design system
│   │   ├── variables.css            # Design tokens (colors, fonts, spacing)
│   │   ├── gameboard.css            # Table and player layout
│   │   ├── cards.css                # Card visuals and animations
│   │   ├── startscreen.css          # Start screen design
│   │   ├── lobby.css                # Lobby screen design
│   │   └── overlays.css             # Modals, peek, power-ups, game end
│   │
│   ├── App.jsx                      # Root — routes between menu/local/online
│   ├── main.jsx                     # React DOM entry point
│   └── style.css                    # Tailwind import
│
├── public/cards/                    # Card images (PNG)
├── package.json
├── vite.config.js                   # Dev proxy for Socket.IO
└── README.md                        # This file!
```

---

## 🛠️ Technologies Used

| Technology          | Purpose                              |
| ------------------- | ------------------------------------ |
| **React 19**        | Frontend UI framework                |
| **Vite 7**          | Fast dev server and bundler          |
| **Node.js**         | Backend runtime                      |
| **Express**         | HTTP server for API + static files   |
| **Socket.IO**       | Real-time WebSocket communication    |
| **Tailwind CSS v4** | Utility CSS framework                |
| **Vanilla CSS**     | Custom design system (variables.css) |

---

## 📝 NPM Scripts

| Command           | What it does                      |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start Vite dev server (frontend)  |
| `npm run server`  | Start the multiplayer game server |
| `npm run build`   | Build production bundle           |
| `npm run preview` | Preview production build          |

**To play locally**: Just run `npm run dev`
**To play online**: Run BOTH `npm run server` AND `npm run dev`

---

## 🤝 Contributing

The codebase is designed for readability:

- **`src/game/`** — Pure logic, no framework dependencies. Great starting point to understand the rules.
- **`server/`** — Multiplayer backend. Each file has doc comments explaining its role.
- **`src/components/`** — React components. Each is focused on one piece of the UI.

Every file has header comments explaining what it does and how it connects to other parts of the system.
