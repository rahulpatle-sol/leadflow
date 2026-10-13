import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Apna naam likho."),
  email: z.string().trim().toLowerCase().email("Sahi email likho."),
  password: z
    .string()
    .min(6, "Password kam se kam 6 characters ka ho.")
    .max(72, "Password 72 characters se chhota ho."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Sahi email likho."),
  password: z.string().min(1, "Password likho."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
