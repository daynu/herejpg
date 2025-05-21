import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return new Response('Unauthorized', { status: 401 });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      name: string;
      id: string;
      email: string;
      role: string;
    };

    return Response.json({ name: payload.name, id: payload.id, role: payload.role });
  } catch (err) {
    return new Response('Invalid token', { status: 403 });
  }
}
