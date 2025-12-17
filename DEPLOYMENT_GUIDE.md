# 📋 Guía de Deployment en Railway

## 🚀 Paso 1: Obtener URLs de Railway

Después de desplegar tu proyecto en Railway, tendrás dos URLs:
- **Backend**: `https://tu-backend-project.up.railway.app`
- **Frontend**: `https://tu-frontend-project.up.railway.app`

---

## 🔧 Paso 2: Configurar Backend en Railway

### Variables de Entorno del Backend (.env)

En tu proyecto de Railway backend, agrega estas variables:

```env
NODE_ENV=production
PORT=4000
CLIENT_URL=https://tu-frontend-project.up.railway.app

# Database
MYSQLHOST=tu-railway-db-host.railway.app
MYSQLPORT=3306
MYSQL_DATABASE=estudiemos
MYSQL_USER=root
MYSQL_PASSWORD=tu-contraseña-segura

# JWT
JWT_SECRET=una-cadena-secreta-muy-larga-y-segura

# Email (opcional)
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu-email@ejemplo.com
SMTP_PASS=tu-contraseña
```

### CORS Automático en Backend

El backend ahora detecta automáticamente:
- ✅ Peticiones desde `http://localhost:4200` (desarrollo)
- ✅ Peticiones desde tu `CLIENT_URL` de Railway
- ✅ Peticiones sin origin (Postman, mobile apps)

Para agregar más orígenes, edita `index.js` línea ~47:

```javascript
const allowedOrigins = [
  'http://localhost:4200',
  process.env.CLIENT_URL,
  'https://tu-otro-frontend.up.railway.app' // Agregar aquí
];
```

---

## 🎨 Paso 3: Configurar Frontend para Producción

### Environment.prod.ts

Edita `Frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend-project.up.railway.app'  // ← Tu URL real de Railway
};
```

### Construcción de Producción

```bash
cd Frontend
ng build --configuration=production
```

El comando anterior reemplazará automáticamente `environment.ts` con `environment.prod.ts`.

---

## 📦 Paso 4: Desplegar en Railway

### Backend:

```bash
# Asegúrate de estar en la rama main
git add .
git commit -m "Configuración production para Railway"
git push origin main

# Railway detectará cambios en el repo y desplegará automáticamente
```

### Frontend:

1. Build localmente:
```bash
cd Frontend
ng build --configuration=production
```

2. Desplegar los archivos en `dist/estudiemos-frontend`:
```bash
# Railway puede servir el contenido de dist/ como static files
```

---

## ✅ Verificación de Conectividad

Después del deploy, verifica que todo funciona:

### 1️⃣ Prueba el Backend directamente

```bash
curl https://tu-backend-project.up.railway.app/api/docs
```

Deberías ver la documentación de Swagger.

### 2️⃣ Prueba la conexión desde el navegador

Abre DevTools (F12) y ve a Console. Deberías ver:

```
🔌 Inicializando Socket.io...
📍 Conectando a: https://tu-backend-project.up.railway.app
✅ Conectado a Socket.io: [socket-id]
```

### 3️⃣ Prueba CORS

La aplicación debe conectarse sin errores de CORS en Console:

```
No CORS errors ✅
```

Si ves errores de CORS, verifica que tu URL de frontend está en el array `allowedOrigins` del backend.

---

## 🔐 Seguridad en Producción

Estos cambios ya están implementados:

✅ **CORS restringido** - Solo permite orígenes autorizados
✅ **JWT Secret** - Configurable via .env
✅ **SSL/TLS** - Railway proporciona certificados automáticos
✅ **Helmet** - Headers de seguridad habilitados
✅ **Variables de entorno** - Credenciales no están hardcodeadas

---

## 📝 Resumen de Cambios Realizados

### Backend (`index.js`)
- ✅ CORS configurado para orígenes específicos
- ✅ Socket.io con CORS habilitado
- ✅ Soporte para `CLIENT_URL` de .env

### Base de Datos (`config/database.js`)
- ✅ Detecta automáticamente si es Railway o desarrollo local
- ✅ Usa `MYSQLHOST` y `MYSQLPORT` para producción
- ✅ Configura SSL para Railway automáticamente

### Frontend (`environment.ts` y `environment.prod.ts`)
- ✅ Desarrollo: apunta a `http://localhost:4000`
- ✅ Producción: apunta a tu backend de Railway
- ✅ Servicios usan `environment.apiUrl`

---

## 🆘 Troubleshooting

### Error: "Cross-Origin Request Blocked"
→ Tu URL de frontend no está en `allowedOrigins` del backend

**Solución:**
1. Edita `Backend/index.js` línea ~47
2. Agrega tu URL de frontend al array
3. Haz push a Railway

### Error: "Cannot connect to API"
→ Probablemente tu URL de Railway en `environment.prod.ts` es incorrecta

**Solución:**
```bash
# Verifica tu URL en tu dashboard de Railway
# Debe verse como: https://xxxx-production.up.railway.app
```

### Error: "Socket.io connection timeout"
→ El backend no está disponible o CORS está bloqueando

**Solución:**
1. Abre DevTools → Network → WS (filter)
2. Verifica si hay una conexión ws://
3. Si hay error, revisa Console para detalles

---

## 🎯 URLs de Referencia

```
DESARROLLO:
- Frontend: http://localhost:4200
- Backend: http://localhost:4000
- Socket: ws://localhost:4000

PRODUCCIÓN (Railway):
- Frontend: https://tu-frontend-project.up.railway.app
- Backend: https://tu-backend-project.up.railway.app
- Socket: wss://tu-backend-project.up.railway.app (automático con HTTPS)
```

---

**¡Listo! Tu aplicación está lista para producción.** 🚀
