import { apiError, apiUser, json } from "@/server/api";

export async function GET(req: Request) {
  const u = await apiUser(req);
  return u ? json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } }) : apiError(401, "Oturum gerekli.");
}
