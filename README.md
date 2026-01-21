# Kabo – Online Multiplayer Card Game

Kabo is a turn-based card game for 2 to 5 players where the goal is to end the game with the **lowest total hand value**.
The game focuses on memory, bluffing, and smart use of power-ups.

This project is being built as a **web-based multiplayer game** using:

* Frontend: React + Vite + CSS
* Backend (planned): Node.js + Express
* Multiplayer (planned): WebSockets / Socket.IO

Right now, the focus is on building the full game UI and logic first, then adding multiplayer later.

---

## Game Rules

### Setup

* 2 to 5 players.
* Each player gets **4 cards** from the deck.
* At the start, a player may see **only 2 of their 4 cards**.
* After that, cards cannot be looked at again unless a power-up allows it.
* One card is placed face-up in the middle (discard pile).

### Turn Actions

On your turn, you can do one of the following:

1. Pick from the **middle (discard pile)**

   * You must exchange it with one card from your hand.
   * You cannot pick and throw the same card back.

2. Pick from the **deck**

   * You can:

     * Exchange it with one of your hand cards, or
     * Throw it directly into the middle.

### Card Values

* Normal cards have their number value.
* **King = 0 (special low card).**

### Power-Ups (Only if drawn from deck and thrown to middle)

* **Queen** → Power-up

  * You may exchange any two cards:

    * Both from yourself, or
    * Between any two players.

* **9** → Power-up

  * You may look at any one of your hidden cards.

### Stack Rule

* If a player throws a card with value X (for example 3),

  * Any player who has the same value card may immediately drop it.
  * Their hand size becomes smaller.

### Calling Kabo (Ending the Game)

* On your turn, you may say **“Kabo”** if you think your hand value is the lowest.
* You still finish your turn normally.
* Every other player gets **one final turn**.
* After the last player finishes:

  * All cards are revealed.
  * The player with the **lowest total hand value wins**.

---

## Project Goals

* Build full card game UI in React.
* Implement all game rules locally (single-device play).
* Add animations and clean layout.
* Later:

  * Add backend with Node.js + Express.
  * Add real-time multiplayer using WebSockets / Socket.IO.
  * Support game rooms and online play.

---

## Current Progress

* React + Vite setup complete.
* Card component created (front/back, clickable).
* Using PNG card images for visuals.
* Basic UI testing in progress.

---

## Future Plans

* Player layout (top, bottom, left, right).
* Deck and discard pile UI.
* Turn system.
* Power-up system.
* Kabo endgame logic.
* Multiplayer support.

---

This project is a learning + passion project to understand:

* Game logic
* React UI design
* Real-time multiplayer systems
* Full-stack web development
