from databases import Database
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, func
import os
import logging
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
MAX_CONNECTIONS = 20
MIN_CONNECTIONS = 5

# Initialize database objects
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

class DatabaseManager:
    def __init__(self):
        self._database = Database(
            DATABASE_URL,
            min_size=MIN_CONNECTIONS,
            max_size=MAX_CONNECTIONS,
            force_rollback=bool(os.getenv('TESTING'))
        )
        self._engine = create_engine(DATABASE_URL)
        self._is_connected = False

    async def connect(self):
        if not self._is_connected:
            try:
                await self._database.connect()
                self._is_connected = True
                logger.info("Database connected successfully")
            except Exception as e:
                logger.error(f"Database connection failed: {e}")
                raise

    async def disconnect(self):
        if self._is_connected:
            try:
                await self._database.disconnect()
                self._is_connected = False
                logger.info("Database disconnected successfully")
            except Exception as e:
                logger.error(f"Database disconnection failed: {e}")
                raise

    @asynccontextmanager
    async def connection(self):
        """Контекстный менеджер для автоматического подключения/отключения"""
        await self.connect()
        try:
            yield self._database
        finally:
            if not bool(os.getenv('TESTING')):  # Не отключаемся в тестовом режиме
                await self.disconnect()

    def create_tables(self):
        """Создает таблицы в базе данных"""
        metadata.create_all(self._engine)

    async def get_leaderboard(self):
        """Получает полный список лидеров"""
        query = """
            SELECT 
                username,
                MAX(score) as score,
                MAX(max_value) as max_value,
                COUNT(*) as total_games,
                RANK() OVER (ORDER BY MAX(score) DESC) as rank
            FROM scores 
            WHERE played_at >= NOW() - INTERVAL '30 days'
            GROUP BY username
            ORDER BY score DESC
        """
        async with self.connection() as db:
            return await db.fetch_all(query)

    async def save_score(self, username: str, max_value: int, score: int):
        """Сохраняет результат игры"""
        query = scores.insert().values(
            username=username,
            max_value=max_value,
            score=score
        )
        async with self.connection() as db:
            await db.execute(query)

    async def get_user_stats(self, username: str):
        """Получает статистику пользователя"""
        stats_query = """
            SELECT 
                MAX(score) as best_score,
                MAX(max_value) as best_max_value,
                COUNT(*) as total_games,
                AVG(score) as avg_score,
                RANK() OVER (ORDER BY MAX(score) DESC) as rank
            FROM scores 
            WHERE username = :username AND played_at >= NOW() - INTERVAL '30 days'
            GROUP BY username
        """
        async with self.connection() as db:
            return await db.fetch_one(stats_query, {"username": username})

    async def get_user_history(self, username: str):
        """Получает историю игр пользователя"""
        history_query = """
            SELECT 
                played_at,
                score,
                max_value
            FROM scores 
            WHERE username = :username AND played_at >= NOW() - INTERVAL '30 days'
            ORDER BY played_at DESC
        """
        async with self.connection() as db:
            return await db.fetch_all(history_query, {"username": username})

# Создаем глобальный экземпляр менеджера БД
db_manager = DatabaseManager() 