# Cubegame

A simple yet addictive math puzzle game where you combine numbers on a 3D cube to reach higher values.

## How to Play

1. Use arrow keys (↑, ↓, ←, →) or swipe gestures to interact with the cube
2. When two adjacent sides have the same number:
   - The chosen side's value increases by 1
   - The front side gets a new random value
3. When numbers are different, the cube rotates instead
4. Goal: Try to get 10 on one side!

## Game Features

- 3D cube visualization with smooth rotations
- Touch support for mobile devices
- Progressive difficulty
- Score tracking
- Tutorial for new players
- Achievements for reaching 5, 10, 15, and 20

## Technical Details

Built using:
- TypeScript
- CSS 3D Transforms
- WebKit CSS Matrix for 3D manipulations
- No external dependencies except seedrandom.js

Project Structure:
```
cubegame/
├── src/
│ ├── classes/
│ │ └── Cube.ts # Main cube logic
│ ├── handlers/
│ │ ├── events.ts # Event handling
│ │ └── touch.ts # Touch gestures
│ ├── types/
│ │ ├── global.d.ts # Global type definitions
│ │ └── interfaces.ts # TypeScript interfaces
│ ├── utils/
│ │ ├── colors.ts # Color generation
│ │ ├── helpers.ts # Utility functions
│ │ └── ui.ts # UI management
│ ├── game.ts # Game initialization
│ ├── store.ts # Game state management
│ └── tutorial.ts # Tutorial system
├── style.css # Game styles
├── index.html # Main HTML
├── main.ts # Entry point
└── seedrandom.min.js # Random number generation
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cubegame.git
```

2. Install dependencies:
```bash
cd cubegame
npm install
```

3. Run development server:
```bash
npm run dev
```

## Building for Production
```bash
npm run build
```
The built files will be in the `dist` directory.

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License

## Credits

Originally created by [titulus](https://github.com/titulus/cubegame)