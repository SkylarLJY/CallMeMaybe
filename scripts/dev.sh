#!/bin/bash

# Kill all background processes on exit
trap 'kill 0' EXIT

echo "🚀 Starting CallMeMaybe development servers..."
echo ""

# Start backend
echo "📡 Starting backend..."
(cd backend && source venv/bin/activate && uvicorn main:app --reload) &

# Start frontend  
echo "🎨 Starting frontend..."
(cd frontend && npm run dev) &

echo ""
echo "✅ Servers starting..."
echo "📡 Backend:  http://localhost:8000/docs"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both"
echo ""

wait