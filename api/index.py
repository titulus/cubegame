from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from httpx import AsyncClient
import os
from dotenv import load_dotenv
import telegram
import logging
import asyncio
from telegram.error import NetworkError
from .database import db_manager, scores

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

    # Initialize bot
    bot = telegram.Bot(token=BOT_TOKEN)
except Exception as e:
    logger.error(f"Error during initialization: {e}")
    raise

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
            # text="Welcome to Cube Game! Click the button below to start playing. Or type /leaderboard to see the leaderboard, /stats to see your results.",
            text="Welcome to Cube Game! Click the button below to start playing.",
            reply_markup=reply_markup
        )
    elif message.text == "/leaderboard":
        try:
            leaderboard = await db_manager.get_leaderboard()
            text = "🏆 <b>Monthly Leaderboard</b> 🏆\n\n"
            for idx, entry in enumerate(leaderboard):
                medal = "🏆" if idx == 0 else "🥈" if idx == 1 else "🥉" if idx == 2 else "🎮"
                formatted_username = entry['username']
                if entry['username'] == message.from_user.username:
                    formatted_username = f"<b>{formatted_username}</b>"
                text += f"{medal} <code>{entry['rank']}. {formatted_username:<20} {entry['score']:>4}</code> 🎲 <code>{entry['max_value']:>2}</code> (<code>{entry['total_games']}</code> games)\n"
            await bot.send_message(chat_id=message.chat.id, text=text, parse_mode='HTML')
        except Exception as e:
            logger.error(f"Error in /leaderboard: {e}")
    elif message.text == "/stats":
        try:
            stats = await db_manager.get_user_stats(message.from_user.username)
            if stats:
                stats_text = f"📊 <b>Your Monthly Stats</b>\n\n"
                stats_text += f"🏆 Rank: <code>{stats['rank']}</code>\n"
                stats_text += f"🎯 Best Score: <code>{stats['best_score']}</code>\n"
                stats_text += f"🎲 Best Value: <code>{stats['best_max_value']}</code>\n"
                stats_text += f"📈 Average Score: <code>{int(stats['avg_score'])}</code>\n"
                stats_text += f"🎮 Games Played: <code>{stats['total_games']}</code>"
                
                await bot.send_message(chat_id=message.chat.id, text=stats_text, parse_mode='HTML')
                
                history = await db_manager.get_user_history(message.from_user.username)
                history_text = "📜 <b>Your Recent Games</b>\n\n"
                history_text += "<code>   Date    Score  Max</code>\n"
                for game in history:
                    date = game['played_at'].strftime("%Y-%m-%d")
                    history_text += f"<code>{date} {game['score']:>6} {game['max_value']:>4}</code>\n"
                    
                await bot.send_message(chat_id=message.chat.id, text=history_text, parse_mode='HTML')
            else:
                await bot.send_message(chat_id=message.chat.id, text="You haven't played any games in the last 30 days!")
        except Exception as e:
            logger.error(f"Error in /stats: {e}")

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
        db_manager.create_tables()
        
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
    await db_manager.disconnect()
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
        data = await request.json()
        logger.info(f"Saving score for user: {data['username']}")
        
        await db_manager.save_score(
            username=data['username'],
            max_value=data['max_value'],
            score=data['score']
        )

        async with db_manager.connection() as db:
            rank_query = """
                SELECT COUNT(*) + 1
                FROM scores
                WHERE score > COALESCE((SELECT score FROM scores WHERE username = :username ORDER BY played_at DESC LIMIT 1), 0)
            """
            rank = await db.fetch_val(rank_query, {"username": data['username']})
            
            total_games_query = "SELECT COUNT(*) FROM scores WHERE played_at >= NOW() - INTERVAL '30 days'"
            total_games = await db.fetch_val(total_games_query)
            
            leaderboard = await db_manager.get_leaderboard()

        return {
            "status": "success", 
            "rank": rank, 
            "total_games": total_games, 
            "leaderboard": leaderboard
        }
    except Exception as e:
        logger.error(f"Error saving score: {e}")
        return {"status": "error", "error": str(e)}

VITE_DEV_SERVER = os.getenv('VITE_DEV_SERVER')

if VITE_DEV_SERVER:
    http_client = AsyncClient()
    
    @app.get("/{path:path}")
    async def proxy_to_vite(path: str, request: Request):
        target_url = f"{VITE_DEV_SERVER}/{path}"
        
        # Проксируем запрос
        response = await http_client.get(target_url)
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers)
        )
else:
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
