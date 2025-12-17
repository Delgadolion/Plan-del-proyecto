import Usuario from "../models/Usuario.js";
import UserAchievement from "../models/UserAchievement.js";
import Participant from "../models/Participant.js";
import { Op } from "sequelize";

// GET - Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });

    res.json({ usuarios });

  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// GET - Obtener un usuario por ID
export const obtenerUsuarioId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserAchievement,
          as: 'achievements',
          attributes: ['id', 'desbloqueoFecha']
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ usuario });

  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// GET - Mi perfil
export const obtenerMiPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ usuario });

  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error al obtener tu perfil" });
  }
};

// PUT - Actualizar perfil del usuario
export const actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { name, email } = req.body;

    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si el email ya existe
    if (email && email !== usuario.email) {
      const emailExiste = await Usuario.findOne({ where: { email } });
      if (emailExiste) {
        return res.status(400).json({ error: "Email ya está en uso" });
      }
    }

    // Actualizar
    if (name) usuario.name = name;
    if (email) usuario.email = email;

    await usuario.save();

    const usuarioActualizado = await Usuario.findByPk(usuarioId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: "Perfil actualizado exitosamente",
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};

// GET - Estadísticas del usuario
export const obtenerEstadisticas = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // Contar sesiones creadas
    const sesionesCreadas = await Participant.count({
      distinct: true,
      col: 'sessionId',
      include: [{
        association: 'Session',
        required: true,
        where: { creadorId: usuarioId }
      }]
    });

    // Contar sesiones a las que se unió
    const sesionesUnidas = await Participant.count({
      where: { usuarioId }
    });

    // Contar achievements
    const achievementsDesbloqueados = await UserAchievement.count({
      where: { usuarioId }
    });

    // Calcular tiempo total de estudio
    const tiempoTotal = await Participant.sum('tiempoEstudio', {
      where: { usuarioId }
    });

    res.json({
      estadisticas: {
        sesionesCreadas: sesionesCreadas || 0,
        sesionesUnidas: sesionesUnidas || 0,
        achievementsDesbloqueados: achievementsDesbloqueados || 0,
        tiempoTotalEstudio: tiempoTotal || 0 // en minutos
      }
    });

  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

// DELETE - Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioActual = req.user.id;

    // No permitir eliminar otro usuario
    if (id !== usuarioActual) {
      return res.status(403).json({ error: "Solo puedes eliminar tu propia cuenta" });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await usuario.destroy();

    res.json({ message: "Cuenta eliminada exitosamente" });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
