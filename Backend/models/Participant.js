import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

const Participant = sequelize.define("Participant", {
  id: {
    type: DataTypes.STRING(36),
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.STRING(36),
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.STRING(36),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'finalizado'),
    defaultValue: 'activo'
  },
  tiempoEstudio: {
    type: DataTypes.INTEGER, // en minutos
    defaultValue: 0
  }
}, {
  timestamps: true,
  uniqueKeys: {
    unique_participant: {
      fields: ['sessionId', 'usuarioId']
    }
  }
});

export default Participant;
