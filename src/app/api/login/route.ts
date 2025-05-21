import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../libs/mongodb';
import User from '../../../../models/users';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(req: NextRequest) {
  try {
   
    await connectDB();

    const { email, password } = await req.json();

    
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

   
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    
    const token = await new SignJWT({ name: user.name, email: user.email, id: user._id.toString(), role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));


    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return response;
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}