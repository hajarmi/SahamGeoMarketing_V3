#!/bin/bash

# Saham Bank Geomarketing AI - Server Runner
# This script provides commands to run the FastAPI server in different environments.

# Ensure we are in the script's directory
cd "$(dirname "$0")"

MODE=${1:-dev} # Default to 'dev' mode if no argument is provided

if [ "$MODE" = "dev" ]; then
    # --- Development Mode ---
    # Runs a single Uvicorn process with --reload enabled.
    # This is ideal for development as it automatically restarts on code changes.
    echo "🚀 Starting server in DEVELOPMENT mode on http://127.0.0.1:8000"
    uvicorn api_server:app --host 127.0.0.1 --port 8000 --reload

elif [ "$MODE" = "prod" ]; then
    # --- Production Mode ---
    # Runs the app using Gunicorn as a process manager with Uvicorn workers.
    # This is a robust setup for production.
    # -w 4: Spawns 4 worker processes. A good starting point is (2 * number of CPU cores) + 1.
    # -k uvicorn.workers.UvicornWorker: Specifies that Uvicorn should handle the requests.
    echo "🏭 Starting server in PRODUCTION mode on http://0.0.0.0:8000"
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker api_server:app --bind 0.0.0.0:8000

else
    echo "❌ Invalid mode: '$MODE'. Use 'dev' or 'prod'."
    exit 1
fi