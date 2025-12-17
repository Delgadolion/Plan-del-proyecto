import Session from "../models/Session.js";
import Participant from "../models/Participant.js";
import Usuario from "../models/Usuario.js";
import { Op } from "sequelize";

// CREATE - Crear nueva sesión
export const crearSession = async (req, res) => {
  try {
    console.log('\n📝 CREATE SESIÓN REQUEST');
    console.log('   User ID:', req.user?.id);
    console.log('   User Email:', req.user?.email);
    console.log('   Body recibido:', JSON.stringify(req.body, null, 2));
    
    const { titulo, descripcion, categoria, pomodoroTime, breakTime, numPomodoros, maxParticipantes, isPrivate, enableChat, allowLateJoin, notifications } = req.body;
    const creadorId = req.user.id; // Del middleware de auth

    // Validar campos requeridos
    if (!titulo || titulo.trim() === '') {
      console.log('❌ Validación: Título vacío');
      return res.status(400).json({ error: "Título es requerido" });
    }

    console.log('✅ Validaciones pasadas');

    // Convertir y validar números
    const pomodoroTimeNum = Math.max(5, Math.min(120, parseInt(pomodoroTime) || 25));
    const breakTimeNum = Math.max(1, Math.min(60, parseInt(breakTime) || 5));
    const numPomodorosNum = Math.max(1, Math.min(12, parseInt(numPomodoros) || 4));
    const maxParticipantesNum = parseInt(maxParticipantes) || 5;

    // Calcular duración total en minutos
    const totalMinutes = (numPomodorosNum * pomodoroTimeNum) + ((numPomodorosNum - 1) * breakTimeNum);

    // Generar código de acceso si es privada
    let accessCode = null;
    if (isPrivate) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      for (let i = 0; i < 6; i++) {
        accessCode = (accessCode || '') + characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }

    // Crear sesión
    const session = await Session.create({
      titulo: titulo.trim(),
      descripcion: descripcion || '',
      tema: categoria || 'otro',
      duracion: totalMinutes,
      pomodoroTime: pomodoroTimeNum,
      breakTime: breakTimeNum,
      numPomodoros: numPomodorosNum,
      maxParticipantes: maxParticipantesNum,
      isPrivate: isPrivate === true ? true : false,  // Explícitamente false si no es true
      accessCode,
      enableChat: enableChat !== false,
      allowLateJoin: allowLateJoin !== false,
      notifications: notifications !== false,
      creadorId
    });

    console.log('✅ Sesión creada en BD (ID:', session.id + ')');

    // Agregar creador como participante automáticamente
    try {
      const participantCreated = await Participant.create({
        sessionId: session.id,
        usuarioId: creadorId,
        estado: 'activo'
      });
      console.log('✅ Creador agregado como participante (participación ID:', participantCreated.id + ')');
    } catch (participantError) {
      console.error("⚠️ Error al agregar creador como participante:", participantError.message);
      // Continuar aunque falle
    }

    // Recargar la sesión con todas las asociaciones
    const sessionWithAssociations = await Session.findByPk(session.id, {
      include: [
        { model: Usuario, as: 'creador', attributes: ['id', 'name', 'email'] },
        {
          model: Participant,
          as: 'participantes',
          attributes: ['id', 'usuarioId', 'estado'],
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    // Devolver sesión con asociaciones
    console.log('✅ Sesión creada exitosamente');
    console.log('   ID:', session.id);
    console.log('   Título:', session.titulo);
    console.log('   Creador:', creadorId);
    console.log('   Participantes totales:', sessionWithAssociations.participantes?.length || 0);
    
    res.status(201).json({
      message: "Sesión creada exitosamente",
      session: sessionWithAssociations
    });

  } catch (error) {
    console.error("❌ Error al crear sesión:", error.message);
    console.error("Stack:", error.stack);
    
    // Validación de campos
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      return res.status(400).json({ error: "Datos inválidos: " + messages });
    }
    
    // Error de tipo de dato
    if (error.name === 'SequelizeTypeError') {
      return res.status(400).json({ error: "Tipo de dato inválido en los campos" });
    }
    
    // Error genérico
    res.status(500).json({ error: "Error al crear sesión: " + error.message });
  }
};

// READ ALL - Obtener todas las sesiones
export const obtenerSessions = async (req, res) => {
  try {
    const { estado, tipo, includePrivate } = req.query;
    let where = { activo: true };

    // Por defecto, no mostrar sesiones privadas (a menos que includePrivate=true)
    if (includePrivate !== 'true') {
      where.isPrivate = { [Op.eq]: false };  // Usar Op.eq para sesiones públicas
    }

    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;

    console.log('🔍 Consultando sesiones con filtro:', JSON.stringify(where), 'includePrivate:', includePrivate);

    const sessions = await Session.findAll({
      where,
      include: [
        { model: Usuario, as: 'creador', attributes: ['id', 'name', 'email'] },
        {
          model: Participant,
          as: 'participantes',
          attributes: ['id', 'usuarioId', 'estado'],
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Devolviendo ${sessions.length} sesiones`);
    sessions.forEach(s => {
      console.log(`   - Sesión: "${s.titulo}" | isPrivate: ${s.isPrivate} | Creador: ${s.creador?.name}`);
    });
    res.json({ sessions });

  } catch (error) {
    console.error("❌ Error al obtener sesiones:", error.message);
    res.status(500).json({ error: "Error al obtener sesiones: " + error.message });
  }
};

// READ ONE - Obtener una sesión por ID
export const obtenerSessionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findByPk(id, {
      include: [
        { model: Usuario, as: 'creador', attributes: ['id', 'name', 'email'] },
        {
          model: Participant,
          as: 'participantes',
          attributes: ['id', 'usuarioId', 'estado', 'tiempoEstudio'],
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    res.json({ session });

  } catch (error) {
    console.error("Error al obtener sesión:", error);
    res.status(500).json({ error: "Error al obtener sesión" });
  }
};

// UPDATE - Actualizar sesión
export const actualizarSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, tipo, duracion, maxParticipantes, tema, estado } = req.body;
    const usuarioId = req.user.id;

    const session = await Session.findByPk(id);

    if (!session) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    // Validar que sea el creador
    if (session.creadorId !== usuarioId) {
      return res.status(403).json({ error: "No autorizado para actualizar esta sesión" });
    }

    // Actualizar solo los campos permitidos
    if (titulo) session.titulo = titulo;
    if (descripcion) session.descripcion = descripcion;
    if (tipo) session.tipo = tipo;
    if (duracion) session.duracion = duracion;
    if (maxParticipantes) session.maxParticipantes = maxParticipantes;
    if (tema) session.tema = tema;
    if (estado) session.estado = estado;

    await session.save();

    const sessionActualizada = await Session.findByPk(id, {
      include: [
        { model: Usuario, as: 'creador', attributes: ['id', 'name', 'email'] },
        {
          model: Participant,
          as: 'participantes',
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    res.json({
      message: "Sesión actualizada exitosamente",
      session: sessionActualizada
    });

  } catch (error) {
    console.error("Error al actualizar sesión:", error);
    res.status(500).json({ error: "Error al actualizar sesión" });
  }
};

// DELETE - Eliminar sesión
export const eliminarSession = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const session = await Session.findByPk(id);

    if (!session) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    // Validar que sea el creador
    if (session.creadorId !== usuarioId) {
      return res.status(403).json({ error: "No autorizado para eliminar esta sesión" });
    }

    // Eliminar participantes asociados
    await Participant.destroy({ where: { sessionId: id } });

    // Eliminar sesión
    await session.destroy();

    res.json({ message: "Sesión eliminada exitosamente" });

  } catch (error) {
    console.error("Error al eliminar sesión:", error);
    res.status(500).json({ error: "Error al eliminar sesión" });
  }
};

// JOIN - Unirse a una sesión
export const unirseSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    console.log(`\n🤝 JOIN SESIÓN REQUEST`);
    console.log(`   Sesión ID: ${id}`);
    console.log(`   Usuario ID: ${usuarioId}`);
    console.log(`   User object from token: ${JSON.stringify(req.user)}`);

    // VALIDACIÓN 1: Sesión existe
    const session = await Session.findByPk(id);
    if (!session) {
      console.log(`❌ Sesión ${id} no encontrada en BD`);
      return res.status(404).json({ error: "Sesión no encontrada" });
    }
    console.log(`✅ Sesión encontrada: "${session.titulo}" (creador: ${session.creadorId})`);

    // VALIDACIÓN 2: Usuario no es ya participante
    console.log(`🔍 Buscando si ya es participante...`);
    const yaParticipa = await Participant.findOne({
      where: { sessionId: id, usuarioId }
    });
    if (yaParticipa) {
      console.log(`⚠️ Usuario ${usuarioId} ya es participante (participación ID: ${yaParticipa.id})`);
      return res.status(400).json({ error: "Ya eres participante de esta sesión" });
    }
    console.log(`✅ Usuario no es aún participante`);

    // VALIDACIÓN 3: Límite de participantes
    const countParticipantes = await Participant.count({ where: { sessionId: id } });
    console.log(`👥 Sesión tiene ${countParticipantes} participantes (máximo: ${session.maxParticipantes})`);
    if (countParticipantes >= session.maxParticipantes) {
      console.log(`❌ Sesión ${id} está llena`);
      return res.status(400).json({ error: "Sesión llena" });
    }
    console.log(`✅ Hay espacio disponible`);

    // CREACIÓN: Agregar participante
    console.log(`📝 Creando participante...`);
    let participantCreated;
    try {
      participantCreated = await Participant.create({
        sessionId: id,
        usuarioId,
        estado: 'activo'
      });
      console.log(`✅ Participante creado exitosamente (ID: ${participantCreated.id})`);
    } catch (createError) {
      console.error(`❌ Error creando participante:`, createError.message);
      if (createError.name === 'SequelizeUniqueConstraintError') {
        console.error(`   Causa: Constraint único violado (usuario ya tiene participación)`);
        return res.status(400).json({ error: "Ya eres participante de esta sesión" });
      }
      throw createError;
    }

    // RETORNA: Sesión actualizada con todos los participantes
    console.log(`🔄 Recargando sesión con participantes...`);
    const sessionActualizada = await Session.findByPk(id, {
      include: [
        { model: Usuario, as: 'creador', attributes: ['id', 'name', 'email'] },
        {
          model: Participant,
          as: 'participantes',
          attributes: ['id', 'usuarioId', 'estado'],
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    if (!sessionActualizada) {
      console.error(`❌ No se pudo recargar la sesión después de crear participante`);
      return res.status(500).json({ error: "Error al recargar sesión" });
    }

    console.log(`✅ Usuario ${usuarioId} se unió a sesión ${id}`);
    console.log(`   Total participantes ahora: ${sessionActualizada.participantes?.length || 0}`);
    sessionActualizada.participantes?.forEach(p => {
      console.log(`     - ${p.usuario?.name} (${p.usuario?.email})`);
    });

    res.status(200).json({
      message: "Te uniste a la sesión exitosamente",
      session: sessionActualizada
    });

  } catch (error) {
    console.error("❌ Error al unirse a sesión:", error.message);
    console.error("    Error name:", error.name);
    console.error("    Full error:", JSON.stringify(error, null, 2));
    
    // Tipos específicos de errores
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: "Validación fallida: " + error.errors.map(e => e.message).join(', ') 
      });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: "Ya eres participante de esta sesión" 
      });
    }
    
    res.status(500).json({ error: "Error al unirse a sesión: " + error.message });
  }
};

// LEAVE - Abandonar una sesión
export const abandonarSession = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const session = await Session.findByPk(id);

    if (!session) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    const participant = await Participant.findOne({
      where: { sessionId: id, usuarioId }
    });

    if (!participant) {
      return res.status(400).json({ error: "No eres participante de esta sesión" });
    }

    await participant.destroy();

    res.json({ message: "Abandonaste la sesión" });

  } catch (error) {
    console.error("Error al abandonar sesión:", error);
    res.status(500).json({ error: "Error al abandonar sesión" });
  }
};

// GET SESSIONS DEL USUARIO
export const obtenerMisSessions = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    console.log('\n📋 GET MIS SESIONES REQUEST');
    console.log('   Usuario ID:', usuarioId);

    // Obtener todas las sesiones donde el usuario es participante
    const participaciones = await Participant.findAll({
      where: { usuarioId },
      attributes: ['sessionId', 'estado']
    });

    const sessionIds = participaciones.map(p => p.sessionId);
    console.log(`   Participaciones encontradas: ${participaciones.length}`);

    // Si no hay sesiones, retornar array vacío
    if (sessionIds.length === 0) {
      console.log('ℹ️ Usuario no participa en ninguna sesión');
      return res.json({ sessions: [] });
    }

    // Obtener las sesiones con asociaciones completas
    const sessions = await Session.findAll({
      where: {
        id: sessionIds
      },
      include: [
        { model: Usuario, as: 'creador', attributes: ['id', 'name', 'email'] },
        {
          model: Participant,
          as: 'participantes',
          attributes: ['id', 'usuarioId', 'estado'],
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ ${sessions.length} sesiones encontradas`);
    sessions.forEach(s => {
      console.log(`   - "${s.titulo}" (${s.participantes?.length || 0} participantes)`);
    });

    res.json({ sessions });

  } catch (error) {
    console.error("❌ Error al obtener mis sesiones:", error.message);
    res.status(500).json({ error: "Error al obtener tus sesiones: " + error.message });
  }
};
