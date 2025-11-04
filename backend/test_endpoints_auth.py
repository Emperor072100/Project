"""
Script para probar endpoints CON autenticación
Primero hace login y luego prueba cada endpoint
"""
import requests
import json

# URL del backend
BASE_URL = "https://campaignmanagement.backend.andesbpo.com"

# Deshabilitar warnings de SSL
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print("="*60)
print("PRUEBA DE ENDPOINTS CON AUTENTICACIÓN")
print("="*60)

# Credenciales - CAMBIAR POR LAS REALES
print("\n⚠️  IMPORTANTE: Ingresa tus credenciales")
username = input("Usuario: ").strip()
password = input("Contraseña: ").strip()

if not username or not password:
    print("❌ Debes ingresar usuario y contraseña")
    exit(1)

# 1. Hacer login
print(f"\n1️⃣ Haciendo login con usuario: {username}...")
try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": username, "password": password},
        verify=False
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print(f"✅ Login exitoso")
        print(f"   Token: {token[:20]}...")
    else:
        print(f"❌ Login falló: {response.status_code}")
        print(f"   Respuesta: {response.text}")
        exit(1)
except Exception as e:
    print(f"❌ Error en login: {e}")
    exit(1)

# 2. Probar endpoints con el token
headers = {
    "Authorization": f"Bearer {token}"
}

print("\n2️⃣ Probando endpoints con autenticación...")
endpoints = {
    "/usuarios/": "Usuarios",
    "/campanas/": "Campañas",
    "/contactos/": "Contactos",
    "/proyectos/": "Proyectos",
    "/clientes-corporativos/": "Clientes Corporativos",
    "/tipos/": "Tipos",
    "/equipos/": "Equipos",
    "/estados/": "Estados",
    "/prioridades/": "Prioridades",
}

resultados = {}

for endpoint, nombre in endpoints.items():
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, verify=False)
        
        if response.status_code == 200:
            data = response.json()
            count = len(data) if isinstance(data, list) else "N/A"
            print(f"   ✅ {nombre:25} - {count} registros")
            resultados[nombre] = {"status": "OK", "count": count}
        elif response.status_code == 401:
            print(f"   ❌ {nombre:25} - No autorizado (token inválido)")
            resultados[nombre] = {"status": "ERROR", "message": "No autorizado"}
        elif response.status_code == 404:
            print(f"   ⚠️  {nombre:25} - Endpoint no encontrado")
            resultados[nombre] = {"status": "WARNING", "message": "No encontrado"}
        else:
            print(f"   ⚠️  {nombre:25} - Código: {response.status_code}")
            resultados[nombre] = {"status": "WARNING", "message": f"Status {response.status_code}"}
    except Exception as e:
        print(f"   ❌ {nombre:25} - Error: {str(e)[:50]}")
        resultados[nombre] = {"status": "ERROR", "message": str(e)[:50]}

# 3. Resumen
print("\n" + "="*60)
print("RESUMEN")
print("="*60)

exitosos = sum(1 for r in resultados.values() if r["status"] == "OK")
fallidos = sum(1 for r in resultados.values() if r["status"] == "ERROR")
advertencias = sum(1 for r in resultados.values() if r["status"] == "WARNING")

print(f"\n✅ Exitosos: {exitosos}")
print(f"❌ Fallidos: {fallidos}")
print(f"⚠️  Advertencias: {advertencias}")

if fallidos > 0:
    print("\n💡 Endpoints con errores:")
    for nombre, resultado in resultados.items():
        if resultado["status"] == "ERROR":
            print(f"   - {nombre}: {resultado['message']}")

if exitosos == len(endpoints):
    print("\n🎉 ¡Todos los endpoints funcionan correctamente!")
    print("   El problema debe estar en el frontend")
elif exitosos > 0:
    print("\n⚠️  Algunos endpoints funcionan pero otros no")
    print("   Revisa los permisos del usuario o la configuración del backend")
else:
    print("\n❌ Ningún endpoint funciona")
    print("   Posibles causas:")
    print("   1. El token no es válido")
    print("   2. Hay un problema con la autenticación en el backend")
    print("   3. Los headers no se están enviando correctamente")

print("\n" + "="*60)
