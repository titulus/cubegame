# Cubegame

A simple yet addictive math puzzle game where you combine numbers on a 3D cube to reach higher values.

## How to Play

1. Use arrow keys (↑, ↓, ←, →) or swipe gestures to interact with the cube
2. When two adjacent sides have the same number:
   - The chosen side's value increases by 1
   - The front side gets a new random value
3. When numbers are different, the cube rotates instead
4. Use the [+1] button to increase the front side value by 1
5. Compete for the top spot on the monthly leaderboard at the end of the game

## Game Features

- 3D cube visualization with smooth rotations
- Touch support for mobile devices
- Progressive difficulty
- Score tracking
- Tutorial for new players
- Responsive design that works well on mobile devices

## Technical Stack

### Frontend
- Vite for build tooling and development server
- TypeScript for type-safe code
- CSS for styling and animations
- Web Audio API for sound effects

### Backend
- FastAPI for serving the game and handling bot interactions
- Uvicorn as ASGI server

## Development Setup

1. Install dependencies:
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

2. Create `.env` file in the root directory with:
```
BOT_TOKEN=your_telegram_bot_token
WEBAPP_URL=your_webapp_url
IS_PRODUCTION=false
DATABASE_URL=your_database_url
```

3. Build the frontend:
```bash
npm run build
```

4. Start the development server:
```bash
python -m uvicorn api.index:app --reload
```

## Production Deployment

### Prerequisites
- A Telegram bot token (get it from @BotFather)
- A Vercel account for hosting

### Deployment Steps

1. Install Vercel CLI (optional):
```bash
npm i -g vercel
```

2. Deploy to Vercel:
   - Using CLI: Run `vercel` in the project directory
   - Or using Vercel Dashboard:
     1. Import your GitHub repository
     2. Select Python framework
     3. Set environment variables:
        - `BOT_TOKEN`: Your Telegram bot token
        - `WEBAPP_URL`: Your Vercel app URL
        - `IS_PRODUCTION`: true
        - `DATABASE_URL`: Your database URL

3. After deployment, set up your Telegram Mini App:
   1. Go to @BotFather
   2. Use /setmenubutton
   3. Select your bot
   4. Enter your Vercel app URL

## Project Structure

```
cubegame/
├── src/                # Frontend TypeScript source
│   ├── classes/       # Game classes and core logic
│   │   └── Cube.ts   # Main cube logic and game mechanics
│   ├── handlers/      # Event handlers
│   │   ├── events.ts # Keyboard and general events
│   │   └── touch.ts  # Touch gesture handling
│   ├── types/        # TypeScript type definitions
│   │   └── interfaces.ts # Type interfaces
│   └── utils/        # Utility functions
│       ├── colors.ts # Color generation
│       ├── helpers.ts # Common helper functions
│       └── ui.ts     # UI management
├── public/           # Static assets
│   ├── img/         # Images and icons
│   │   ├── cubes.png     # Background pattern
│   │   ├── arrow_r.gif   # Tutorial arrows
│   │   └── arrow_u.gif   # Tutorial arrows
│   └── sounds/      # Game sound effects
│       ├── rotate.mp3    # Cube rotation sound
│       ├── win.mp3       # Success sound
│       ├── fail.mp3      # Failure sound
│       └── increase.mp3  # Number increase sound
├── dist/            # Built frontend files (generated)
│   ├── assets/     # Compiled and hashed assets
│   ├── img/        # Copied and optimized images
│   └── sounds/     # Copied sound files
├── api/index.py          # Main FastAPI application
│   ├── startup()   # Server startup configuration
│   ├── shutdown()  # Cleanup handlers
│   ├── polling()   # Development mode bot updates
│   └── webhook()   # Production mode bot updates
│   ├── /telegram-webhook/{bot_token} # Handles incoming Telegram updates
│   ├── /save-score # Saves the game score
│   ├── / # Serves the main index.html file
│   ├── /main-{hash}.{ext} # Serves the main assets
│   ├── /img/{file_path:path} # Serves images
│   ├── /sounds/{file_path:path} # Serves sounds
│   └── /{file_path:path} # Serves other static files
├── requirements.txt # Python dependencies
│   ├── fastapi     # Web framework
│   ├── python-telegram-bot # Telegram Bot API
│   └── uvicorn     # ASGI server
├── package.json    # Node.js dependencies
├── vite.config.js  # Vite build configuration
├── render.yaml     # Render.com deployment config
│   ├── buildCommand    # Build steps
│   ├── startCommand    # Server startup
│   └── envVars        # Environment variables
└── .env           # Environment variables (not in repo)
    ├── BOT_TOKEN     # Telegram Bot API token
    ├── WEBAPP_URL    # Application URL
    └── IS_PRODUCTION # Environment mode flag
    └── DATABASE_URL  # Database URL
```

## Bot Functionality

The bot logic is now implemented within the `api/index.py` file. It operates in two modes:
- Development: Uses polling for receiving updates
- Production: Uses webhooks for better performance

Commands:
- `/start`: Displays a button to launch the game

## Backlog
- [x] The leaderboard should be deduced by players, and your position should be shown not by game but by position in the leaderboard.
- [x] In the info box with the number 5, add text indicating that you should press the spacebar or tap the screen to continue.
- [x] On the third step of the tutorial, which explains the "plus one" button, add an arrow pointing to where you need to click.
- [x] The full leaderboard in chat.
- [x] My results in chat.
- [ ] Analytics.
- [ ] Paid actions.
- - [ ] Star
- - [ ] Card

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License

## Credits

Originally created by [titulus](https://github.com/titulus/cubegame)
