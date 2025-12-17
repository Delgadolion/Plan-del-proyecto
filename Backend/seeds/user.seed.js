import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";

const users = [
  {
    name: "pan",
    email: "pan@test.com",
    password: "pan1234",
    verified: true
  },
  {
    name: "cholo",
    email: "cholo@test.com",
    password: "cholo1234",
    verified: true
  }
];

export async function seedUsers() {
  try {
    for (const user of users) {
      const existing = await Usuario.findOne({ where: { email: user.email } });
      
      if (!existing) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await Usuario.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          verified: user.verified
        });
        console.log(`✅ Usuario creado: ${user.email}`);
      } else {
        console.log(`⏭️  Usuario ya existe: ${user.email}`);
      }
    }
    console.log("✅ Users seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
}
