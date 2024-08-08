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
        name: "Challenge 1",
        description: "Description for Challenge 1",
      },
      {
        id: 2,
        name: "Challenge 2",
        description: "Description for Challenge 2",
      },
      {
        id: 3,
        name: "Challenge 3",
        description: "Description for Challenge 3",
      },
    ])
    .execute();

  await db
    .insert(UserChallenges)
    .values([
      { userId: 1, challengeId: 1, score: 95 },
      { userId: 1, challengeId: 2, score: 88 },
      { userId: 1, challengeId: 3, score: 78 },
    ])
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
