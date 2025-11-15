import { NextRequest, NextResponse } from 'next/server'
import { deleteDictionaryWord } from '@/lib/db'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = extractTokenFromHeader(authHeader)
    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 })
    }

    const { id } = await params
    const wordId = parseInt(id)
    if (isNaN(wordId)) {
      return NextResponse.json(
        { error: 'Invalid word ID' },
        { status: 400 }
      )
    }

    await deleteDictionaryWord(payload.userId, wordId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete dictionary word error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
