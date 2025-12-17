// test.js
import dotenv from 'dotenv';
import sequelize from './config/database.js';

dotenv.config();

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    process.exit(1);
  }
})();
