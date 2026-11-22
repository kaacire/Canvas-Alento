import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// Carrega SEMPRE apps/api/.env, não importa de onde o comando foi executado.
const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(here, "../../.env") });

const DEFAULT_AUTH_SECRET = "troque-esta-chave";

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string().min(1),
    WEB_ORIGIN: z.string().default("http://localhost:5173"),
    /** Chave que assina os tokens de login. Em produção: 32+ caracteres e diferente do padrão. */
    AUTH_SECRET: z.string().default(DEFAULT_AUTH_SECRET),
    /** Validade do token de login, em dias. */
    TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
    STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
    STORAGE_LOCAL_DIR: z.string().default("./uploads"),
  })
  .superRefine((value, ctx) => {
    if (
      value.NODE_ENV === "production" &&
      (value.AUTH_SECRET === DEFAULT_AUTH_SECRET || value.AUTH_SECRET.length < 32)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_SECRET"],
        message: "Em produção, AUTH_SECRET precisa ter 32+ caracteres e não pode ser o valor padrão.",
      });
    }
  });

export const env = schema.parse(process.env);
