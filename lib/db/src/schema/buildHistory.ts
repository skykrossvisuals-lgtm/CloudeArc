import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const buildHistoryTable = pgTable("build_history", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  userPrompt: text("user_prompt").notNull(),
  filesWritten: jsonb("files_written").$type<string[]>().notNull().default([]),
  fileCount: integer("file_count").notNull().default(0),
  isEdit: integer("is_edit").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBuildHistorySchema = createInsertSchema(buildHistoryTable).omit({ id: true, createdAt: true });
export type InsertBuildHistory = z.infer<typeof insertBuildHistorySchema>;
export type BuildHistory = typeof buildHistoryTable.$inferSelect;
