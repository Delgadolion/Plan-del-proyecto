import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import Usuario from "../models/Usuario.js";

// GET - Obtener todos los achievements
export const obtenerAchievements = async (req, res) => {
  try {
    const { category } = req.query;
    let where = {};

    if (category) where.category = category;

    const achievements = await Achievement.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({ achievements });

  } catch (error) {
    console.error("Error al obtener achievements:", error);
    res.status(500).json({ error: "Error al obtener achievements" });
  }
};

// GET - Obtener achievements del usuario
export const obtenerMisAchievements = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const userAchievements = await UserAchievement.findAll({
      where: { usuarioId },
      include: [
        { model: Achievement }
      ],
      order: [['unlockedDate', 'DESC']]
    });

    res.json({ achievements: userAchievements });

  } catch (error) {
    console.error("Error al obtener mis achievements:", error);
    res.status(500).json({ error: "Error al obtener tus achievements" });
  }
};

// POST - Desbloquear achievement
export const desbloquearAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const usuarioId = req.user.id;

    const achievement = await Achievement.findByPk(achievementId);

    if (!achievement) {
      return res.status(404).json({ error: "Achievement no encontrado" });
    }

    // Verificar si ya lo tiene
    const yaDesbloqueo = await UserAchievement.findOne({
      where: { usuarioId, achievementId }
    });

    if (yaDesbloqueo) {
      return res.status(400).json({ error: "Ya desbloquease este achievement" });
    }

    // Crear nuevo
    const userAchievement = await UserAchievement.create({
      usuarioId,
      achievementId
    });

    const resultado = await UserAchievement.findByPk(userAchievement.id, {
      include: [{ model: Achievement }]
    });

    res.status(201).json({
      message: "Achievement desbloqueado",
      achievement: resultado
    });

  } catch (error) {
    console.error("Error al desbloquear achievement:", error);
    res.status(500).json({ error: "Error al desbloquear achievement" });
  }
};

// DELETE - Eliminar achievement del usuario
export const eliminarAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const usuarioId = req.user.id;

    const userAchievement = await UserAchievement.findOne({
      where: { usuarioId, achievementId }
    });

    if (!userAchievement) {
      return res.status(404).json({ error: "Achievement no encontrado" });
    }

    await userAchievement.destroy();

    res.json({ message: "Achievement eliminado" });

  } catch (error) {
    console.error("Error al eliminar achievement:", error);
    res.status(500).json({ error: "Error al eliminar achievement" });
  }
};
