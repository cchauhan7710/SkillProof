@echo off
echo Starting Python NLP Service...
cd HeartOFProject\resume-skill-extractor
if not exist .venv (
    echo Virtual environment not found. Please create it first.
    pause
    exit /b
)
echo Activating virtual environment and starting FastAPI...
.\.venv\Scripts\python.exe -m uvicorn api:app --host 0.0.0.0 --port 8001 --reload
pause
