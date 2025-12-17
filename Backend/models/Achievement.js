import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { v4 as uuidv4 } from "uuid";
import Usuario from "./Usuario.js";

const Achievement = sequelize.define("Achievement", {
  id: {
    type: DataTypes.STRING(36),
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('study', 'social', 'consistency', 'achievement'),
    defaultValue: 'study'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  timestamps: true
});

export default Achievement;
