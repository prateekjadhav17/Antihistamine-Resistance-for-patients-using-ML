#!/usr/bin/env bash
set -e

# Determine project root directory robustly, handling paths with spaces
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "==========================================================="
echo "  Antihistamine Resistance ML Web Application Launcher     "
echo "==========================================================="

# Locate Python binary portably
if [ -n "$VIRTUAL_ENV" ] && [ -x "$VIRTUAL_ENV/bin/python" ]; then
    PYTHON_BIN="$VIRTUAL_ENV/bin/python"
elif [ -x "$ROOT_DIR/venv/bin/python" ]; then
    PYTHON_BIN="$ROOT_DIR/venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="$(command -v python3)"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="$(command -v python)"
else
    echo "Error: Python binary not found. Please ensure Python 3 is installed."
    exit 1
fi

echo "Using Python: $PYTHON_BIN"

# Verify model artifacts exist, train if missing
if [ ! -f "$ROOT_DIR/backend/artifacts/antihistamine_pipeline.joblib" ]; then
    echo "Model artifact missing. Training pipeline from dataset..."
    "$PYTHON_BIN" "$ROOT_DIR/backend/train_model.py"
fi

# Verify frontend node_modules exist
if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
    echo "Frontend dependencies missing. Installing npm packages..."
    (cd "$ROOT_DIR/frontend" && npm install)
fi

# Cleanup handler on exit or interrupt
cleanup() {
    echo ""
    echo "Shutting down servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start FastAPI Backend
echo "Starting FastAPI Backend on http://127.0.0.1:8000 ..."
(cd "$ROOT_DIR" && "$PYTHON_BIN" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000) &
BACKEND_PID=$!

# Wait for FastAPI to become healthy
echo "Verifying backend health..."
READY=false
for i in {1..30}; do
    if curl -s -f "http://127.0.0.1:8000/health" >/dev/null 2>&1; then
        READY=true
        echo "FastAPI Backend is healthy and ready!"
        break
    fi
    sleep 0.5
done

if [ "$READY" = false ]; then
    echo "Error: FastAPI Backend failed to start or did not respond in time."
    echo "Please inspect backend logs above."
    exit 1
fi

# Start React Frontend
echo "Starting React Frontend on http://localhost:3000 ..."
(cd "$ROOT_DIR/frontend" && npm run dev -- --host 0.0.0.0 --port 3000) &
FRONTEND_PID=$!

echo ""
echo "==========================================================="
echo "  Application running successfully!                        "
echo "  Frontend Web App:  http://localhost:3000                 "
echo "  FastAPI Backend:   http://localhost:8000                 "
echo "  API Documentation: http://localhost:8000/docs            "
echo "  Press [Ctrl+C] to stop all servers                       "
echo "==========================================================="

wait "$FRONTEND_PID" "$BACKEND_PID"
