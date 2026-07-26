# Indian 5x5 Bingo 🎯

A serverless, peer-to-peer (P2P), mobile-first web app of the traditional Indian 5x5 paper-and-pen Bingo game. Play against a smart AI or challenge your friends online in real-time!

## Features

- **P2P Multiplayer:** Play against friends in real-time using WebRTC (PeerJS). No backend servers required!
- **Smart AI:** Play instantly against a built-in computer opponent that actively tries to win.
- **Premium UI:** A beautifully crafted, modern interface with Light and Dark mode support.
- **Responsive:** Designed primarily for mobile screens, but works perfectly on tablets and desktops.
- **Lifetime Stats:** Your wins, losses, and ties are tracked and saved locally in your browser.
- **Perfect Tie Handling:** Accurate game-over logic that supports and detects simultaneous Bingo ties across the network.

## How to Play

1. **Setup:** Fill your 5x5 grid with unique numbers from 1 to 25. You can place them manually or use the "Random" button.
2. **Connect (Multiplayer):** Click "Play Online" at the top to Host a room and share the 5-digit code, or Join a friend's room.
3. **Gameplay:** Players take turns selecting uncrossed numbers. When a number is clicked, it gets crossed out for **both** players.
4. **Scoring:** Complete a full horizontal row, vertical column, or diagonal line to earn a letter in "B-I-N-G-O".
5. **Winning:** The first player to complete 5 lines wins the game!

## Tech Stack

- **Core:** HTML5, CSS3, JavaScript (React via Babel Standalone)
- **Styling:** Tailwind CSS (via CDN)
- **Networking:** PeerJS (WebRTC)
- **Icons:** Lucide Icons (Inline SVGs)
- **Animations:** Canvas Confetti & CSS Keyframes

## Hosting

This project is completely static and serverless. It can be hosted on GitHub Pages, Vercel, Netlify, or simply opened locally in any modern web browser.

## Running Locally

1. Clone the repository.
2. Open `index.html` in your web browser.
3. Done!

## License

MIT License. Feel free to fork and build upon this!
