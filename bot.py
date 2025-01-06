from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BOT_TOKEN = os.getenv('BOT_TOKEN')

# Serve the dist directory for built assets
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
    # Try public/img first, then dist/img
    if os.path.exists(f"public/img/{file_path}"):
        return FileResponse(f"public/img/{file_path}")
    elif os.path.exists(f"dist/img/{file_path}"):
        return FileResponse(f"dist/img/{file_path}")
    return JSONResponse({"error": "File not found"}, status_code=404)

@app.get("/sounds/{file_path:path}")
async def serve_sounds(file_path: str):
    # Try public/sounds first, then dist/sounds
    if os.path.exists(f"public/sounds/{file_path}"):
        return FileResponse(f"public/sounds/{file_path}")
    elif os.path.exists(f"dist/sounds/{file_path}"):
        return FileResponse(f"dist/sounds/{file_path}")
    return JSONResponse({"error": "File not found"}, status_code=404)

# Serve favicon and other root-level assets
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
