import { pgTable, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 系统表 - 必须保留
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 学生表
export const students = pgTable("students", {
	id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
	name: varchar("name", { length: 50 }).notNull(),
	class: varchar("class", { length: 50 }).notNull(),
	gender: varchar("gender", { length: 10 }).notNull().default('男'),
	avatar: varchar("avatar", { length: 10 }).notNull().default('👦'),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 行为记录表
export const behaviorRecords = pgTable("behavior_records", {
	id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
	student_id: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
	behavior_id: varchar("behavior_id", { length: 20 }).notNull(),
	score: integer("score").notNull(),
	record_date: timestamp("record_date", { withTimezone: true }).defaultNow().notNull(),
});
