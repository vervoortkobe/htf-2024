"use server";
import { redirect } from "@solidjs/router";
import { useSession } from "vinxi/http";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { Argon2id } from "oslo/password";
import { Challenges, UserChallenges, Users } from "../../drizzle/schema";

const argon2id = new Argon2id();

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

async function login(username: string, password: string) {
  const user = db
    .select()
    .from(Users)
    .where(eq(Users.username, username))
    .get();
  if (!user) throw new Error("User not found");
  const passwordCorrect = await argon2id.verify(user.password, password);
  if (!passwordCorrect) throw new Error("Invalid login credentials");
  return user;
}

async function register(username: string, password: string) {
  const existingUser = db
    .select()
    .from(Users)
    .where(eq(Users.username, username))
    .get();
  if (existingUser) throw new Error("User already exists");
  const hashedPassword = await argon2id.hash(password);
  return db
    .insert(Users)
    .values({ username, password: hashedPassword })
    .returning()
    .get();
}

function getSession() {
  return useSession({
    password:
      process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace",
  });
}

export async function loginOrRegister(formData: FormData) {
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = validateUsername(username) || validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await (loginType !== "login"
      ? register(username, password)
      : login(username, password));
    const session = await getSession();
    await session.update((d) => {
      d.userId = user.id;
    });
  } catch (err) {
    return err as Error;
  }
  throw redirect("/");
}

export async function logout() {
  const session = await getSession();
  await session.update((d) => (d.userId = undefined));
  throw redirect("/login");
}

async function getUserId() {
  const session = await getSession();
  return session.data.userId;
}

export async function getUser() {
  const userId = await getUserId();
  if (userId === undefined) throw redirect("/login");
  try {
    const user = db.select().from(Users).where(eq(Users.id, userId)).get();
    if (!user) throw redirect("/login");
    return { id: user.id, username: user.username };
  } catch {
    throw logout();
  }
}

export async function getChallenges() {
  const user = await getUser();
  return db
    .select({
      id: Challenges.id,
      name: Challenges.name,
      description: Challenges.description,
      completed: UserChallenges.score,
    })
    .from(Challenges)
    .leftJoin(
      UserChallenges,
      and(
        eq(Challenges.id, UserChallenges.challengeId),
        eq(UserChallenges.userId, user.id)
      )
    )
    .all();
}

export async function getChallenge(challengeId: number) {
  const user = await getUser();
  return db
    .select({
      challengeId: Challenges.id,
      challengeName: Challenges.name,
      challengeDescription: Challenges.description,
      userChallengeId: UserChallenges.challengeId,
      score: UserChallenges.score,
    })
    .from(Challenges)
    .leftJoin(
      UserChallenges,
      and(
        eq(Challenges.id, UserChallenges.challengeId),
        eq(UserChallenges.userId, user.id)
      )
    )
    .where(eq(Challenges.id, challengeId))
    .limit(1);
}

export async function upsertUserChallenge(challengeId: number, score: number) {
  const userId = await getUserId();
  await db
    .insert(UserChallenges)
    .values({ userId: userId, challengeId, score })
    .onConflictDoUpdate({
      target: [UserChallenges.userId, UserChallenges.challengeId],
      set: {
        score: sql`CASE 
          WHEN ${UserChallenges.score} IS NULL OR ${score} > ${UserChallenges.score} 
          THEN ${score} 
          ELSE ${UserChallenges.score} 
        END`,
      },
    });
}

export async function getLeaderboard() {
  return db
    .select({
      username: Users.username,
      challengeName: Challenges.name,
      score: UserChallenges.score,
    })
    .from(UserChallenges)
    .innerJoin(Users, eq(UserChallenges.userId, Users.id))
    .innerJoin(Challenges, eq(UserChallenges.challengeId, Challenges.id))
    .orderBy(desc(UserChallenges.score))
    .limit(10); // Optionally order by score
}

export async function getGlobalLeaderboard() {
  return db
    .select({
      username: Users.username,
      totalScore: sql`SUM(${UserChallenges.score})`.as("totalScore"), // Calculate the total score
    })
    .from(Users)
    .leftJoin(UserChallenges, eq(Users.id, UserChallenges.userId))
    .groupBy(Users.username) // Group by username to sum their scores
    .orderBy(desc(sql`SUM(${UserChallenges.score})`)) // Sort by total score
    .limit(10); // Top 10 users by total score
}
