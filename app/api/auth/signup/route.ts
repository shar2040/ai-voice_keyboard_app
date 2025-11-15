import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/db'
import { hashPassword, createJWT } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const passwordHash = hashPassword(password)
    const user = await createUser(email, passwordHash, name)
    
    // Generate JWT token
    const token = createJWT(user.id)

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
      success: true
    }, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error)
    
    // Handle unique constraint violation
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
