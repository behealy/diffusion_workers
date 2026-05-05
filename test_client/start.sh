#!/bin/bash

# Diffusion Workers Test Client - Quick Start Script

echo "🚀 Starting Diffusion Workers Test Client..."

cd "$(dirname "$0")"

# Check if Python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required"
    exit 1
fi

# Start HTTP server on port 8080
echo "📡 Opening http://localhost:8080 in your browser..."
echo "⚙️  Target API Server: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

python3 -m http.server 8080
