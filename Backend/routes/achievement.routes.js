import express from "express";
import * as achievementController from "../controllers/achievement.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Rutas específicas PRIMERO (más específicas antes que las genéricas)
router.get("/usuario/mis-achievements", auth, achievementController.obtenerMisAchievements);

// Rutas públicas
router.get("/", achievementController.obtenerAchievements);

// Rutas protegidas
router.post("/:achievementId", auth, achievementController.desbloquearAchievement);
router.delete("/:achievementId", auth, achievementController.eliminarAchievement);

export default router;
