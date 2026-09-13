#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Locate Python binary
if [ -n "$VIRTUAL_ENV" ] && [ -x "$VIRTUAL_ENV/bin/python" ]; then
    PYTHON_BIN="$VIRTUAL_ENV/bin/python"
elif [ -x "$DIR/../venv/bin/python" ]; then
    PYTHON_BIN="$DIR/../venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="$(command -v python3)"
else
    PYTHON_BIN="python"
fi

# Check if artifacts exist, if not train
if [ ! -f "artifacts/antihistamine_pipeline.joblib" ]; then
    echo "Model artifact not found. Training model now..."
    "$PYTHON_BIN" train_model.py
fi

echo "Starting FastAPI backend server on http://localhost:8000 ..."
exec "$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
