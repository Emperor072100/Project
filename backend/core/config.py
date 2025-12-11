import os
from dotenv import load_dotenv
from pathlib import Path

# Cargar variables desde el archivo .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Configuración base con valores por defecto
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:89.J(GIidcx2^P9G@database-savia.cla22m8co2v1.us-east-1.rds.amazonaws.com:5432/postgres"
)
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey_cambiar_en_produccion_por_valor_seguro_de_al_menos_32_caracteres")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
