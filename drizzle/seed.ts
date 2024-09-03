import { db } from "~/api/db";
import { Challenges, UserChallenges, Users } from "./schema";
import { Argon2id } from "oslo/password";

async function seedDatabase() {
  const argon2id = new Argon2id();
  const defaultPassword = await argon2id.hash("Tester123!");

  await db
    .insert(Users)
    .values([{ id: 1, username: "tester", password: defaultPassword }])
    .execute();

  await db
    .insert(Challenges)
    .values([
      {
        id: 1,
        name: "Reaction Speed Challenge",
        description:
          "A rigorous assessment of your reflexes and response time. In this exercise, your objective is to swiftly click on blue dots that appear on the screen at unpredictable intervals. The quicker and more accurately you respond, the better your performance will be. This challenge is designed to measure your reaction time and focus, offering valuable insights into your ability to respond under pressure. Are you prepared to demonstrate your precision and speed?",
      },
    ])
    .execute();

  await db
    .insert(UserChallenges)
    .values([{ userId: 1, challengeId: 1, score: 95 }])
    .execute();
}

console.log("Started database seeding...");
seedDatabase()
  .then(() => {
    console.log("🌱 Database seeded successfully");
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
  });
