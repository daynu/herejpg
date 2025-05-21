import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../libs/mongodb';
import Post from '../../../../models/post';
import { getUserFromToken } from '../../../../libs/getuserfromtoken';
import mongoose from 'mongoose';
import User from '../../../../models/users';


export async function POST(req: NextRequest) {
  await connectDB();
  console.log(req.cookies.get('token'));

  const body = await req.json();
  const base64Image = body.image;
  const caption = body.caption;
  const lat = parseFloat(body.lat);
  const lng = parseFloat(body.lng);

  if (!base64Image|| isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ message: 'Missing required data' }, { status: 400 });
  }

  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  let userId;
  console.log('JWT Secret:', process.env.JWT_SECRET);
  try {
    const user = await getUserFromToken(token);
    userId = new mongoose.Types.ObjectId(user.id);
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const post = await Post.create({
    user: userId,
    caption,
    image: base64Image,
    location: { lat, lng },
  });

  return NextResponse.json({ success: true, post });
}

export async function GET(req: NextRequest)
{
    await connectDB();
    const posts = await Post.find().populate('user', 'name id');
    const validPosts = posts.filter(post => post.user);
    if (validPosts.length === 0) {
        return NextResponse.json({ message: 'No posts found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, posts: validPosts });

}

export async function DELETE(req: NextRequest)
{
    await connectDB();
    const { id } = await req.json();
    console.log('ID:', id);
    if (!id) {
        return NextResponse.json({ message: 'Missing post ID' }, { status: 400 });
    }

    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    let userId;
    let userRole;
    try {
        const user = await getUserFromToken(token);
        userId = new mongoose.Types.ObjectId(user.id);
        userRole = user.role;
    } catch (err) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const post = await Post.findById(id).populate('user', 'name id');
    if (!post) {
        return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if ((post.user._id.toString() !== userId.toString() && userRole !== 'admin')) {
        console.log('User Role:', userRole);
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
}


export async function PUT(req: NextRequest)
{
    await connectDB();
    const { id, caption, image } = await req.json();

    if (!id || !caption || !image) {
        return NextResponse.json({ message: 'Missing required data' }, { status: 400 });
    }

    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    let userId;
    let userRole;
    try {
        const user = await getUserFromToken(token);
        userId = new mongoose.Types.ObjectId(user.id);
        userRole = user.role;
    } catch (err) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const post = await Post.findById(id).populate('user', 'name id');
    if (!post) {
        return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if ((post.user._id.toString() !== userId.toString() && userRole !== 'admin')) {
        console.log('User Role:', userRole);
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    post.caption = caption;
    post.image = image;

    await post.save();

    return NextResponse.json({ success: true, post });
}