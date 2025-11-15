import { NextRequest, NextResponse } from 'next/server'
import { getUserTranscriptions, deleteTranscription } from '@/lib/db'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    const transcriptions = await getUserTranscriptions(payload.userId)

    // Format transcriptions to match frontend expectations
    const formattedTranscriptions = transcriptions.map((t: any) => ({
      id: String(t.id),
      text: t.content,
      createdAt: t.created_at,
    }))

    return NextResponse.json({
      transcriptions: formattedTranscriptions,
    })
  } catch (error) {
    console.error('Get transcriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { transcriptionId } = await request.json()
    if (!transcriptionId) {
      return NextResponse.json(
        { error: 'Transcription ID required' },
        { status: 400 }
      )
    }

    await deleteTranscription(payload.userId, transcriptionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete transcription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
