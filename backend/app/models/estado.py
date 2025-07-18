# app/models/estado.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from core.database import Base

class Estado(Base):
    __tablename__ = "project_estados"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    categoria = Column(String(255), nullable=True)  # si usas la categoría también

    proyectos = relationship("Proyecto", back_populates="estado")
