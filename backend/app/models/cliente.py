from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


class Cliente(Base):
    __tablename__ = "campanas_contacto"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    telefono = Column(String, nullable=False)
    correo = Column(String, nullable=False)
    cliente_corporativo_id = Column(
        Integer,
        ForeignKey("campanas_clientes_corporativos.id"),
        nullable=False
    )
    
    # Relaciones
    cliente_corporativo = relationship(
        "ClienteCorporativo",
        back_populates="contactos"
    )
    campanas = relationship("Campaña", back_populates="contacto")
