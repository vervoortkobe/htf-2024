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
      {
        id: 2,
        name: "Pong Challenge",
        description:
          "Get as much points as you can by hitting the ball with your paddle. Use your mouse to move your paddle up and down. The longer you survive, the higher your score will be. Good luck!",
      },
      {
        id: 3,
        name: "Space Shooter Challenge",
        description:
          "Watch out for the asteroids while navigating through space. Use your mouse to move your spaceship left and right and avoid the obstacles. Is an asteroid coming too close? You can shoot the asteroids to destroy them and eliminating the danger. The longer you survive, the higher your score will be. Good luck!",
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
