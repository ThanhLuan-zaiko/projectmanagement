import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/modules/auth/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, full_name, phone } = body;

    if (!email || !username || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const result = await register({ email, username, password, full_name, phone });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
