# 🚀 ENDPOINTS DISPONIBLES - Backend API

## Base URL
\http://localhost:4000/api\

---

## 🔐 AUTENTICACIÓN

### Registro
\\\
POST /auth/register
Content-Type: application/json

{
  \"email\": \"usuario@example.com\",
  \"password\": \"MiPassword123\",
  \"name\": \"Juan Pérez\"
}

Response (201):
{
  \"success\": true,
  \"previewUrl\": \"https://ethereal.email/...\"
}
\\\

### Login
\\\
POST /auth/login
Content-Type: application/json

{
  \"email\": \"usuario@example.com\",
  \"password\": \"MiPassword123\"
}

Response (200):
{
  \"token\": \"2c71c087-30d3-4c5b-b1ca-594ee7c45992\",
  \"user\": {
    \"id\": \"uuid\",
    \"email\": \"usuario@example.com\",
    \"name\": \"Juan Pérez\"
  }
}
\\\

### Verificar Email
\\\
GET /auth/verify?token=TOKEN&id=USER_ID

Response (200):
{ \"success\": true }
\\\

### Verificar Token Activo
\\\
GET /auth/check
Authorization: Bearer TOKEN

Response (200):
{
  \"user\": {
    \"id\": \"uuid\",
    \"iat\": 1234567890,
    \"exp\": 1234654290
  }
}
\\\

---

## 📚 SESIONES (Study Sessions)

### Obtener todas las sesiones
\\\
GET /sessions
GET /sessions?estado=planificado&tipo=focus

Response (200):
{
  \"sessions\": [
    {
      \"id\": \"uuid\",
      \"titulo\": \"Matemáticas Avanzadas\",
      \"descripcion\": \"...\",
      \"tipo\": \"focus\",
      \"duracion\": 90,
      \"maxParticipantes\": 10,
      \"estado\": \"planificado\",
      \"tema\": \"Cálculo\",
      \"creadorId\": \"uuid\",
      \"creador\": { \"id\": \"uuid\", \"name\": \"Juan\", \"email\": \"...\" },
      \"participantes\": [...]
    }
  ]
}
\\\

### Obtener una sesión por ID
\\\
GET /sessions/:id

Response (200):
{ \"session\": {...} }
\\\

### Crear sesión (PROTEGIDO)
\\\
POST /sessions
Authorization: Bearer TOKEN
Content-Type: application/json

{
  \"titulo\": \"Python Para Principiantes\",
  \"descripcion\": \"Aprenderemos lo básico de Python\",
  \"tipo\": \"group\",
  \"duracion\": 120,
  \"maxParticipantes\": 15,
  \"tema\": \"Programación\",
  \"fechaInicio\": \"2025-12-05T18:00:00Z\"
}

Response (201):
{
  \"message\": \"Sesión creada exitosamente\",
  \"session\": {...}
}
\\\

### Actualizar sesión (PROTEGIDO - Solo creador)
\\\
PUT /sessions/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  \"titulo\": \"Nuevo título\",
  \"estado\": \"en-curso\"
}

Response (200):
{
  \"message\": \"Sesión actualizada exitosamente\",
  \"session\": {...}
}
\\\

### Eliminar sesión (PROTEGIDO - Solo creador)
\\\
DELETE /sessions/:id
Authorization: Bearer TOKEN

Response (200):
{ \"message\": \"Sesión eliminada exitosamente\" }
\\\

### Unirse a una sesión (PROTEGIDO)
\\\
POST /sessions/:id/join
Authorization: Bearer TOKEN

Response (200):
{
  \"message\": \"Te uniste a la sesión exitosamente\",
  \"session\": {...}
}
\\\

### Abandonar una sesión (PROTEGIDO)
\\\
POST /sessions/:id/leave
Authorization: Bearer TOKEN

Response (200):
{ \"message\": \"Abandonaste la sesión\" }
\\\

### Obtener mis sesiones (PROTEGIDO)
\\\
GET /sessions/usuario/mis-sesiones
Authorization: Bearer TOKEN

Response (200):
{
  \"sesionesCreadas\": [...],
  \"sesionesUnidas\": [...]
}
\\\

---

## 🏆 ACHIEVEMENTS

### Obtener todos los achievements
\\\
GET /achievements
GET /achievements?categoria=estudio

Response (200):
{
  \"achievements\": [
    {
      \"id\": \"uuid\",
      \"nombre\": \"Primer Paso\",
      \"descripcion\": \"Completa tu primera sesión\",
      \"icono\": \"🎯\",
      \"categoria\": \"estudio\",
      \"puntos\": 10
    }
  ]
}
\\\

### Obtener mis achievements (PROTEGIDO)
\\\
GET /achievements/usuario/mis-achievements
Authorization: Bearer TOKEN

Response (200):
{
  \"achievements\": [
    {
      \"id\": \"uuid\",
      \"usuarioId\": \"uuid\",
      \"achievementId\": \"uuid\",
      \"desbloqueoFecha\": \"2025-12-03T10:30:00Z\",
      \"Achievement\": {...}
    }
  ]
}
\\\

### Desbloquear achievement (PROTEGIDO)
\\\
POST /achievements/:achievementId
Authorization: Bearer TOKEN

Response (201):
{
  \"message\": \"Achievement desbloqueado\",
  \"achievement\": {...}
}
\\\

### Eliminar achievement (PROTEGIDO)
\\\
DELETE /achievements/:achievementId
Authorization: Bearer TOKEN

Response (200):
{ \"message\": \"Achievement eliminado\" }
\\\

---

## 👤 USUARIOS

### Obtener todos los usuarios
\\\
GET /usuarios

Response (200):
{
  \"usuarios\": [
    {
      \"id\": \"uuid\",
      \"name\": \"Juan\",
      \"email\": \"juan@example.com\",
      \"verified\": true
    }
  ]
}
\\\

### Obtener usuario por ID
\\\
GET /usuarios/:id

Response (200):
{
  \"usuario\": {...}
}
\\\

### Obtener mi perfil (PROTEGIDO)
\\\
GET /usuarios/perfil/mi-perfil
Authorization: Bearer TOKEN

Response (200):
{
  \"usuario\": {
    \"id\": \"uuid\",
    \"name\": \"Juan\",
    \"email\": \"juan@example.com\",
    \"achievements\": [...]
  }
}
\\\

### Actualizar mi perfil (PROTEGIDO)
\\\
PUT /usuarios/perfil/actualizar
Authorization: Bearer TOKEN
Content-Type: application/json

{
  \"name\": \"Juan Carlos\",
  \"email\": \"juancarlos@example.com\"
}

Response (200):
{
  \"message\": \"Perfil actualizado exitosamente\",
  \"usuario\": {...}
}
\\\

### Obtener mis estadísticas (PROTEGIDO)
\\\
GET /usuarios/estadisticas/mis-estadisticas
Authorization: Bearer TOKEN

Response (200):
{
  \"estadisticas\": {
    \"sesionesCreadas\": 5,
    \"sesionesUnidas\": 12,
    \"achievementsDesbloqueados\": 8,
    \"tiempoTotalEstudio\": 720
  }
}
\\\

### Eliminar mi cuenta (PROTEGIDO)
\\\
DELETE /usuarios/:id
Authorization: Bearer TOKEN

Response (200):
{ \"message\": \"Cuenta eliminada exitosamente\" }
\\\

---

## ✅ NOTAS IMPORTANTES

- Todos los endpoints **PROTEGIDO** requieren el header:
  \Authorization: Bearer {TOKEN}\

- El token se obtiene en el login y tiene duración de 7 días.

- Los UUIDs se usan para todas las IDs de sesiones, achievements, etc.

- Las transacciones con BD MySQL están correctamente configuradas.

---

## 🔧 CONFIGURACIÓN

- **Puerto**: 4000
- **BD**: MySQL (estudiemos)
- **Puerto DB**: 3306
- **Usuario DB**: root
- **JWT Secret**: unacadenasecretalarga12345

