import Achievement from "../models/Achievement.js";

const achievements = [
  {
    name: "Primer Paso",
    description: "Completa tu primera sesión de estudio",
    icon: "🚀",
    category: "achievement",
    points: 10
  },
  {
    name: "Estudiante Dedicado",
    description: "Completa 5 sesiones de estudio",
    icon: "📚",
    category: "consistency",
    points: 25
  },
  {
    name: "Maestro del Pomodoro",
    description: "Completa 10 sesiones usando el método Pomodoro",
    icon: "⏱️",
    category: "study",
    points: 50
  },
  {
    name: "Colaborador",
    description: "Únete a una sesión de otro usuario",
    icon: "👥",
    category: "social",
    points: 15
  },
  {
    name: "Anfitrión Exitoso",
    description: "Crea 3 sesiones de estudio",
    icon: "🏠",
    category: "achievement",
    points: 30
  },
  {
    name: "Racha de Estudio",
    description: "Estudia 7 días consecutivos",
    icon: "🔥",
    category: "consistency",
    points: 100
  },
  {
    name: "Maratón de Estudio",
    description: "Acumula 50 horas de estudio",
    icon: "💪",
    category: "study",
    points: 75
  },
  {
    name: "Colector de Logros",
    description: "Desbloquea 10 logros diferentes",
    icon: "🏆",
    category: "achievement",
    points: 200
  },
  {
    name: "Mañanero",
    description: "Completa una sesión antes de las 9 AM",
    icon: "🌅",
    category: "study",
    points: 20
  },
  {
    name: "Noctámbulo",
    description: "Completa una sesión después de las 9 PM",
    icon: "🌙",
    category: "study",
    points: 20
  },
  {
    name: "Centrado",
    description: "Completa una sesión sin interrupciones",
    icon: "🎯",
    category: "consistency",
    points: 25
  }
];

export async function seedAchievements() {
  try {
    for (const achievement of achievements) {
      await Achievement.findOrCreate({
        where: { name: achievement.name },
        defaults: achievement
      });
    }
    console.log("✅ Achievements seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding achievements:", error);
  }
}
