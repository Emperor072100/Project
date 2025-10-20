from .usuario import Usuario
from .proyecto import Proyecto
from .tarea import Tarea
from .tipo_equipo import Tipo, Equipo
from .cliente import Cliente
from .cliente_corporativo import ClienteCorporativo
from .campana import Campaña
from .historial_campana import HistorialCampaña
from .producto_campana import ProductoCampaña
from .facturacion_campana import FacturacionCampaña

# Implementaciones
from models.project_implementacion_talentoHumano import (
    ProjectImplementacionTalentoHumano,
)
from models.project_implementacion_tecnologia import ProjectImplementacionTecnologia
from models.project_implementacion_procesos import ProjectImplementacionProcesos
from models.project_implementacion_contractual import ProjectImplementacionContractual
from models.project_implementaciones_clienteimple import (
    ProjectImplementacionesClienteImple,
)
