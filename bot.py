from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import telegram
import logging
import asyncio
from telegram.error import NetworkError
from http.server import BaseHTTPRequestHandler

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()
BOT_TOKEN = os.getenv('BOT_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL')
IS_PRODUCTION = os.getenv('IS_PRODUCTION', '').lower() == 'true'

# Initialize bot
bot = telegram.Bot(token=BOT_TOKEN)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def handle_message(message):
    """Handle incoming message."""
    if message.text == "/start":
        keyboard = telegram.InlineKeyboardButton(
            text="Play Cube Game!",
            web_app=telegram.WebAppInfo(url=WEBAPP_URL)
        )
        reply_markup = telegram.InlineKeyboardMarkup([[keyboard]])
        await bot.send_message(
            chat_id=message.chat.id,
            text="Welcome to Cube Game! Click the button below to start playing:",
            reply_markup=reply_markup
        )

async def polling():
    """Poll for new messages."""
    if IS_PRODUCTION:
        logger.info("Polling disabled in production")
        return
        
    logger.info("Starting bot polling...")
    offset = 0
    while True:
        try:
            updates = await bot.get_updates(offset=offset, timeout=30)
            for update in updates:
                offset = update.update_id + 1
                if update.message:
                    await handle_message(update.message)
        except NetworkError:
            await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Error in polling: {e}")
            await asyncio.sleep(1)

# Start polling in background for local development
@app.on_event("startup")
async def startup_event():
    """Start the bot when the FastAPI server starts."""
    if not IS_PRODUCTION:
        # Clear any existing webhooks in development mode
        await bot.delete_webhook()
        logger.info("Development mode: Webhook deleted")
        asyncio.create_task(polling())
    else:
        # Set webhook in production
        webhook_url = f"{WEBAPP_URL.rstrip('/')}/telegram-webhook/{BOT_TOKEN}"
        await asyncio.sleep(1)
        await bot.set_webhook(webhook_url)
        logger.info(f"Webhook set to {webhook_url}")
         # Configure menu button with Web App
        await bot.set_chat_menu_button(
            menu_button=telegram.MenuButton(
                type="web_app",
                text="Play Cube Game",
                web_app=telegram.WebAppInfo(url=WEBAPP_URL)
            )
        )
        logger.info(f"Menu button set with webapp URL: {WEBAPP_URL}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup when server shuts down."""
    if IS_PRODUCTION:
        await bot.delete_webhook()
        logger.info("Webhook deleted")

# Telegram webhook endpoint
@app.post(f"/telegram-webhook/{BOT_TOKEN}")
async def telegram_webhook(request: Request):
    """Handle incoming Telegram updates."""
    try:
        data = await request.json()
        logger.info(f"Received webhook data: {data}")
        if "message" in data:
            message = telegram.Message.de_json(data["message"], bot)
            await handle_message(message)
        return {"ok": True}
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        # Return 200 to Telegram even if we have an error
        return {"ok": False, "error": str(e)}

# Serve static files
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/")
async def root():
    return FileResponse('dist/index.html')

@app.get("/main-{hash}.{ext}")
async def serve_main_assets(hash: str, ext: str):
    file_path = f"dist/assets/main-{hash}.{ext}"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse({"error": "File not found"}, status_code=404)

@app.get("/img/{file_path:path}")
async def serve_images(file_path: str):
    if os.path.exists(f"public/img/{file_path}"):
        return FileResponse(f"public/img/{file_path}")
    elif os.path.exists(f"dist/img/{file_path}"):
        return FileResponse(f"dist/img/{file_path}")
    return JSONResponse({"error": "File not found"}, status_code=404)

@app.get("/sounds/{file_path:path}")
async def serve_sounds(file_path: str):
    if os.path.exists(f"public/sounds/{file_path}"):
        return FileResponse(f"public/sounds/{file_path}")
    elif os.path.exists(f"dist/sounds/{file_path}"):
        return FileResponse(f"dist/sounds/{file_path}")
    return JSONResponse({"error": "File not found"}, status_code=404)

@app.get("/{file_path:path}")
async def serve_root_files(file_path: str):
    if os.path.exists(f"public/{file_path}"):
        return FileResponse(f"public/{file_path}")
    elif os.path.exists(f"dist/{file_path}"):
        return FileResponse(f"dist/{file_path}")
    return JSONResponse({"error": "File not found"}, status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from databases import Database
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, func

# Database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')
database = Database(DATABASE_URL)
metadata = MetaData()

# Define scores table
scores = Table(
    "scores",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String),
    Column("max_value", Integer),
    Column("score", Integer),
    Column("played_at", DateTime, server_default=func.now())
)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    engine = create_engine(DATABASE_URL)
    metadata.create_all(engine)
    await database.connect()
    # existing startup code...

@app.on_event("shutdown")
async def shutdown_event():
    await database.disconnect()
    # existing shutdown code...

# Update score saving endpoint
@app.post("/save-score")
async def save_score(request: Request):
    data = await request.json()
    query = scores.insert().values(
        username=data['username'],
        max_value=data['max_value'],
        score=data['score']
    )
    await database.execute(query)

    # Calculate rank
    rank_query = """
        SELECT COUNT(*) + 1
        FROM scores
        WHERE score > (SELECT score FROM scores WHERE username = :username ORDER BY played_at DESC LIMIT 1)
    """
    rank = await database.fetch_val(rank_query, {"username": data['username']})
    
    # Calculate total players
    total_players_query = "SELECT COUNT(DISTINCT username) FROM scores"
    total_players = await database.fetch_val(total_players_query)

    # Fetch leaderboard
    leaderboard_query = """
        SELECT username, score, max_value, played_at
        FROM scores
        WHERE played_at >= NOW() - INTERVAL '30 days'
        ORDER BY score DESC
        LIMIT 5
    """
    leaderboard = await database.fetch_all(leaderboard_query)

    return {"status": "success", "rank": rank, "total_players": total_players, "leaderboard": leaderboard}
