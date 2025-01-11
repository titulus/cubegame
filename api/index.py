from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from httpx import AsyncClient
import os
from dotenv import load_dotenv
import telegram
import logging
from telegram.error import NetworkError
import asyncio
from api.database import db_manager, scores

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

async def handle_telegram_message(message, bot, database):
    """Handle telegram message with provided bot instance and database connection"""
    try:
        if message.text == "/start":
            keyboard = telegram.InlineKeyboardButton(
                text="Play Cube Game!",
                web_app=telegram.WebAppInfo(url=WEBAPP_URL)
            )
            reply_markup = telegram.InlineKeyboardMarkup([[keyboard]])
            await bot.send_message(
                chat_id=message.chat.id,
                           text="🎮 Welcome to Cube Game! 🎲\n\n"
                                "Click the button below to start playing.\n\n"
                                "Available commands:\n"
                                "/stats - 📊 View your monthly statistics\n"
                                "/leaderboard - 🏆 Check the monthly leaderboard",                reply_markup=reply_markup
            )
        elif message.text == "/leaderboard":
            leaderboard = await db_manager.get_leaderboard(database)
            text = "🏆 <b>Monthly Leaderboard</b> 🏆\n\n"
            for idx, entry in enumerate(leaderboard):
                medal = "🏆" if idx == 0 else "🥈" if idx == 1 else "🥉" if idx == 2 else "🎮"
                formatted_username = entry['username']
                if entry['username'] == message.from_user.username:
                    formatted_username = f"<b>{formatted_username}</b>"
                text += f"{medal} <code>{entry['rank']}. {formatted_username:<20} {entry['score']:>4}</code> 🎲 <code>{entry['max_value']:>2}</code> (<code>{entry['total_games']}</code> games)\n"
            await bot.send_message(chat_id=message.chat.id, text=text, parse_mode='HTML')
        elif message.text == "/stats":
            stats = await db_manager.get_user_stats(database, message.from_user.username)
            if stats:
                stats_text = f"📊 <b>Your Monthly Stats</b>\n\n"
                stats_text += f"🏆 Rank: <code>{stats['rank']}</code>\n"
                stats_text += f"🎯 Best Score: <code>{stats['best_score']}</code>\n"
                stats_text += f"🎲 Best Value: <code>{stats['best_max_value']}</code>\n"
                stats_text += f"📈 Average Score: <code>{int(stats['avg_score'])}</code>\n"
                stats_text += f"🎮 Games Played: <code>{stats['total_games']}</code>"
                
                await bot.send_message(chat_id=message.chat.id, text=stats_text, parse_mode='HTML')
                
                history = await db_manager.get_user_history(database, message.from_user.username)
                history_text = "📜 <b>Your Recent Games</b>\n\n"
                history_text += "<code>   Date    Score  Max</code>\n"
                for game in history:
                    date = game['played_at'].strftime("%Y-%m-%d")
                    history_text += f"<code>{date} {game['score']:>6} {game['max_value']:>4}</code>\n"
                    
                await bot.send_message(chat_id=message.chat.id, text=history_text, parse_mode='HTML')
            else:
                await bot.send_message(chat_id=message.chat.id, text="You haven't played any games in the last 30 days!")
    except Exception as e:
        logger.error(f"Error handling message: {e}")
        raise

@app.post("/telegram-webhook/{bot_token}")
async def telegram_webhook(bot_token: str, request: Request):
    """Handle incoming Telegram updates."""
    try:
        # Создаем новый инстанс бота для каждого запроса
        bot = telegram.Bot(token=BOT_TOKEN)
        
        data = await request.json()
        logger.info(f"Received webhook data: {data}")
        
        if "message" in data:
            message = telegram.Message.de_json(data["message"], bot)
            
            # Создаем новое подключение к БД для этого запроса
            database = await db_manager.get_connection()
            try:
                await handle_telegram_message(message, bot, database)
            finally:
                await database.disconnect()
                logger.info("Database disconnected successfully")
                
        return {"ok": True}
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return {"ok": False, "error": str(e)}

@app.post("/save-score")
async def save_score(request: Request):
    try:
        data = await request.json()
        logger.info(f"Saving score for user: {data['username']}")
        
        database = await db_manager.get_connection()
        try:
            await db_manager.save_score(
                database,
                username=data['username'],
                max_value=data['max_value'],
                score=data['score']
            )

            rank_query = """
                SELECT COUNT(*) + 1
                FROM scores
                WHERE score > COALESCE((SELECT score FROM scores WHERE username = :username ORDER BY played_at DESC LIMIT 1), 0)
            """
            rank = await database.fetch_val(rank_query, {"username": data['username']})
            
            total_games_query = "SELECT COUNT(*) FROM scores WHERE played_at >= NOW() - INTERVAL '30 days'"
            total_games = await database.fetch_val(total_games_query)
            
            leaderboard = await db_manager.get_leaderboard(database, limit=5)

            return {
                "status": "success", 
                "rank": rank, 
                "total_games": total_games, 
                "leaderboard": leaderboard
            }
        finally:
            await database.disconnect()
            logger.info("Database disconnected successfully")
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
