@echo off
REM AdoraTour API - Development Server Startup Script

echo.
echo ====================================
echo   AdoraTour API - Development Server
echo ====================================
echo.

REM Activate virtual environment
call .venv\Scripts\activate.bat

echo Virtual environment activated.
echo.

REM Check if database exists
if not exist db.sqlite3 (
    echo Database not found. Running migrations...
    python manage.py migrate
    echo.
)

REM Start development server
echo Starting development server...
echo.
echo Server will be available at: http://localhost:8000
echo API endpoints: http://localhost:8000/api/
echo Admin panel: http://localhost:8000/admin/
echo.

python manage.py runserver

pause
