// ======================================
// IMPORTS
// ======================================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { createServer } from "http";
import { Server } from "socket.io";

import sequelize from "./config/database.js";

// Importar modelos
import Usuario from "./models/Usuario.js";
import Session from "./models/Session.js";
import Participant from "./models/Participant.js";
import Achievement from "./models/Achievement.js";
import UserAchievement from "./models/UserAchievement.js";

// Importar asociaciones (relaciones entre modelos)
import "./models/associations.js";

// Importar seeds
import { seedAchievements } from "./seeds/achievement.seed.js";
import { seedUsers } from "./seeds/user.seed.js";

// Importar utilidades
import { generarToken } from "./utils/jwt.js";

// Importar rutas
import sessionRoutes from "./routes/session.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

// ======================================
// APP SETUP
// ======================================
const app = express();

// CORS Configuration - Permitir TODOS los orígenes por ahora (desarrollo/producción)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: false,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json());

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  },
  credentials: false
});
// ======================================
// INICIALIZAR BASE DE DATOS
// ======================================
async function initDB() {
  try {
    // Las asociaciones se cargan desde associations.js (ya importado arriba)

    await sequelize.authenticate();
    console.log("✅ Conectado a MySQL");

    // Disable foreign key checks to allow table recreation
    await sequelize.query("SET FOREIGN_KEY_CHECKS=0");
    
    // Sync WITHOUT ALTER to avoid deadlocks
    await sequelize.sync({ alter: false });
    
    // Re-enable foreign key checks
    await sequelize.query("SET FOREIGN_KEY_CHECKS=1");
    console.log("📦 Modelos sincronizados");

    // Ejecutar seeds
    await seedAchievements();
    await seedUsers();
  } catch (err) {
    console.error("❌ Error al conectar a MySQL:", err);
    throw err;
  }
}

// Manejo de eventos de sala, chat y timer
io.on("connection", (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  // Unirse a una sala
  socket.on("joinRoom", (roomId, user) => {
    socket.join(roomId);
    console.log(`🚪 Usuario ${user?.name || 'anónimo'} se unió a sala ${roomId}`);
    socket.to(roomId).emit("userJoined", user);
  });

  // Mensaje de chat
  socket.on("chatMessage", (roomId, message) => {
    console.log(`💬 Mensaje en sala ${roomId}:`, message?.text);
    io.to(roomId).emit("chatMessage", message);
  });

  // Sincronizar timer
  socket.on("timerUpdate", (roomId, timerState) => {
    socket.to(roomId).emit("timerUpdate", timerState);
  });

  // Salir de la sala
  socket.on("leaveRoom", (roomId, user) => {
    socket.leave(roomId);
    console.log(`👋 Usuario ${user?.name || 'anónimo'} salió de sala ${roomId}`);
    socket.to(roomId).emit("userLeft", user);
  });

  // Desconexión
  socket.on("disconnect", () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// ======================================
// CONFIGURACIÓN DE CORREO
// ======================================
async function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Para pruebas (Ethereal)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

// ======================================
// RUTA: REGISTRO
// ======================================
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await Usuario.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const token = uuidv4();

    await Usuario.create({
      id,
      email,
      password: hashed,
      name,
      verification_token: token
    });

    const transporter = await createTransporter();
    const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:4200"}/verify?token=${token}&id=${id}`;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@estudiemos.local",
      to: email,
      subject: "Verifica tu cuenta Estudiemos",
      html: `<p>Sigue el enlace para verificar tu cuenta:
             <a href="${verifyUrl}">${verifyUrl}</a></p>`
    });

    res.json({ success: true, previewUrl: nodemailer.getTestMessageUrl(info) });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================
// RUTA: VERIFICAR EMAIL
// ======================================
app.get("/api/verify", async (req, res) => {
  try {
    const { token, id } = req.query;

    if (!token || !id) {
      return res.status(400).json({ error: "Missing token or id" });
    }

    const user = await Usuario.findOne({
      where: { id, verification_token: token }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }

    await Usuario.update(
      { verified: true, verification_token: null },
      { where: { id } }
    );

    res.json({ success: true });

  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================
// RUTA: LOGIN
// ======================================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Intento de login con email:', email);

    if (!email || !password) {
      console.log('❌ Campos faltantes');
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await Usuario.findOne({ where: { email } });
    console.log('👤 Usuario encontrado:', user ? `${user.id} - ${user.email}` : 'No');

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.verified) {
      console.log('❌ Email no verificado');
      return res.status(403).json({ error: "Email not verified" });
    }

    const token = generarToken(user);
    console.log('✅ Token generado para usuario:', user.id);
    console.log('📋 Token payload:', { id: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================
// RUTA PRINCIPAL
// ======================================
app.get("/", (req, res) => {
  res.json({ message: "API Estudiemos funcionando 🚀" });
});

// ======================================
// REGISTRAR RUTAS
// ======================================
try {
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes cargadas");
  
  app.use("/api/sessions", sessionRoutes);
  console.log("✅ Session routes cargadas");
  
  app.use("/api/achievements", achievementRoutes);
  console.log("✅ Achievement routes cargadas");
  
  app.use("/api/usuarios", userRoutes);
  console.log("✅ User routes cargadas");
} catch (err) {
  console.error("❌ Error cargando rutas:", err);
  throw err;
}

// ======================================
// SERVIR FRONTEND ESTÁTICO (Vercel o Vercel preview)
// ======================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Servir archivos estáticos del frontend (si existen)
app.use(express.static(path.join(__dirname, 'public')));

// Manejo de rutas no encontradas - Redirigir a index.html para SPA (Angular)
app.use((req, res) => {
  // Si la ruta no empieza con /api, asumir que es una ruta Angular y servir index.html
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
      if (err) {
        // Si no existe index.html, responder con error de API
        res.status(404).json({ error: "Ruta no encontrada" });
      }
    });
  } else {
    res.status(404).json({ error: "Ruta no encontrada" });
  }
});

// ======================================
// INICIAR SERVIDOR
// ======================================
async function startServer() {
  try {
    await initDB();
    
    httpServer.listen(PORT, () => {
      console.log(`🔥 API corriendo en http://localhost:${PORT}`);
      console.log(`🔌 Socket.io activo en ws://localhost:${PORT}`);
      console.log(`📝 Documentación: http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error("❌ Failed to start API:", err.message);
    process.exit(1);
  }
}

startServer();
