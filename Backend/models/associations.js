// ======================================
// ASOCIACIONES DE MODELOS
// ======================================
import Usuario from "./Usuario.js";
import Session from "./Session.js";
import Participant from "./Participant.js";
import Achievement from "./Achievement.js";
import UserAchievement from "./UserAchievement.js";

// Session - Usuario (creador)
Session.belongsTo(Usuario, { 
  foreignKey: 'creadorId', 
  as: 'creador' 
});

// Participant - Session
Participant.belongsTo(Session, { 
  foreignKey: 'sessionId',
  as: 'session'
});
Session.hasMany(Participant, { 
  foreignKey: 'sessionId', 
  as: 'participantes' 
});

// Participant - Usuario
Participant.belongsTo(Usuario, { 
  foreignKey: 'usuarioId', 
  as: 'usuario' 
});
Usuario.hasMany(Participant, { 
  foreignKey: 'usuarioId' 
});

// UserAchievement - Usuario
UserAchievement.belongsTo(Usuario, { 
  foreignKey: 'usuarioId',
  as: 'usuario'
});
Usuario.hasMany(UserAchievement, { 
  foreignKey: 'usuarioId' 
});

// UserAchievement - Achievement
UserAchievement.belongsTo(Achievement, { 
  foreignKey: 'achievementId',
  as: 'achievement'
});
Achievement.hasMany(UserAchievement, { 
  foreignKey: 'achievementId' 
});

export {
  Usuario,
  Session,
  Participant,
  Achievement,
  UserAchievement
};
