#!/usr/bin/env python3
"""Script para probar la actualización de implementación"""

import requests
import json

def test_update():
    url = "http://localhost:8000/implementaciones/1"
    
    data = {
        "cliente": "Holaaa",
        "proceso": "SAC",
        "estado": "En Proceso",
        "contractual": {
            "modeloContrato": {
                "seguimiento": "Seguimiento de prueba actualizado",
                "estado": "ok",
                "responsable": "Andes BPO",
                "notas": "Notas de prueba"
            },
            "modeloConfidencialidad": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "alcance": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "fechaInicio": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            }
        },
        "talento_humano": {
            "perfilPersonal": {
                "seguimiento": "Perfil actualizado desde script",
                "estado": "en proceso",
                "responsable": "Cliente",
                "notas": "Test"
            },
            "cantidadAsesores": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "horarios": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "formador": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "capacitacionesAndes": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "capacitacionesCliente": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            }
        },
        "procesos": {
            "responsableCliente": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "responsableAndes": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "responsablesOperacion": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "listadoReportes": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "protocoloComunicaciones": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "guionesProtocolos": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "procesoMonitoreo": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "cronogramaTecnologia": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "cronogramaCapacitaciones": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "realizacionPruebas": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            }
        },
        "tecnologia": {
            "creacionModulo": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "tipificacionInteracciones": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "aplicativosProceso": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "whatsapp": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "correosElectronicos": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            },
            "requisitosGrabacion": {
                "seguimiento": "",
                "estado": "",
                "responsable": "",
                "notas": ""
            }
        }
    }
    
    headers = {"Content-Type": "application/json"}
    
    print("Enviando datos de prueba...")
    print(json.dumps(data, indent=2))
    
    response = requests.put(url, json=data, headers=headers)
    
    print(f"\nRespuesta del servidor: {response.status_code}")
    print(response.text)
    
    if response.status_code == 200:
        print("\n✅ Actualización exitosa!")
    else:
        print("\n❌ Error en la actualización")

if __name__ == "__main__":
    test_update()
