import { z } from "zod";

/** Nomes que não podem virar username (colidem com rotas ou com o produto). */
const RESERVED_USERNAMES = new Set([
  "me", "app", "api", "admin", "hope", "suporte", "ajuda",
  "entrar", "cadastro", "planos", "templates", "comunidade", "criadores", "editar", "e",
]);

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const passwordSchema = z.string().min(8, "Mínimo de 8 caracteres").max(128);

export const nameSchema = z.string().trim().min(1).max(80);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,30}$/, "Use 3 a 30 caracteres: letras minúsculas, números e _")
  .refine((value) => !RESERVED_USERNAMES.has(value), "Este nome de usuário não está disponível");

export const bioSchema = z.string().trim().max(280);

export const avatarUrlSchema = z
  .string()
  .trim()
  .max(500)
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "A URL precisa começar com http:// ou https://");

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

/** bio e avatarUrl aceitam null para limpar o campo. */
export const updateProfileSchema = z
  .object({
    name: nameSchema,
    username: usernameSchema,
    bio: bioSchema.nullable(),
    avatarUrl: avatarUrlSchema.nullable(),
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Envie pelo menos um campo para alterar");

export const deleteAccountSchema = z.object({
  password: z.string().min(1).max(128),
});
