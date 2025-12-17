#!/usr/bin/env node

/**
 * 🧪 TEST INTERACTIVO - Verificar flujo completo
 * 
 * Este script te guía a través de cada paso para unirte a una sesión.
 * Úsalo para ver exactamente dónde falla el proceso.
 * 
 * Uso:
 * node Backend/test-join.js
 */

import sequelize from "./config/database.js";
import Usuario from "./models/Usuario.js";
import Session from "./models/Session.js";
import Participant from "./models/Participant.js";
import "./models/associations.js";
import { generarToken, verificarToken } from "./utils/jwt.js";
import { v4 as uuidv4 } from "uuid";

console.log("\n" + "═".repeat(70));
console.log("🧪 TEST INTERACTIVO: Flujo de Unirse a Sesión");
console.log("═".repeat(70) + "\n");

let testsPassed = 0;
let testsFailed = 0;

function logTest(step, passed, message) {
  if (passed) {
    console.log(`✅ [${step}] ${message}`);
    testsPassed++;
  } else {
    console.log(`❌ [${step}] ${message}`);
    testsFailed++;
  }
}

try {
  // PASO 1: Conectar BD
  console.log("📋 PASO 1: Conectar a Base de Datos\n");
  await sequelize.authenticate();
  logTest("BD", true, "Conectado a MySQL");

  // PASO 2: Verificar usuarios existen
  console.log("\n📋 PASO 2: Verificar Usuarios de Prueba\n");
  
  const juan = await Usuario.findOne({ where: { email: 'juan@test.com' } });
  logTest("Usuario Juan", !!juan, juan ? `Found: ${juan.name} (${juan.id})` : "NOT FOUND");

  const maria = await Usuario.findOne({ where: { email: 'maria@test.com' } });
  logTest("Usuario María", !!maria, maria ? `Found: ${maria.name} (${maria.id})` : "NOT FOUND");

  if (!juan || !maria) {
    console.log("\n⚠️  Los usuarios de prueba no existen. Ejecuta:");
    console.log("   npm run dev:seed\n");
    process.exit(1);
  }

  // PASO 3: Obtener o crear sesión
  console.log("\n📋 PASO 3: Obtener o Crear Sesión de Prueba\n");
  
  let testSession = await Session.findOne({ 
    where: { creadorId: juan.id },
    include: [
      { model: Usuario, as: 'creador' },
      { model: Participant, as: 'participantes' }
    ]
  });

  if (!testSession) {
    console.log("   No hay sesión de Juan. Creando una...");
    testSession = await Session.create({
      id: uuidv4(),
      titulo: 'Test - Sesión de Prueba',
      descripcion: 'Sesión creada para testing del join',
      creadorId: juan.id,
      pomodoroTime: 25,
      breakTime: 5,
      numPomodoros: 4,
      maxParticipantes: 10,
      isPrivate: false
    });
    console.log(`   ✓ Sesión creada: ${testSession.id}`);
    
    // Agregar a Juan como primer participante
    await Participant.create({
      sessionId: testSession.id,
      usuarioId: juan.id,
      estado: 'activo'
    });
    console.log(`   ✓ Juan agregado como participante`);
  }

  logTest("Sesión", true, `Found: ${testSession.titulo} (${testSession.id})`);

  // PASO 4: Verificar participantes actuales
  console.log("\n📋 PASO 4: Verificar Participantes Actuales\n");
  
  const participants = await Participant.findAll({
    where: { sessionId: testSession.id },
    include: [{ model: Usuario, as: 'usuario' }]
  });

  console.log(`   Total participantes: ${participants.length}`);
  participants.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.usuario.name} (${p.usuario.email})`);
  });

  const mariaIsParticipant = participants.some(p => p.usuarioId === maria.id);
  logTest("María participa", !mariaIsParticipant, mariaIsParticipant ? 
    "Ya está en la sesión" : "Todavía no está (esto es correcto)");

  // PASO 5: Simular autenticación de María
  console.log("\n📋 PASO 5: Simular Autenticación de María\n");
  
  const mariaToken = generarToken({ id: maria.id, email: maria.email });
  const mariaVerified = verificarToken(mariaToken);
  
  logTest("JWT María", mariaVerified.id === maria.id, `Token válido para ${maria.email}`);

  // PASO 6: Simular el request JOIN (sin HTTP)
  console.log("\n📋 PASO 6: Simular Request JOIN\n");

  console.log(`   Sesión: ${testSession.titulo}`);
  console.log(`   Usuario: ${maria.name}`);
  console.log(`   Participantes actuales: ${participants.length}\n`);

  // VALIDACIÓN 1: Sesión existe
  console.log(`   🔍 [Val 1] ¿Sesión existe?`);
  const sessionExists = await Session.findByPk(testSession.id);
  logTest("Validación 1", !!sessionExists, "Sesión existe en BD");

  // VALIDACIÓN 2: Usuario no es participante
  console.log(`   🔍 [Val 2] ¿Usuario ya es participante?`);
  const alreadyParticipates = await Participant.findOne({
    where: { sessionId: testSession.id, usuarioId: maria.id }
  });
  logTest("Validación 2", !alreadyParticipates, "Usuario NO es aún participante");

  // VALIDACIÓN 3: Límite de participantes
  console.log(`   🔍 [Val 3] ¿Hay espacio?`);
  const participantCount = await Participant.count({ where: { sessionId: testSession.id } });
  const hasSpace = participantCount < testSession.maxParticipantes;
  logTest("Validación 3", hasSpace, `${participantCount}/${testSession.maxParticipantes} participantes`);

  // CREACIÓN: Agregar participante
  console.log(`   📝 [Crear] Agregando participante...`);
  try {
    const newParticipant = await Participant.create({
      sessionId: testSession.id,
      usuarioId: maria.id,
      estado: 'activo'
    });
    logTest("Crear", true, `Participante creado (${newParticipant.id})`);

    // PASO 7: Verificar resultado final
    console.log("\n📋 PASO 7: Verificar Resultado Final\n");

    const updatedSession = await Session.findByPk(testSession.id, {
      include: [
        { model: Usuario, as: 'creador' },
        { 
          model: Participant, 
          as: 'participantes',
          include: [{ model: Usuario, as: 'usuario' }]
        }
      ]
    });

    console.log(`   Sesión: "${updatedSession.titulo}"`);
    console.log(`   Participantes (${updatedSession.participantes.length}):`);
    updatedSession.participantes.forEach((p, idx) => {
      console.log(`      ${idx + 1}. ${p.usuario.name} (${p.usuario.email})`);
    });

    const mariaInList = updatedSession.participantes.some(p => p.usuarioId === maria.id);
    logTest("Resultado", mariaInList, `María ahora es participante de "${updatedSession.titulo}"`);

  } catch (createError) {
    console.error(`❌ Error al crear participante:`);
    console.error(`   Nombre: ${createError.name}`);
    console.error(`   Mensaje: ${createError.message}`);
    
    if (createError.name === 'SequelizeUniqueConstraintError') {
      console.error(`   Causa: Constraint único violado`);
    }
    
    logTest("Crear", false, `Error: ${createError.message}`);
  }

  // RESUMEN
  console.log("\n" + "═".repeat(70));
  console.log(`📊 RESULTADO: ${testsPassed} ✅ / ${testsFailed} ❌\n`);

  if (testsFailed === 0) {
    console.log("✅ TODO FUNCIONA CORRECTAMENTE");
    console.log("\n   Ahora puedes testear desde el Frontend:");
    console.log("   1. Frontend en http://localhost:4200");
    console.log("   2. Login con juan@test.com / password123");
    console.log("   3. Logout");
    console.log("   4. Login con maria@test.com / password123");
    console.log("   5. Busca 'Test - Sesión de Prueba' en Sesiones Disponibles");
    console.log("   6. Haz click en 'Unirse'");
    console.log("   7. Deberías ver la sesión en 'Mis Sesiones'\n");
  } else {
    console.log("⚠️  Hay problemas. Revisa los errores arriba.\n");
  }

  process.exit(testsFailed === 0 ? 0 : 1);

} catch (err) {
  console.error("\n❌ ERROR CRÍTICO:");
  console.error(err.message);
  console.error("\nDetalles:");
  console.error(err.stack);
  process.exit(1);
}
