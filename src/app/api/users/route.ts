import connectDB from "../../../../libs/mongodb";
import User from "../../../../models/users";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import bcrypt from 'bcryptjs';
import { routeModule } from "next/dist/build/templates/pages";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}

