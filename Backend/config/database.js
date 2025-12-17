import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Detectar si estamos en producción (Railway) o desarrollo
const isProduction = process.env.NODE_ENV === 'production' || process.env.MYSQLHOST;

// En Railway, las variables son: MYSQLHOST, MYSQLPORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD
// En desarrollo local, usamos: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
const sequelize = new Sequelize(
  isProduction ? process.env.MYSQL_DATABASE : process.env.DB_NAME,
  isProduction ? process.env.MYSQL_USER : process.env.DB_USER,
  isProduction ? process.env.MYSQL_PASSWORD : process.env.DB_PASSWORD,
  {
    host: isProduction ? process.env.MYSQLHOST : process.env.DB_HOST,
    port: isProduction ? process.env.MYSQLPORT : process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

export default sequelize;
