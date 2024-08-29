import {
  integer,
  text,
  sqliteTable,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const Users = sqliteTable("users", {
  id: integer("id").primaryKey().unique().notNull(),
  username: text("username").notNull().default(""),
  password: text("password").notNull().default(""),
});

export const Challenges = sqliteTable("challenges", {
  id: integer("id").primaryKey().unique().notNull(),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
});

export const UserChallenges = sqliteTable(
  "user_challenges",
  {
    userId: integer("user_id")
      .references(() => Users.id)
      .notNull(),
    challengeId: integer("challenge_id")
      .references(() => Challenges.id)
      .notNull(),
    score: real("score").notNull().default(0),
  },
  (table) => {
    return { pk: primaryKey({ columns: [table.userId, table.challengeId] }) };
  }
);
