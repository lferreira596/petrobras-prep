import {
  pgTable, uuid, text, integer, boolean, timestamp,
  jsonb, pgEnum, primaryKey, index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────
export const planEnum      = pgEnum("plan",      ["free","premium"]);
export const modoEnum      = pgEnum("modo",      ["quiz","revisao"]);
export const bancaEnum     = pgEnum("banca",     ["CESGRANRIO","CEBRASPE"]);
export const difEnum       = pgEnum("dificuldade",["facil","media","dificil"]);
export const tipoEnum      = pgEnum("tipo",      ["multipla","certo_errado"]);
export const areaEnum      = pgEnum("area",      [
  "port","mat","info","adm","leg","pet","ing","con"
]);

// ─── Users ────────────────────────────────────────────────────
export const users = pgTable("users", {
  id            : uuid("id").primaryKey().defaultRandom(),
  name          : text("name"),
  email         : text("email").notNull().unique(),
  emailVerified : timestamp("email_verified", { mode: "date" }),
  image         : text("image"),
  plan          : planEnum("plan").default("free").notNull(),
  streakDias    : integer("streak_dias").default(0).notNull(),
  ultimoEstudo  : timestamp("ultimo_estudo", { mode: "date" }),
  createdAt     : timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── NextAuth tables ──────────────────────────────────────────
export const accounts = pgTable("accounts", {
  userId            : uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type              : text("type").notNull(),
  provider          : text("provider").notNull(),
  providerAccountId : text("provider_account_id").notNull(),
  refresh_token     : text("refresh_token"),
  access_token      : text("access_token"),
  expires_at        : integer("expires_at"),
  token_type        : text("token_type"),
  scope             : text("scope"),
  id_token          : text("id_token"),
  session_state     : text("session_state"),
}, (t) => ({
  pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
}));

export const sessions = pgTable("sessions", {
  sessionToken : text("session_token").primaryKey(),
  userId       : uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires      : timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier : text("identifier").notNull(),
  token      : text("token").notNull(),
  expires    : timestamp("expires", { mode: "date" }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.identifier, t.token] }),
}));

// ─── Questions ────────────────────────────────────────────────
export const questions = pgTable("questions", {
  id        : text("id").primaryKey(),
  area      : areaEnum("area").notNull(),
  sub       : text("sub").notNull(),
  banca     : bancaEnum("banca").notNull(),
  ano       : integer("ano").notNull(),
  dif       : difEnum("dificuldade").notNull(),
  tipo      : tipoEnum("tipo").notNull(),
  enunciado : text("enunciado").notNull(),
  opcoes    : jsonb("opcoes").$type<string[]>().notNull(),
  correta   : integer("correta").notNull(),
  explicacao: text("explicacao").notNull(),
  enfase    : text("enfase"),         // "adm_controle","suprimentos","operacao"...
  ativa     : boolean("ativa").default(true).notNull(),
  createdAt : timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  areaIdx  : index("questions_area_idx").on(t.area),
  bancaIdx : index("questions_banca_idx").on(t.banca),
  difIdx   : index("questions_dif_idx").on(t.dif),
}));

// ─── User Question Progress ───────────────────────────────────
export const userQuestionProgress = pgTable("user_question_progress", {
  userId       : uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId   : text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  tentativas   : integer("tentativas").default(0).notNull(),
  acertos      : integer("acertos").default(0).notNull(),
  erros        : integer("erros").default(0).notNull(),
  // SM-2 spaced repetition fields
  intervalo    : integer("intervalo").default(1).notNull(),   // dias até próxima revisão
  facilidade   : integer("facilidade").default(250).notNull(),// fator EF * 100 (default 2.5)
  proximaRevisao: timestamp("proxima_revisao", { mode: "date" }),
  ultimaVez    : timestamp("ultima_vez", { mode: "date" }),
}, (t) => ({
  pk         : primaryKey({ columns: [t.userId, t.questionId] }),
  userIdx    : index("uqp_user_idx").on(t.userId),
  revisaoIdx : index("uqp_revisao_idx").on(t.userId, t.proximaRevisao),
}));

// ─── Study Sessions ───────────────────────────────────────────
export const studySessions = pgTable("study_sessions", {
  id          : uuid("id").primaryKey().defaultRandom(),
  userId      : uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  modo        : modoEnum("modo").notNull(),
  total       : integer("total").notNull(),
  acertos     : integer("acertos").notNull(),
  erros       : integer("erros").notNull(),
  duracaoSeg  : integer("duracao_seg").default(0).notNull(),
  areas       : jsonb("areas").$type<string[]>().notNull(),
  createdAt   : timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  userIdx : index("ss_user_idx").on(t.userId),
  dateIdx : index("ss_date_idx").on(t.userId, t.createdAt),
}));

// ─── Study Plans ──────────────────────────────────────────────
export const studyPlans = pgTable("study_plans", {
  id        : uuid("id").primaryKey().defaultRandom(),
  userId    : uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  config    : jsonb("config").$type<StudyPlanConfig>().notNull(),
  updatedAt : timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts  : many(accounts),
  sessions  : many(sessions),
  progress  : many(userQuestionProgress),
  studySessions: many(studySessions),
  studyPlan : one(studyPlans, { fields:[users.id], references:[studyPlans.userId] }),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
  progress: many(userQuestionProgress),
}));

// ─── Types ────────────────────────────────────────────────────
export type User                  = typeof users.$inferSelect;
export type Question              = typeof questions.$inferSelect;
export type UserQuestionProgress  = typeof userQuestionProgress.$inferSelect;
export type StudySession          = typeof studySessions.$inferSelect;
export type StudyPlan             = typeof studyPlans.$inferSelect;

export interface StudyPlanConfig {
  diasSemana: {
    dia    : string;
    foco   : string;
    horas  : number;
    cor    : string;
  }[];
  metaHorasSemana : number;
  enfasePrincipal : string;
}
