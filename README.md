# 🧠 Proyecto de Gestión de Proyectos con FastAPI

API web construida con **FastAPI**, **SQLAlchemy** y **JWT** para autenticar usuarios y administrar proyectos y tareas.

---

## ✅ Funcionalidades actuales

### 🔐 Autenticación

- [x] Login con username y password (`/auth/login`)
- [x] Generación de JWT con campos: id, nombre, correo, rol
- [x] Decodificación de token sin consulta a base de datos (`UserInDB` desde JWT)

### 👤 Usuarios

- [x] Modelo de usuario con roles: `admin` y `usuario`
- [ ] Registro de nuevos usuarios (pendiente)
- [ ] Recuperación/cambio de contraseña (pendiente)

### 📁 Proyectos

- [x] Crear proyecto (solo usuarios autenticados)
- [x] Listar proyectos:
  - Admin: todos los proyectos
  - Usuario: solo sus proyectos
- [x] Actualizar proyecto (solo dueño o admin)
- [x] Eliminar proyecto (solo dueño o admin)

### ✅ Tareas

- [x] Crear tarea asociada a un proyecto
- [x] Listar tareas (filtro opcional por `proyecto_id`)
- [x] Editar tareas
- [x] Eliminar tareas

---

## 🛠️ Estructura del proyecto

```
backend/
├── app/
│   ├── models/         # Modelos SQLAlchemy
│   ├── __init__.py
│
├── core/               # Configuración, seguridad y DB
│   ├── config.py
│   ├── database.py
│   ├── security.py
│
├── routers/            # Rutas FastAPI
│   ├── auth.py
│   ├── proyectos.py
│   ├── tareas.py
│
├── schemas/            # Esquemas Pydantic
│   ├── proyecto.py
│   ├── tarea.py
│
├── main.py             # Punto de entrada FastAPI
```

---

## 📌 Próximas tareas

- [ ] Endpoint para registrar usuarios
- [ ] Validación de duplicados al registrar
- [ ] UI (posiblemente con React)
- [ ] Asociar tareas a responsables individuales (no solo proyectos)
- [ ] Tests automáticos con `pytest`

---

## 🚀 Cómo correr el proyecto

1. Crea el entorno y activa:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

2. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```

3. Corre la API:
   ```bash
   uvicorn app.main:app --reload
   ```

4. Visita: [http://localhost:8000/docs](http://localhost:8000/docs)

---

**🖤 Desarrollado con pasión y código.**
