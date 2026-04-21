#!/usr/bin/env bash
# exit on error
set -o errexit

echo "📦 Installing Node.js dependencies..."
npm install

echo "🐍 Installing Python dependencies..."
# Render has python3 and pip pre-installed in its native environment
pip install -r HeartOFProject/resume-skill-extractor/requirements.txt

echo "🧠 Downloading Spacy NLP model..."
python3 -m spacy download en_core_web_sm

echo "✅ Build Complete!"
