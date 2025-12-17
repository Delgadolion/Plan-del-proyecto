# 🚀 Guía Paso a Paso: Desplegar en Railway

## 📌 IMPORTANTE: Reemplaza tu URL de Railway

Antes de cualquier cosa, reemplaza `plan-del-proyecto-production.up.railway.app` en:

1. `Frontend/src/environments/environment.ts`
2. `Frontend/src/environments/environment.prod.ts`

Con tu URL REAL de Railway (se verá como: `xxxxx-production.up.railway.app`)

---

## ✅ Verificación Local Previa al Deploy

### 1️⃣ Verifica que el Backend escucha en el puerto correcto

**Archivo**: `Backend/.env`

```env
PORT=4000
NODE_ENV=production
```

**Código en `Backend/index.js`**:
```javascript
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🔥 API corriendo en puerto ${PORT}`);
});
```

✅ **Estado**: Configurado correctamente

---

### 2️⃣ Verifica que CORS está habilitado

**Archivo**: `Backend/index.js` (línea ~47)

```javascript
app.use(cors({ origin: '*' }));
```

✅ **Estado**: CORS habilitado para todas las peticiones

---

### 3️⃣ Verifica URLs en Frontend

**Archivo**: `Frontend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://plan-del-proyecto-production.up.railway.app'
};
```

**Archivo**: `Frontend/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://plan-del-proyecto-production.up.railway.app'
};
```

✅ **Estado**: URLs configuradas para Railway

---

### 4️⃣ Verifica que los servicios usan environment.apiUrl

Los siguientes servicios usan `environment.apiUrl`:

```
✅ api.service.ts              → environment.apiUrl + '/api'
✅ auth.service.ts             → environment.apiUrl + '/api'
✅ session.service.ts          → environment.apiUrl + '/api/sessions'
✅ user.service.ts             → environment.apiUrl + '/api/usuarios'
✅ achievement.service.ts      → environment.apiUrl + '/api/achievements'
✅ socket.service.ts           → io(environment.apiUrl, {...})
```

✅ **Estado**: Todos los servicios configurados correctamente

---

## 🛠️ Construir Versión de Producción

### Paso 1: Generar Build de Producción

```bash
cd Frontend
ng build --configuration=production
```

Esto generará:
- Carpeta: `Frontend/dist/estudiemos-frontend/`
- Archivos optimizados y minificados
- Versión de producción de Angular

### Paso 2: Verificar que el Build fue exitoso

```bash
ls -la Frontend/dist/estudiemos-frontend/
```

Deberías ver:
```
index.html
main.js
vendor.js
runtime.js
styles.css
... (más archivos)
```

---

## 📤 Desplegar en Railway

### Opción A: Desplegar Backend + Frontend Juntos (Recomendado)

**Backend sirve el Frontend estático**

1. **Coloca los archivos de Frontend en el Backend**:

```bash
# Copia los archivos compilados al Backend
cp -r Frontend/dist/estudiemos-frontend/* Backend/public/
```

2. **Configura Express para servir Frontend**:

En `Backend/index.js` (después de las rutas de API):

```javascript
// Servir archivos estáticos (Frontend)
app.use(express.static('public'));

// SPA: redirigir todas las rutas no-API a index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(__dirname + '/public/index.html');
  }
});
```

3. **Haz push a tu repositorio**:

```bash
git add .
git commit -m "Deploy: Frontend + Backend listo para Railway"
git push origin main
```

Railway desplegará automáticamente.

---

### Opción B: Desplegar Frontend por Separado (Si prefieres)

1. **Deploy Backend en Railway** (proyecto 1)
2. **Deploy Frontend en Vercel o Netlify** (proyecto 2)

En este caso:
- `environment.prod.ts` apunta a la URL del backend de Railway
- Frontend se sirve desde Vercel/Netlify

---

## 🔐 Configurar Variables de Entorno en Railway

### Backend

En Dashboard de Railway, ve a "Variables" y agrega:

```env
PORT=4000
NODE_ENV=production

# Database
MYSQLHOST=tu-database-url.railway.internal
MYSQLPORT=3306
MYSQL_DATABASE=estudiemos
MYSQL_USER=root
MYSQL_PASSWORD=contraseña-fuerte

# URLs
CLIENT_URL=https://tu-frontend-url.railway.app

# JWT
JWT_SECRET=una-cadena-super-secreta-muy-larga

# Email (Opcional)
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu-email@dominio.com
SMTP_PASS=tu-contraseña
```

---

## 📊 Verificación Post-Deploy

### ✅ Test 1: Backend disponible

```bash
curl https://tu-backend-railway.up.railway.app/api/docs
```

Esperado: Documentación Swagger

### ✅ Test 2: Frontend carga

```
https://tu-frontend-railway.up.railway.app/
```

Esperado: Página de Angular carga correctamente

### ✅ Test 3: Login funciona

1. Abre https://tu-frontend-railway.up.railway.app/
2. Intenta hacer login con: `pan@test.com` / (contraseña)
3. Abre DevTools (F12) → Console
4. Deberías ver: `✅ Conectado a Socket.io: [socket-id]`

### ✅ Test 4: Chat y Temporizador en tiempo real

1. Abre dos browsers en incógnito (O diferentes navegadores)
2. Login en ambos con diferentes usuarios
3. Ingresa a la misma sesión
4. En el primer browser: escribe un mensaje
5. **Esperado**: El mensaje aparece al instante en el segundo browser

---

## 🆘 Solución de Problemas

### ❌ Error: "CORS blocked"

```
Access to XMLHttpRequest at 'https://...' blocked by CORS
```

**Solución**:
1. Verifica `app.use(cors({ origin: '*' }));` en `Backend/index.js`
2. Reinicia el deployment en Railway

### ❌ Error: "Cannot connect to database"

```
Error: connect ECONNREFUSED
```

**Solución**:
1. Verifica variables `MYSQLHOST`, `MYSQL_DATABASE`, etc. en Railway
2. Verifica que la base de datos está creada
3. Verifica credenciales

### ❌ Error: "Socket.io connection timeout"

```
WebSocket connection to 'wss://...' failed
```

**Solución**:
1. Verifica que Socket.io está habilitado en backend
2. Verifica CORS en `io` constructor
3. Abre DevTools → Network → WS para ver conexión

### ❌ Error: "GET / returns 404"

```
Cannot GET /
```

**Solución**:
1. Verifica que Frontend está en carpeta `public/`
2. Verifica que Express sirve archivos estáticos
3. Verifica que ruta wildcard redirige a `index.html`

---

## 📋 Checklist Final

Antes de hacer push a Railway, verifica:

- [ ] `environment.ts` tiene URL correcta de Railway
- [ ] `environment.prod.ts` tiene URL correcta de Railway
- [ ] `Backend/index.js` tiene `app.use(cors({ origin: '*' }))`
- [ ] `Backend/.env` o variables de Railway tienen `PORT=4000`
- [ ] Build local funciona: `ng build --configuration=production`
- [ ] No hay errores de compilación en Frontend
- [ ] Backend conecta a MySQL correctamente
- [ ] Socket.io está habilitado en Backend

---

## 🚀 Comandos Útiles

```bash
# Construir Frontend
ng build --configuration=production

# Servir localmente para probar
ng serve --port 4200

# Verificar que Backend está corriendo
curl http://localhost:4000/api/docs

# Ver logs en Railway
railway logs

# Reiniciar proyecto en Railway
railway restart
```

---

**¡Listo! Tu aplicación está completamente configurada para Railway.** 🎉

Cuando hayas desplegado exitosamente, comparte la URL pública y pruébala desde varios dispositivos para asegurar que todo funciona correctamente.
