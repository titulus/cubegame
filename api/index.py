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
from databases import Database
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, func

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

try:
    load_dotenv()

    app = FastAPI()
    BOT_TOKEN = os.getenv('BOT_TOKEN')
    WEBAPP_URL = os.getenv('WEBAPP_URL')
    IS_PRODUCTION = os.getenv('IS_PRODUCTION', '').lower() == 'true'
    DATABASE_URL = os.getenv('DATABASE_URL')

    # Initialize bot
    bot = telegram.Bot(token=BOT_TOKEN)

    # Database setup
    database = Database(DATABASE_URL)
    metadata = MetaData()
except Exception as e:
    logger.error(f"Error during initialization: {e}")
    raise

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

@app.on_event("startup")
async def startup_event():
    """Start the bot when the FastAPI server starts."""
    try:
        # Database setup
        engine = create_engine(DATABASE_URL)
        metadata.create_all(engine)
        logger.info("Connecting to database...")
        await database.connect()
        logger.info("Database connected successfully")

        # Bot setup
        if not IS_PRODUCTION:
            await bot.delete_webhook()
            logger.info("Development mode: Webhook deleted")
            asyncio.create_task(polling())
        else:
            webhook_url = f"{WEBAPP_URL.rstrip('/')}/telegram-webhook/{BOT_TOKEN}"
            await asyncio.sleep(1)
            await bot.set_webhook(webhook_url)
            logger.info(f"Webhook set to {webhook_url}")
            await bot.set_chat_menu_button(
                menu_button=telegram.MenuButton(
                    type="web_app",
                    text="Play Cube Game",
                    web_app=telegram.WebAppInfo(url=WEBAPP_URL)
                )
            )
            logger.info(f"Menu button set with webapp URL: {WEBAPP_URL}")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup when server shuts down."""
    await database.disconnect()
    if IS_PRODUCTION:
        await bot.delete_webhook()
        logger.info("Webhook deleted")

@app.post("/telegram-webhook/{bot_token}")
async def telegram_webhook(bot_token: str, request: Request):
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
        return {"ok": False, "error": str(e)}

@app.post("/save-score")
async def save_score(request: Request):
    try:
        logger.info("save_score endpoint called")
        
        try:
            await database.fetch_val("SELECT 1;")
        except Exception as e:
            logger.error(f"Database connection check failed: {e}")
            return {"status": "error", "error": "Database is not connected"}

        data = await request.json()
        logger.info(f"Saving score for user: {data['username']}")
        query = scores.insert().values(
            username=data['username'],
            max_value=data['max_value'],
            score=data['score']
        )
        logger.info(f"Executing insert query: {query}")
        await database.execute(query)
        logger.info(f"Insert query executed successfully")

        rank_query = """
            SELECT COUNT(*) + 1
            FROM scores
            WHERE score > COALESCE((SELECT score FROM scores WHERE username = :username ORDER BY played_at DESC LIMIT 1), 0)
        """
        logger.info(f"Executing rank query: {rank_query}")
        rank = await database.fetch_val(rank_query, {"username": data['username']})
        logger.info(f"Rank query executed successfully, rank: {rank}")
        
        total_players_query = "SELECT COUNT(DISTINCT username) FROM scores"
        logger.info(f"Executing total players query: {total_players_query}")
        total_players = await database.fetch_val(total_players_query)
        logger.info(f"Total players query executed successfully, total_players: {total_players}")

        leaderboard_query = """
            SELECT username, score, max_value, played_at
            FROM scores
            WHERE played_at >= NOW() - INTERVAL '30 days'
            ORDER BY score DESC
            LIMIT 5
        """
        logger.info(f"Executing leaderboard query: {leaderboard_query}")
        leaderboard = await database.fetch_all(leaderboard_query)
        logger.info(f"Leaderboard query executed successfully")

        return {"status": "success", "rank": rank, "total_players": total_players, "leaderboard": leaderboard}
    except Exception as e:
        logger.error(f"Error saving score: {e}")
        return {"status": "error", "error": str(e)}

# Static file serving
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
