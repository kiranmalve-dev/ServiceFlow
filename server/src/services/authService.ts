import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import type { AuthPayload } from "../types/index.js";
import type { Portal } from "../validators/authValidator.js";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "dev_secret_change_in_production";
const JWT_EXPIRES_IN = "7d";

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

export interface LoginResult {
  token: string;
  user: Omit<UserRow, "password">;
}

export async function loginUser(
  email: string,
  password: string,
  portal: Portal
): Promise<LoginResult> {
  const db = prisma as any;
  const user = (await db.user.findUnique({ where: { email } })) as UserRow | null;
  if (!user) {
    throw new Error("Invalid email or password.");
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error("Invalid email or password.");
  }
  const dbRole = user.role.toLowerCase();

  if (dbRole !== portal) {
    throw new Error("Access denied. You are not authorised to log in through this portal.");
  }

  const payload: AuthPayload = {
    id: user.id,
    email: user.email,
    role: dbRole, 
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const { password: _pw, ...publicUser } = user;
  return { token, user: publicUser };
}
