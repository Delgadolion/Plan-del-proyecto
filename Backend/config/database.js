import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Detectar si estamos en producción (Railway) o desarrollo
const isProduction = process.env.NODE_ENV === 'production' || process.env.MYSQLHOST;

// Railway usa: MYSQLUSER, MYSQL_ROOT_PASSWORD, MYSQLHOST, MYSQLPORT, MYSQL_DATABASE
// Local usa: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME
const sequelize = new Sequelize(
  isProduction ? process.env.MYSQL_DATABASE : process.env.DB_NAME,
  isProduction ? (process.env.MYSQLUSER || 'root') : process.env.DB_USER,
  isProduction ? (process.env.MYSQL_ROOT_PASSWORD || process.env.MYSQLPASSWORD) : process.env.DB_PASSWORD,
  {
    host: isProduction ? process.env.MYSQLHOST : process.env.DB_HOST,
    port: isProduction ? (process.env.MYSQLPORT || 3306) : process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: isProduction ? {
      connectTimeout: 60000
    } : {},
    // Railway MySQL interno no necesita SSL
    // ssl: false
  }
);

export default sequelize;