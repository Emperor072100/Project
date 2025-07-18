# app/models/prioridad.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from core.database import Base

class Prioridad(Base):
    __tablename__ = "project_prioridades"

    id = Column(Integer, primary_key=True, index=True)
    nivel = Column(String(255), nullable=False)  # Por ejemplo: "Alta", "Media", "Baja"

    proyectos = relationship("Proyecto", back_populates="prioridad")
