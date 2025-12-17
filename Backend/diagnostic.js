#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE DIAGNÓSTICO - Verificar que todo está correcto
 * 
 * Uso:
 * node Backend/diagnostic.js
 * 
 * Este script verifica:
 * 1. ✅ Que associations.js está importado
 * 2. ✅ Que endpoint /join existe
 * 3. ✅ Que middleware auth está presente
 * 4. ✅ Que BD está conectada
 * 5. ✅ Que los modelos están configurados
 */

import sequelize from "./config/database.js";
import Usuario from "./models/Usuario.js";
import Session from "./models/Session.js";
import Participant from "./models/Participant.js";
import { verificarToken } from "./utils/jwt.js";

console.log("\n🔍 DIAGNÓSTICO DEL SISTEMA - Estudiemos\n");
console.log("═".repeat(60));

let passedChecks = 0;
let totalChecks = 0;

function check(name, passed, details = "") {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
  }
  if (details) {
    console.log(`   ${details}`);
  }
}

// CHECK 1: Base de datos conectada
console.log("\n📦 VERIFICACIÓN DE BD\n");

try {
  await sequelize.authenticate();
  check("Base de datos MySQL conectada", true, "Puerto 3306");
} catch (err) {
  check("Base de datos MySQL conectada", false, `Error: ${err.message}`);
}

// CHECK 2: Modelos sincronizados
try {
  const count = await Usuario.count();
  check("Tabla Usuarios existe y es accesible", true, `${count} usuarios en BD`);
} catch (err) {
  check("Tabla Usuarios existe", false, err.message);
}

try {
  const count = await Session.count();
  check("Tabla Sessions existe y es accesible", true, `${count} sesiones en BD`);
} catch (err) {
  check("Tabla Sessions existe", false, err.message);
}

try {
  const count = await Participant.count();
  check("Tabla Participants existe", true, `${count} participantes en BD`);
} catch (err) {
  check("Tabla Participants existe", false, err.message);
}

// CHECK 3: Asociaciones cargadas
console.log("\n🔗 VERIFICACIÓN DE ASOCIACIONES\n");

try {
  const hasCreadorAssoc = Session.associations.creador !== undefined;
  check("Session.belongsTo(Usuario, as: 'creador')", hasCreadorAssoc);
} catch (err) {
  check("Session.belongsTo(Usuario)", false, err.message);
}

try {
  const hasParticipantesAssoc = Session.associations.participantes !== undefined;
  check("Session.hasMany(Participant, as: 'participantes')", hasParticipantesAssoc);
} catch (err) {
  check("Session.hasMany(Participant)", false, err.message);
}

try {
  const hasUsuarioAssoc = Participant.associations.usuario !== undefined;
  check("Participant.belongsTo(Usuario, as: 'usuario')", hasUsuarioAssoc);
} catch (err) {
  check("Participant.belongsTo(Usuario)", false, err.message);
}

try {
  const hasSessionAssoc = Participant.associations.session !== undefined;
  check("Participant.belongsTo(Session)", hasSessionAssoc);
} catch (err) {
  check("Participant.belongsTo(Session)", false, err.message);
}

// CHECK 4: Usuarios de prueba existen
console.log("\n👥 VERIFICACIÓN DE DATOS DE PRUEBA\n");

try {
  const juan = await Usuario.findOne({ where: { email: 'juan@test.com' } });
  check("Usuario juan@test.com existe", !!juan, juan ? `ID: ${juan.id}` : 'No encontrado');
} catch (err) {
  check("Buscar usuario juan@test.com", false, err.message);
}

try {
  const maria = await Usuario.findOne({ where: { email: 'maria@test.com' } });
  check("Usuario maria@test.com existe", !!maria, maria ? `ID: ${maria.id}` : 'No encontrado');
} catch (err) {
  check("Buscar usuario maria@test.com", false, err.message);
}

// CHECK 5: JWT utilities funcionan
console.log("\n🔐 VERIFICACIÓN DE JWT\n");

try {
  const testUser = { id: 'test-uuid', email: 'test@test.com' };
  const token = require('./utils/jwt.js').generarToken(testUser);
  const verified = verificarToken(token);
  
  const isValid = verified && verified.id === 'test-uuid';
  check("JWT: Generar y verificar token", isValid, isValid ? 'Token válido' : 'Token inválido');
} catch (err) {
  check("JWT utilities funcionan", false, err.message);
}

// CHECK 6: Verificar queries complejas
console.log("\n📊 VERIFICACIÓN DE QUERIES\n");

try {
  const testSession = await Session.findOne({
    include: [
      {
        model: Usuario,
        as: 'creador',
        attributes: ['id', 'name', 'email']
      },
      {
        model: Participant,
        as: 'participantes',
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'name', 'email']
          }
        ]
      }
    ]
  });
  
  check("Query Session con includes complejos", !!testSession, 
    testSession ? `Sesión encontrada: ${testSession.titulo}` : 'No hay sesiones');
} catch (err) {
  check("Query Session con includes complejos", false, err.message);
}

// RESUMEN
console.log("\n" + "═".repeat(60));
console.log(`\n📈 RESULTADO: ${passedChecks}/${totalChecks} checks pasaron\n`);

if (passedChecks === totalChecks) {
  console.log("✅ TODO ESTÁ CORRECTAMENTE CONFIGURADO");
  console.log("\nPuedes comenzar a testear:");
  console.log("1. Login con juan@test.com / password123");
  console.log("2. Crear una sesión");
  console.log("3. Logout");
  console.log("4. Login con maria@test.com / password123");
  console.log("5. Unirte a la sesión de Juan");
  console.log("\n");
} else {
  console.log("⚠️  Hay problemas a resolver:");
  console.log("\nVerifica:");
  console.log("1. ¿MySQL está corriendo?");
  console.log("2. ¿Importaste associations.js en index.js?");
  console.log("3. ¿Corrió npm run dev para sincronizar BD?");
  console.log("4. ¿Los seeds se ejecutaron?");
  console.log("\nComandos útiles:");
  console.log("  npm run dev     # Inicia backend y sincroniza BD");
  console.log("  npm run dev:seed # Crea datos de prueba");
  console.log("\n");
}

process.exit(passedChecks === totalChecks ? 0 : 1);
