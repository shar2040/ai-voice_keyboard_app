import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db'
import { verifyPassword, createJWT } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await getUserByEmail(email)

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = createJWT(user.id)

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      token,
      success: true
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
