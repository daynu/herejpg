import { jwtVerify } from 'jose';

interface JwtPayload {
  id: string;
  name: string;
  email: string;
  exp: number;
  role: 'user' | 'admin';
}

export async function getUserFromToken(token: string): Promise<JwtPayload> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload } = await jwtVerify(token, secret);

  return payload as unknown as JwtPayload;
}
