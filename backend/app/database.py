import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("uvicorn.error")

Base = declarative_base()

def get_engine():
    # Attempt MySQL first
    mysql_url = settings.DATABASE_URL
    try:
        engine = create_engine(
            mysql_url, 
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"connect_timeout": 3}
        )
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to MySQL database!")
        return engine
    except Exception as e:
        if settings.USE_SQLITE_FALLBACK:
            logger.warning(f"MySQL connection failed ({e}). Falling back to local SQLite database.")
            sqlite_url = "sqlite:///./smart_restaurant.db"
            engine = create_engine(
                sqlite_url, 
                connect_args={"check_same_thread": False}
            )
            return engine
        else:
            raise e

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
