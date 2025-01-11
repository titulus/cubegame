import asyncio
import telegram
from telegram.error import NetworkError
import logging
import os
from dotenv import load_dotenv
from api.database import db_manager
from api.index import handle_telegram_message

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

load_dotenv()
BOT_TOKEN = os.getenv('BOT_TOKEN')

async def polling():
    """Poll for new messages in development mode."""
    bot = telegram.Bot(token=BOT_TOKEN)
    await bot.delete_webhook()
    logger.info("Development mode: Webhook deleted")
    
    logger.info("Starting bot polling...")
    offset = 0
    while True:
        try:
            updates = await bot.get_updates(offset=offset, timeout=30)
            for update in updates:
                offset = update.update_id + 1
                if update.message:
                    database = await db_manager.get_connection()
                    try:
                        await handle_telegram_message(update.message, bot, database)
                    finally:
                        await database.disconnect()
                        logger.info("Database disconnected successfully")
        except NetworkError:
            await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Error in polling: {e}")
            await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(polling()) 