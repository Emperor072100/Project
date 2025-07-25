from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path

# Cargar .env explícitamente desde múltiples ubicaciones posibles
current_dir = Path(__file__).resolve().parent
project_dir = current_dir.parent
env_paths = [
    project_dir / ".env",
    current_dir / ".env",
    Path(".env")
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        break

DATABASE_URL = os.getenv("DATABASE_URL")

# Si no encuentra en .env, usar la URL hardcodeada como fallback
if not DATABASE_URL:
    DATABASE_URL = "postgresql://notion_admin:2809@localhost:5432/notionlite"
    print(f"Usando DATABASE_URL por defecto: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Este método debe estar aquí:
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
