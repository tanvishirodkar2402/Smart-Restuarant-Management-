import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import init_db_seed

from app.routers import (
    auth, users, categories, food_items, tables, 
    reservations, orders, kitchen, inventory, offers, 
    reviews, analytics, ai_assistant
)

logger = logging.getLogger("uvicorn.error")

# Create tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack Smart Restaurant Management System Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to seed default data & handle SQLite column migrations
@app.on_event("startup")
def startup_event():
    # SQLite column migration safety check
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            try:
                conn.execute(text("ALTER TABLE orders ADD COLUMN estimated_minutes INTEGER DEFAULT 20"))
                logger.info("Migrated orders table: added estimated_minutes column")
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE orders ADD COLUMN expected_ready_time DATETIME"))
                logger.info("Migrated orders table: added expected_ready_time column")
            except Exception:
                pass
            conn.commit()
    except Exception as e:
        logger.warning(f"Column migration warning: {e}")

    db = SessionLocal()
    try:
        init_db_seed(db)
    except Exception as e:
        logger.error(f"Error initializing DB seed: {e}")
    finally:
        db.close()

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(food_items.router, prefix=settings.API_V1_STR)
app.include_router(tables.router, prefix=settings.API_V1_STR)
app.include_router(reservations.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(kitchen.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Smart Restaurant Management System API is running!",
        "documentation": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
