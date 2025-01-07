import os
from datetime import datetime
from typing import List, Dict, Optional

IS_PRODUCTION = os.getenv("IS_PRODUCTION", "false").lower() == "true"

if IS_PRODUCTION:
    from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime
    from databases import Database

    # Get the database URL from environment variable
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/cubegame")

    # SQLAlchemy
    engine = create_engine(DATABASE_URL)
    metadata = MetaData()

    # Define the scores table
    scores = Table(
        "scores",
        metadata,
        Column("id", Integer, primary_key=True),
        Column("telegram_username", String),
        Column("score", Integer),
        Column("max_cube_value", Integer),
        Column("timestamp", DateTime, default=datetime.utcnow),
    )

    # Create tables
    metadata.create_all(engine)

    # Database instance
    database = Database(DATABASE_URL)

    async def save_score(username: str, score: int, max_cube_value: int):
        query = scores.insert().values(
            telegram_username=username,
            score=score,
            max_cube_value=max_cube_value
        )
        await database.execute(query)

    async def get_top_scores(limit: int = 10):
        query = scores.select().order_by(scores.c.score.desc()).limit(limit)
        return await database.fetch_all(query)

    async def get_user_best_score(username: str):
        query = scores.select().where(scores.c.telegram_username == username).order_by(scores.c.score.desc()).limit(1)
        return await database.fetch_one(query)

    async def get_user_position(username: str, current_score: int) -> dict:
        # Get all scores higher than the current score
        query = f"""
        WITH user_rank AS (
            SELECT COUNT(*) + 1 as rank
            FROM scores
            WHERE score > {current_score}
        )
        SELECT rank, (SELECT COUNT(*) FROM scores) as total
        FROM user_rank;
        """
        result = await database.fetch_one(query)
        return {
            "position": result["rank"] if result else 1,
            "total": result["total"] if result else 1
        }

else:
    # In-memory storage for development
    class InMemoryDB:
        def __init__(self):
            self.scores: List[Dict] = []
            self._id_counter = 1

        async def connect(self):
            pass

        async def disconnect(self):
            pass

        async def save_score(self, username: str, score: int, max_cube_value: int):
            score_entry = {
                "id": self._id_counter,
                "telegram_username": username,
                "score": score,
                "max_cube_value": max_cube_value,
                "timestamp": datetime.utcnow()
            }
            self.scores.append(score_entry)
            self._id_counter += 1
            return {"status": "success"}

        async def get_top_scores(self, limit: int = 10):
            return sorted(self.scores, key=lambda x: x["score"], reverse=True)[:limit]

        async def get_user_best_score(self, username: str):
            user_scores = [s for s in self.scores if s["telegram_username"] == username]
            if not user_scores:
                return None
            return max(user_scores, key=lambda x: x["score"])

        async def get_user_position(self, username: str, current_score: int) -> dict:
            # Sort scores in descending order
            all_scores = sorted(self.scores, key=lambda x: x["score"], reverse=True)
            
            # Find position of the current score
            position = 1
            for score in all_scores:
                if current_score >= score["score"]:
                    break
                position += 1
            
            return {
                "position": position,
                "total": len(all_scores) + 1  # +1 because current score isn't saved yet
            }

    # Create in-memory database instance
    database = InMemoryDB()

    # Export the same interface as the production version
    save_score = database.save_score
    get_top_scores = database.get_top_scores
    get_user_best_score = database.get_user_best_score
    get_user_position = database.get_user_position
