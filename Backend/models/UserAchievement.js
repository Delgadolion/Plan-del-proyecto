import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

const UserAchievement = sequelize.define("UserAchievement", {
  id: {
    type: DataTypes.STRING(36),
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  usuarioId: {
    type: DataTypes.STRING(36),
    allowNull: false
  },
  achievementId: {
    type: DataTypes.STRING(36),
    allowNull: false
  },
  unlockedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  uniqueKeys: {
    unique_user_achievement: {
      fields: ['usuarioId', 'achievementId']
    }
  }
});

export default UserAchievement;
