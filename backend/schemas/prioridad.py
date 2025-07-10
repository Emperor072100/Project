from pydantic import BaseModel

class PrioridadOut(BaseModel):
    id: int
    nivel: str # Asegúrate de que el campo sea 'nivel' como en tu modelo Prioridad

    class Config:
        from_attributes = True