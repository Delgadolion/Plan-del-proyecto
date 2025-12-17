import express from "express";
import * as sessionController from "../controllers/session.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Rutas específicas PRIMERO (más específicas antes que las genéricas)
router.get("/usuario/mis-sesiones", auth, sessionController.obtenerMisSessions);

// Rutas públicas
router.get("/", sessionController.obtenerSessions);
router.get("/:id", sessionController.obtenerSessionPorId);

// Rutas protegidas (requieren autenticación)
router.post("/", auth, sessionController.crearSession);
router.put("/:id", auth, sessionController.actualizarSession);
router.delete("/:id", auth, sessionController.eliminarSession);
router.post("/:id/join", auth, sessionController.unirseSesion);
router.post("/:id/leave", auth, sessionController.abandonarSession);

export default router;
