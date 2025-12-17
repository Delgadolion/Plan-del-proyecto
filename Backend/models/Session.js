import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

const Session = sequelize.define("Session", {
  id: {
    type: DataTypes.STRING(36),
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('focus', 'group', 'tutorial'),
    defaultValue: 'focus'
  },
  duracion: {
    type: DataTypes.INTEGER, // en minutos
    allowNull: false,
    validate: {
      min: 15,
      max: 480
    }
  },
  maxParticipantes: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: {
      min: 1,
      max: 100
    }
  },
  estado: {
    type: DataTypes.ENUM('planificado', 'en-curso', 'finalizado'),
    defaultValue: 'en-curso'
  },
  tema: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pomodoroTime: {
    type: DataTypes.INTEGER,
    columnName: 'pomodoroTime',
    defaultValue: 25,
    validate: {
      min: 5,
      max: 120
    }
  },
  breakTime: {
    type: DataTypes.INTEGER,
    columnName: 'breakTime',
    defaultValue: 5,
    validate: {
      min: 1,
      max: 60
    }
  },
  numPomodoros: {
    type: DataTypes.INTEGER,
    columnName: 'numPomodoros',
    defaultValue: 4,
    validate: {
      min: 1,
      max: 12
    }
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    columnName: 'isPrivate',
    defaultValue: false
  },
  accessCode: {
    type: DataTypes.STRING(6),
    columnName: 'accessCode',
    allowNull: true
  },
  enableChat: {
    type: DataTypes.BOOLEAN,
    columnName: 'enableChat',
    defaultValue: true
  },
  allowLateJoin: {
    type: DataTypes.BOOLEAN,
    columnName: 'allowLateJoin',
    defaultValue: true
  },
  notifications: {
    type: DataTypes.BOOLEAN,
    columnName: 'notifications',
    defaultValue: true
  },
  fechaInicio: {
    type: DataTypes.DATE,
    columnName: 'fechaInicio',
    allowNull: true
  },
  fechaFin: {
    type: DataTypes.DATE,
    columnName: 'fechaFin',
    allowNull: true
  },
  creadorId: {
    type: DataTypes.STRING(36),
    columnName: 'creadorId',
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

export default Session;
