from databases import Database
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, func
import os
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')

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
        self._engine = create_engine(DATABASE_URL)
        
    async def get_connection(self):
        """Создает новое подключение к БД"""
        database = Database(
            DATABASE_URL,
            force_rollback=bool(os.getenv('TESTING'))
        )
        try:
            await database.connect()
            logger.info("Database connected successfully")
            return database
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    def create_tables(self):
        """Создает таблицы в базе данных"""
        metadata.create_all(self._engine)

    async def get_leaderboard(self, database, limit=None):
        """Получает список лидеров с опциональным лимитом"""
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
        if limit:
            query += f" LIMIT {limit}"
        return await database.fetch_all(query)

    async def save_score(self, database, username: str, max_value: int, score: int):
        """Сохраняет результат игры"""
        query = scores.insert().values(
            username=username,
            max_value=max_value,
            score=score
        )
        await database.execute(query)

    async def get_user_stats(self, database, username: str):
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
        return await database.fetch_one(stats_query, {"username": username})

    async def get_user_history(self, database, username: str):
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
        return await database.fetch_all(history_query, {"username": username})

# Создаем глобальный экземпляр менеджера БД
db_manager = DatabaseManager() 