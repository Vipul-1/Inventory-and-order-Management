#!/bin/sh
alembic upgrade head 2>/dev/null || python -c "from app.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
uvicorn app.main:app --host 0.0.0.0 --port 8000
