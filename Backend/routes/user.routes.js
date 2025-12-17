import express from "express";
import * as userController from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Rutas específicas PRIMERO (más específicas antes que las genéricas)
router.get("/perfil/mi-perfil", auth, userController.obtenerMiPerfil);
router.put("/perfil/actualizar", auth, userController.actualizarPerfil);
router.get("/estadisticas/mis-estadisticas", auth, userController.obtenerEstadisticas);

// Rutas públicas
router.get("/", userController.obtenerUsuarios);
router.get("/:id", userController.obtenerUsuarioId);

// Rutas protegidas
router.delete("/:id", auth, userController.eliminarUsuario);

export default router;
