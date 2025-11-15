import { NextRequest, NextResponse } from 'next/server'
import { createTranscription, getDictionary } from '@/lib/db'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
const GROQ_API_KEY = process.env.GROQ_API_KEY

if (!GROQ_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('GROQ_API_KEY is not set. Transcription features will not work.')
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

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const isStreaming = formData.get('isStreaming') === 'true'
    const previousText = formData.get('previousText') as string || ''
    const finalText = formData.get('finalText') as string || ''

    // If this is a final save request with pre-computed text, skip Groq API call
    if (finalText && !isStreaming) {
      // Save directly to database without calling Groq
      const duration = Math.floor((audioFile?.size || 0) / 16000) // rough estimate
      await createTranscription(payload.userId, finalText, duration)
      return NextResponse.json({
        transcription: finalText,
      })
    }

    // Validate audio file for actual transcription requests
    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: 'Audio file is required and must not be empty' },
        { status: 400 }
      )
    }

    // Groq API requires minimum file size (typically ~1KB for valid audio)
    // Very small chunks from MediaRecorder might be incomplete
    const MIN_FILE_SIZE = 1024 // 1KB minimum
    if (audioFile.size < MIN_FILE_SIZE) {
      console.warn(`Audio file too small: ${audioFile.size} bytes, skipping Groq call`)
      // For streaming chunks that are too small, return empty transcription
      // The final accumulated text will be saved when recording stops
      return NextResponse.json({
        transcription: '',
      })
    }

    const dictionary = await getDictionary(payload.userId)

    // Check if GROQ_API_KEY is available
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Transcription service is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    // Groq API needs the file directly - don't convert unnecessarily
    // Just ensure we have a proper File object with correct name
    const groqFormData = new FormData()
    const fileName = audioFile.name || 'audio.webm'
    
    // Use the original file directly - Groq can handle webm format
    groqFormData.append('file', audioFile, fileName)
    groqFormData.append('model', 'whisper-large-v3-turbo')
    groqFormData.append('response_format', 'text')
    
    // Log file info for debugging (without sensitive data)
    console.log(`Sending audio to Groq: size=${audioFile.size} bytes, type=${audioFile.type}, name=${fileName}`)

    // Build prompt with dictionary words and context
    let prompt = ''
    if (dictionary.length > 0) {
      prompt += `Custom words: ${dictionary.map((d: any) => d.custom_spelling || d.word).join(', ')}. `
    }
    if (previousText && isStreaming) {
      // Provide context from previous transcription for better continuity
      const lastWords = previousText.split(/\s+/).slice(-10).join(' ')
      if (lastWords) {
        prompt += `Previous context: ${lastWords}. `
      }
    }
    prompt += 'Transcribe accurately, maintaining natural flow and punctuation.'
    
    if (prompt) {
      groqFormData.append('prompt', prompt.slice(0, 200)) // Groq limit is 224 tokens, we use 200 chars as safe limit
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: groqFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq error:', errorText)
      
      // Try to parse error for better message
      let errorMessage = 'Failed to transcribe audio'
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message
          // If it's a file format issue, provide helpful message
          if (errorMessage.includes('could not process file') || errorMessage.includes('valid media file')) {
            errorMessage = 'Audio file format not supported. Please try recording again.'
          }
        }
      } catch {
        // If not JSON, use the text as-is
        errorMessage = errorText || errorMessage
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    // Groq returns text when response_format is 'text', so read as text first
    const contentType = response.headers.get('content-type') || ''
    let transcriptionText = ''
    
    if (contentType.includes('application/json')) {
      const result = await response.json()
      transcriptionText = typeof result === 'string' ? result : result.text || ''
    } else {
      // Response is plain text
      transcriptionText = await response.text()
    }

    // Save to database for non-streaming requests
    if (!isStreaming && transcriptionText) {
      const duration = Math.floor(audioFile.size / 16000) // rough estimate
      await createTranscription(payload.userId, transcriptionText, duration)
    }

    return NextResponse.json({
      transcription: transcriptionText,
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
