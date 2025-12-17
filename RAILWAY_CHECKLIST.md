# ✅ Checklist de Configuración para Railway

## 🚀 Estado Actual de tu Proyecto

### ✅ Backend (Node.js + Express)

- ✅ **Puerto**: Escucha en `process.env.PORT` (fallback: 4000)
- ✅ **CORS**: Habilitado con `origin: '*'` para acepta peticiones desde cualquier origen
- ✅ **Socket.io**: CORS habilitado para WebSocket
- ✅ **Base de Datos**: Usa variables de entorno (`MYSQLHOST`, `MYSQLPORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`)
- ✅ **Helmet**: Habilitado para headers de seguridad
- ✅ **Express.json**: Configurado para parsear JSON

**Archivos configurados:**
- `Backend/index.js` - CORS y Puerto
- `Backend/config/database.js` - Conexión a MySQL

---

### ✅ Frontend (Angular)

- ✅ **environment.ts**: Apunta a `https://plan-del-proyecto-production.up.railway.app`
- ✅ **environment.prod.ts**: Apunta a `https://plan-del-proyecto-production.up.railway.app`
- ✅ **Servicios**: Todos usan `environment.apiUrl`:
  - `api.service.ts` ✅
  - `socket.service.ts` ✅
  - `auth.service.ts` ✅
  - `session.service.ts` ✅
  - `user.service.ts` ✅
  - `achievement.service.ts` ✅

**Archivos configurados:**
- `Frontend/src/environments/environment.ts`
- `Frontend/src/environments/environment.prod.ts`

---

## 📋 Pasos para Desplegar en Railway

### 1️⃣ Backend en Railway

#### Variables de Entorno (.env en Railway):

```env
# Puerto
PORT=4000

# Node Environment
NODE_ENV=production

# Database (Conexión a MySQL en Railway)
MYSQLHOST=tu-railway-db.railway.internal
MYSQLPORT=3306
MYSQL_DATABASE=estudiemos
MYSQL_USER=root
MYSQL_PASSWORD=tu-contraseña-segura

# URLs
CLIENT_URL=https://tu-frontend-railway-url.up.railway.app

# JWT
JWT_SECRET=una-cadena-secreta-muy-larga

# Email (Opcional)
SMTP_HOST=smtp.tu-server.com
SMTP_PORT=587
```

#### Comando de Build:
```bash
npm install
```

#### Comando de Inicio:
```bash
npm run dev
```
O para producción:
```bash
node index.js
```

### 2️⃣ Frontend en Railway

#### Antes de desplegar, construye la versión de producción:

```bash
cd Frontend
ng build --configuration=production
```

Esto generará la carpeta `dist/estudiemos-frontend` lista para servir.

#### Variables de Entorno (si las necesitas):
En este caso, no necesitas variables de entorno adicionales porque están compiladas en el build.

---

## 🔍 Verificación Post-Deploy

### ✅ Prueba 1: Backend disponible

```bash
curl https://tu-backend-railway-url.up.railway.app/api/docs
```

Deberías recibir la documentación de Swagger (si no, verifica que el endpoint existe).

### ✅ Prueba 2: CORS funciona

Abre el navegador en `https://tu-frontend-railway-url.up.railway.app` y abre DevTools (F12).

En la **Console** no deberías ver errores de CORS como:

```
❌ Access to XMLHttpRequest at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

### ✅ Prueba 3: Socket.io se conecta

En DevTools → **Console**, deberías ver:

```
✅ Conectado a Socket.io: [socket-id]
```

### ✅ Prueba 4: Peticiones HTTP funcionan

1. Abre DevTools → **Network**
2. Intenta hacer login
3. Deberías ver peticiones POST a `https://tu-backend-railway-url.up.railway.app/api/auth/login`
4. Respuesta debe ser 200 OK (no errores CORS)

---

## 🐛 Troubleshooting

### ❌ Error: "Access to XMLHttpRequest blocked by CORS"

**Causa**: CORS no está funcionando correctamente en el backend.

**Solución**:
1. Verifica que el backend tiene `app.use(cors({ origin: '*' }));` en `index.js`
2. Verifica que el puerto está abierto en Railway
3. Reinicia el deployment

### ❌ Error: "Cannot connect to database"

**Causa**: Variables de entorno de base de datos incorrectas.

**Solución**:
1. En Dashboard de Railway, verifica las variables `MYSQLHOST`, `MYSQLPORT`, etc.
2. Prueba la conexión desde una herramienta MySQL (DBeaver, MySQL Workbench)
3. Revisa los logs en Railway para errores específicos

### ❌ Error: "Socket.io connection timeout"

**Causa**: Socket.io no está aceptando conexiones WebSocket.

**Solución**:
1. Verifica que `io.new Server()` tiene `cors: { origin: '*' }`
2. Abre DevTools → Network → WS (filter)
3. Verifica si hay conexión WebSocket `wss://tu-backend-url`

### ❌ Frontend muestra "Cannot GET /"

**Causa**: Frontend no se está sirviendo correctamente.

**Solución**:
1. Verifica que los archivos estén en `dist/`
2. Railway necesita un servidor web para servir Angular
3. Considera usar un servicio de hosting estático (Vercel, Netlify) para frontend

---

## 📝 Resumen de URLs

```
DESARROLLO (Local):
- Frontend: http://localhost:4200
- Backend: http://localhost:4000
- Socket: ws://localhost:4000

PRODUCCIÓN (Railway):
- Frontend: https://tu-frontend-railway.up.railway.app
- Backend: https://tu-backend-railway.up.railway.app
- Socket: wss://tu-backend-railway.up.railway.app (automático)
```

---

## 🎯 Próximos Pasos

1. **Reemplaza URLs**: Cambiar `plan-del-proyecto-production.up.railway.app` por tu URL REAL de Railway
2. **Construye producción**: `ng build --configuration=production`
3. **Verifica credenciales**: Asegúrate de tener contraseñas seguras en .env
4. **Deploy**: Haz push a tu repo, Railway desplegará automáticamente
5. **Prueba**: Verifica en DevTools que todo conecta sin errores

---

**¡Tu proyecto está listo para Railway!** 🚀
