@echo off
echo ==========================================================
echo              Starting DisputeOps AI Platform               
echo ==========================================================

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "DisputeOps Backend" cmd /k "C:\Users\ranji\AppData\Local\Python\pythoncore-3.14-64\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000"

echo [2/2] Launching React Dashboard on http://127.0.0.1:5173 ...
start "DisputeOps Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 >nul
start http://127.0.0.1:5173
