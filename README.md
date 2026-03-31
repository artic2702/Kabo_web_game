# Kabo – Online Multiplayer Card Game

Kabo is a turn-based card game for 2 to 5 players where the goal is to end the game with the **lowest total hand value**.
The game focuses on memory, bluffing, and smart use of power-ups.

This project is being built as a **web-based multiplayer game** using:

- Frontend: React + Vite + CSS
- Backend (planned): Node.js + Express
- Multiplayer (planned): WebSockets / Socket.IO

Right now, the focus is on building the full game UI and logic first, then adding multiplayer later.

---

## Game Rules

### Setup

- 2 to 5 players.
- Each player gets **4 cards** from the deck.
- At the start, a player may see **only 2 of their 4 cards**.
- After that, cards cannot be looked at again unless a power-up allows it.
- One card is placed face-up in the middle (discard pile).

### Turn Actions

On your turn, you can do one of the following:

1. Pick from the **middle (discard pile)**
   - You must exchange it with one card from your hand.
   - You cannot pick and throw the same card back.

2. Pick from the **deck**
   - You can:
     - Exchange it with one of your hand cards, or
     - Throw it directly into the middle.

### Card Values

- Normal cards have their number value.
- **King = 0 (special low card).**

### Power-Ups (Only if drawn from deck and thrown to middle)

- **Queen** → Power-up
  - You may exchange any two cards:
    - Both from yourself, or
    - Between any two players.

- **9** → Power-up
  - You may look at any one of your hidden cards.

### Stack Rule

- If a player throws a card with value X (for example 3),
  - Any player who has the same value card may immediately drop it.
  - Their hand size becomes smaller.

### Calling Kabo (Ending the Game)

- On your turn, you may say **“Kabo”** if you think your hand value is the lowest.
- You still finish your turn normally.
- Every other player gets **one final turn**.
- After the last player finishes:
  - All cards are revealed.
  - The player with the **lowest total hand value wins**.

---

## Project Goals

- Build full card game UI in React.
- Implement all game rules locally (single-device play).
- Add animations and clean layout.
- Later:
  - Add backend with Node.js + Express.
  - Add real-time multiplayer using WebSockets / Socket.IO.
  - Support game rooms and online play.

---

## Current Progress (Phase 1: UI/UX Development)

### ✅ Completed Features

#### Core Game Logic

- **Card Dealing System** - Shuffle deck and distribute 4 cards to each player
- **Card Value Calculation** - Kings have special values (red=0, black=13), numbered cards are face value, face cards (J, Q, K) have values 11, 12, 13
- **Game State Management** - Track game phases, player turns, drawn cards, discard pile
- **Turn System** - Sequential turn rotation between players
- **Kabo Call Mechanics** - When called, triggers final round where every other player gets one last turn

#### Phase 1: UI/UX Implementation

- **Circular Table Layout**
  - Players positioned in a circle around the game table using CSS transforms and trigonometry
  - Auto-positioning: angle = (playerIndex / totalPlayers) \* 360 degrees
  - Works for 2-5 players with proper spacing (180° apart for 2 players, 120° for 3, etc.)

- **Game Board Components**
  - Main GameBoard orchestrator component managing all game state and logic flow
  - Circular table with green felt background
  - Center display showing deck and discard pile

- **Card Display System**
  - Card component with face-up/face-down states
  - Uses actual PNG card images from `/public/cards/` directory
  - Card images format: `{suit}_{rank}.png` (e.g., `heart_5.png`, `spade_king.png`, `club_back.png`)
  - Support for all 52 cards + card back image

- **Player Positioning**
  - PlayerPosition component places each player around the circular table
  - Shows player name, 4 cards, and hand value (revealed at game end)
  - Card visibility tracked per player with `visible: [boolean, boolean, boolean, boolean]` array
  - Current turn player highlighted with visual indicator

- **Peek Phase UI**
  - Modal overlay during setup phase where each player peeks at exactly 2 cards
  - Horizontal card layout for easy selection
  - Auto-advances to next player when 2 cards selected
  - Cards remain face-down after peek phase, only player remembers them
  - All 4 players go through peek phase before game starts

- **Game Phases**
  - "setup" - Peek phase where players memorize 2 cards
  - "playing" - Main game loop with turns and actions
  - "ended" - Game over, all cards revealed, winner determined

#### Game Flow

1. Player count selection screen (2-5 players)
2. Deck shuffled and 4 cards dealt to each player (all face-down)
3. Each player takes turn peeking at exactly 2 of their cards (memorization)
4. Game starts with all cards face-down
5. Players take turns drawing from deck or discard pile
6. Players can exchange drawn card with hand card or throw it away
7. Other players can stack matching rank cards instantly
8. Players can use power-ups (Queen for swaps, 9 for peeking at own card)
9. Player calls "KABO" when confident they have lowest hand
10. Other players get final turns
11. All cards revealed, lowest hand value wins

### 🚧 In Progress / Not Yet Implemented

- **Drag-and-Drop Exchange** (partially ready)
  - Ability to drag drawn card and drop on own hand cards to exchange
  - Ability to drag own cards and drop on drawn card
  - Visual feedback during drag operations

- **Stack Rule UI**
  - When a card is thrown, show option for other players to instantly drop matching rank card
  - Rapid-fire card drops during stack phase

- **Power-Up Effects**
  - Queen power: Select any 2 cards to swap (from own hand or between players)
  - 9 power: Peek at any one of your hidden cards
  - Visual indicators when power-ups are available

- **Card Selection & Exchange**
  - Click deck/discard to draw
  - Click own card to exchange with drawn card
  - Full exchange workflow integration

- **Game End & Winner Display**
  - Calculate all hand values when game ends
  - Show all cards revealed
  - Display winner with final scores

### 📦 File Structure

```
src/
├── game/
│   ├── rules.js          # Game initialization, player setup, game state structure
│   └── actions.js        # Peek phase, draw, exchange, turn management, Kabo logic
├── components/
│   ├── GameBoard.jsx     # Main orchestrator, game flow control
│   ├── PlayerPosition.jsx# Circular player positioning
│   ├── Card.jsx          # Individual card display with images
│   ├── TableCenter.jsx   # Deck and discard pile display
│   ├── PeekPhaseUI.jsx   # Peek phase modal (auto-advances when 2 cards selected)
│   └── GameControls.jsx  # Turn action buttons (to be replaced with drag-drop)
├── styles/
│   └── gameboard.css     # All styling for circular table, cards, animations
├── App.jsx               # React app entry point
└── main.jsx              # Vite entry point

public/
└── cards/                # PNG card images
    ├── heart_1.png to heart_10.png, heart_jack.png, heart_queen.png, heart_king.png
    ├── diamond_*.png
    ├── spade_*.png
    ├── club_*.png
    └── back.png          # Card back face image
```

### 🎮 How To Play (Current State)

1. **Start Game**: Enter player count (2-5) on startup screen
2. **Peek Phase**: Each player sees 2 cards and must memorize them
3. **Playing Phase**: (In Development)
   - Draw from deck or discard pile
   - Select card from hand to exchange
   - Other players can stack matching cards
   - Call KABO when ready to end
4. **Endgame**: All cards revealed, lowest value wins

---

## Future Plans

### Phase 2: Multiplayer Backend (Planned)

- WebSocket communication using Socket.IO
- Node.js + Express backend server
- Game room management
- Real-time turn notifications
- Player disconnect handling
- Game persistence

### Phase 3: Online Features (Planned)

- User authentication
- Game lobbies and matchmaking
- Chat system
- Player statistics and ranking
- Replay/history
- Mobile responsiveness

---

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express (planned)
- **Real-time**: Socket.IO (planned)
- **Database**: MongoDB/PostgreSQL (planned)
- **Assets**: PNG card images

---

## Development Notes

- All 52 cards are represented as image files in `/public/cards/`
- Game logic separated into `rules.js` (initialization) and `actions.js` (game actions)
- React state management using useState and useRef for persistent game state
- Circular positioning uses CSS transforms with trigonometric calculations
- Card visibility managed separately from card values to maintain memory gameplay mechanics
