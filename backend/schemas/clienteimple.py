from pydantic import BaseModel


class ClienteImpleCreate(BaseModel):
    cliente: str
    proceso: str
