from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import sys
import os
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add parent directory to Python path
parent_dir = str(Path(__file__).parent.parent)
sys.path.append(parent_dir)

from bot import app as bot_app
from database import database, save_score, get_top_scores, get_user_best_score, get_user_position

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins in development
        "https://rnzkr-137-184-230-47.a.free.pinggy.link",
        "https://rnagc-137-184-230-47.a.free.pinggy.link"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    logger.info("Starting up FastAPI application")
    await database.connect()
    logger.info("Connected to database")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down FastAPI application")
    await database.disconnect()
    logger.info("Disconnected from database")

# Mount the bot app
app.mount("/telegram-webhook", bot_app)

# Mount static files
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
app.mount("/img", StaticFiles(directory="dist/img"), name="img")
app.mount("/sounds", StaticFiles(directory="dist/sounds"), name="sounds")

# API endpoints
@app.post("/save-score")
async def save_game_score(request: Request):
    logger.info("Received save-score request")
    data = await request.json()
    username = data.get("username")
    score = data.get("score")
    max_cube_value = data.get("maxCubeValue")
    
    logger.info(f"Saving score: username={username}, score={score}, max_cube_value={max_cube_value}")
    
    if not all([username, score, max_cube_value]):
        logger.error("Missing required fields in save-score request")
        return {"error": "Missing required fields"}
    
    try:
        await save_score(username, score, max_cube_value)
        logger.info(f"Successfully saved score for {username}")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error saving score: {str(e)}")
        return {"error": str(e)}

@app.get("/top-scores")
async def get_scores(limit: int = 10):
    logger.info(f"Getting top {limit} scores")
    try:
        scores = await get_top_scores(limit)
        logger.info(f"Retrieved {len(scores) if scores else 0} top scores")
        return {"scores": scores}
    except Exception as e:
        logger.error(f"Error getting top scores: {str(e)}")
        return {"error": str(e)}

@app.get("/user-best-score/{username}")
async def get_best_score(username: str):
    logger.info(f"Getting best score for user: {username}")
    try:
        score = await get_user_best_score(username)
        logger.info(f"Retrieved best score for {username}: {score}")
        return {"best_score": score}
    except Exception as e:
        logger.error(f"Error getting best score for {username}: {str(e)}")
        return {"error": str(e)}

@app.get("/user-position/{username}/{score}")
async def get_position(username: str, score: int):
    logger.info(f"Getting position for user {username} with score {score}")
    try:
        position = await get_user_position(username, score)
        logger.info(f"Position for {username}: {position}")
        return position
    except Exception as e:
        logger.error(f"Error getting position for {username}: {str(e)}")
        return {"error": str(e)}

# Serve index.html for all other routes
@app.get("/{full_path:path}")
async def serve_index(full_path: str):
    logger.info(f"Serving path: {full_path}")
    try:
        if full_path.endswith(('.js', '.css', '.ico', '.png', '.jpg', '.gif', '.mp3')):
            file_path = f"dist/{full_path}"
            logger.info(f"Serving static file: {file_path}")
            return FileResponse(file_path)
        
        logger.info("Serving index.html")
        return FileResponse("dist/index.html")
    except Exception as e:
        logger.error(f"Error serving file {full_path}: {str(e)}")
        return {"error": str(e)}
