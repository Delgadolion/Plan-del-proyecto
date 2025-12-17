# API Backend — Estudiemos

Backend Express.js para autenticación, gestión de usuarios y sesiones de estudio.

## 🚀 Quick Start

```pwsh
npm install
npm run dev
```

La API estará disponible en `http://localhost:4000`

## 📦 Dependencias

- **express** — Framework web
- **bcrypt** — Hash de contraseñas
- **nodemailer** — Envío de emails
- **sqlite** + **sqlite3** — Base de datos
- **jsonwebtoken** — JWT (para implementar)
- **cors** — Cross-Origin Resource Sharing
- **dotenv** — Variables de entorno
- **uuid** — Generación de IDs únicos
- **nodemon** (dev) — Auto-reload

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Servidor
PORT=4000
DB_FILE=./estudiemos.db

# Frontend (CORS + URLs)
CLIENT_URL=http://localhost:4200

# SMTP (Email)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ethereal.user@ethereal.email
SMTP_PASS=ethereal.password
EMAIL_FROM=noreply@estudiemos.local
```

Ver `api/.env.example` para plantilla.

## 📊 Base de Datos

### Tabla: users

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,
  name TEXT,
  verified INTEGER DEFAULT 0,
  verification_token TEXT
);
```

**Campos:**
- `id` — UUID del usuario
- `email` — Correo único
- `password` — Hash bcrypt
- `name` — Nombre completo (opcional)
- `verified` — 1 si email confirmado, 0 si no
- `verification_token` — Token único para confirmar email

## 🔐 Endpoints

### POST /api/register

Registrar nuevo usuario. Envía email de verificación.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "name": "Juan Pérez"
}
```

**Response (200):**
```json
{
  "success": true,
  "previewUrl": "https://ethereal.email/message/XXX"
}
```

**Errores:**
- `400` — Email ya registrado o campos faltantes

---

### GET /api/verify

Verificar token de email y activar usuario.

**Query Params:**
- `token` — Token del email
- `id` — ID del usuario

**Request:**
```
GET /api/verify?token=abc123&id=user-uuid
```

**Response (200):**
```json
{
  "success": true
}
```

**Errores:**
- `400` — Token/ID inválidos o faltantes

---

### POST /api/login

Autenticar usuario. Solo si email está verificado.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (200):**
```json
{
  "token": "user-uuid-string",
  "user": {
    "id": "user-uuid-string",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez"
  }
}
```

**Errores:**
- `401` — Credenciales inválidas
- `403` — Email no verificado

---

## 📧 Sistema de Email

### Flujo

1. Usuario se registra → API genera `verification_token`
2. API envía email con link:
   ```
   http://localhost:4200/verify?token=TOKEN&id=USER_ID
   ```
3. Usuario hace click → Angular navega a `/verify`
4. Frontend hace GET a `/api/verify` con token e id
5. Backend valida y activa usuario

### Testing (Ethereal)

Sin configuración:
- Todos los emails se envían a cuenta de prueba
- API devuelve `previewUrl` para ver el email en navegador
- ✅ Perfecto para desarrollo

### Producción (Gmail, SendGrid, etc.)

Editar `.env` con credenciales reales.

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Token de verificación único (UUID)
- ✅ CORS configurado para localhost:4200
- ⚠️ Token simplificado (usar JWT en producción)
- ⚠️ Sin rate limiting (implementar en producción)
- ⚠️ Sin validación fuerte de email/password

## 📝 Notas

- BD SQLite se crea automáticamente en `./estudiemos.db`
- Emails de Ethereal necesitan abrir el `previewUrl` durante la sesión (no persisten)
- CORS permite solo `http://localhost:4200` (cambiar en producción)

## 🚀 Próximas Features

- [ ] JWT real con refresh tokens
- [ ] Rate limiting
- [ ] Validaciones robustas
- [ ] Endpoint para cambiar contraseña
- [ ] Logout endpoint
- [ ] CRUD de sesiones
- [ ] WebSocket para chat

---

**Última actualización:** 1 de diciembre de 2025
