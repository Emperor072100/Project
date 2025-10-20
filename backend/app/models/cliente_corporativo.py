from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from core.database import Base


class ClienteCorporativo(Base):
    __tablename__ = "campanas_clientes_corporativos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    logo = Column(String, nullable=True)  # URL del logo
    sector = Column(String, nullable=False)

    # Relaciones
    contactos = relationship("Cliente", back_populates="cliente_corporativo")
    campanas = relationship("Campaña", back_populates="cliente_corporativo")

    def __repr__(self):
        return (
            f"<ClienteCorporativo(id={self.id}, "
            f"nombre='{self.nombre}', sector='{self.sector}')>"
        )
