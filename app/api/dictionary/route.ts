import { NextRequest, NextResponse } from 'next/server'
import { getDictionary, addDictionaryWord, deleteDictionaryWord } from '@/lib/db'
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

    const words = await getDictionary(payload.userId)

    // Format words to match frontend expectations
    const formattedWords = words.map((w: any) => ({
      id: String(w.id),
      word: w.word,
      pronunciation: w.custom_spelling || undefined,
    }))

    return NextResponse.json({
      words: formattedWords,
    })
  } catch (error) {
    console.error('Get dictionary error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { word, pronunciation } = await request.json()

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      )
    }

    const newWord = await addDictionaryWord(payload.userId, word, pronunciation)

    // Format to match frontend expectations
    return NextResponse.json({
      word: {
        id: String(newWord.id),
        word: newWord.word,
        pronunciation: newWord.custom_spelling || undefined,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Add dictionary word error:', error)
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

    const { wordId } = await request.json()
    if (!wordId) {
      return NextResponse.json(
        { error: 'Word ID required' },
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
