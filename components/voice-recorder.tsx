'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mic, Copy, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'


export function VoiceRecorder() {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sliceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const accumulatedTextRef = useRef<string>('')
  const previousSliceEndRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const chunkAccumulatorRef = useRef<Blob[]>([])
  const lastProcessTimeRef = useRef<number>(Date.now())
  const audioMonitorRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      // Play click sound when starting recording
      const clickSound = new Audio('/new-notification-09-352705.mp3')
      clickSound.play().catch(() => {}) // Ignore errors if audio fails

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create AudioContext for better audio processing
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Enable audio monitoring (user hears their own voice when recording)
      const source = audioContextRef.current.createMediaStreamSource(stream)
      const destination = audioContextRef.current.createMediaStreamDestination()
      source.connect(destination)
      
      // Create audio element for monitoring and store reference
      const audioElement = new Audio()
      audioElement.srcObject = destination.stream
      audioElement.volume = 0.5 // Set volume to 50% to avoid feedback
      audioMonitorRef.current = audioElement
      audioElement.play().catch(() => {}) // Start monitoring - user hears their voice

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      accumulatedTextRef.current = ''
      previousSliceEndRef.current = 0

      // Reset accumulators for new recording session
      chunkAccumulatorRef.current = []
      lastProcessTimeRef.current = Date.now()
      
      const PROCESS_INTERVAL = 8000 // Process every 8 seconds for complete audio segments
      const MIN_AUDIO_SIZE = 80000 // Minimum 80KB for valid audio file

      // Process when data becomes available
      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
          
          // Only process if we have enough audio for a valid file
          if (e.data.size >= MIN_AUDIO_SIZE) {
            // This is a complete segment from MediaRecorder
            await processAudioSlice(e.data)
          } else {
            // Small chunk - accumulate it
            chunkAccumulatorRef.current.push(e.data)
            const accumulatedSize = chunkAccumulatorRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
            
            // Process accumulated chunks if we have enough
            if (accumulatedSize >= MIN_AUDIO_SIZE) {
              const accumulatedBlob = new Blob(chunkAccumulatorRef.current, { type: 'audio/webm;codecs=opus' })
              await processAudioSlice(accumulatedBlob)
              chunkAccumulatorRef.current = []
            }
          }
        }
      }

      // Start recording without timeslice - we'll manually request data
      mediaRecorder.start()

      // Process audio at intervals by requesting data from MediaRecorder
      // This ensures we get complete segments rather than partial chunks
      const processInterval = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          // Request data from MediaRecorder - this gives us a complete segment
          mediaRecorderRef.current.requestData()
        }
      }, PROCESS_INTERVAL)

      // Store interval reference for cleanup
      sliceTimerRef.current = processInterval as any
      setIsRecording(true)
      setRecordingTime(0)
      setTranscription('')

      // Timer for display
      timerRef.current = setInterval(() => {
        setRecordingTime((prev: number) => prev + 1)
      }, 1000)

      // Process final slice when stopping
      mediaRecorder.onstop = async () => {
        // Process any remaining accumulated chunks first
        if (chunkAccumulatorRef.current.length > 0) {
          const remainingBlob = new Blob(chunkAccumulatorRef.current, { type: 'audio/webm;codecs=opus' })
          if (remainingBlob.size >= 1024) {
            await processAudioSlice(remainingBlob, false)
          }
          chunkAccumulatorRef.current = []
        }
        
        // Process final accumulated audio
        if (audioChunksRef.current.length > 0) {
          const finalBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
          await processAudioSlice(finalBlob, true)
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access microphone',
        variant: 'destructive',
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Play click sound when stopping recording
      const clickSound = new Audio('/new-notification-09-352705.mp3')
      clickSound.play().catch(() => {}) // Ignore errors if audio fails
      
      mediaRecorderRef.current.stop()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      // Stop audio monitoring
      if (audioMonitorRef.current) {
        audioMonitorRef.current.pause()
        audioMonitorRef.current.srcObject = null
        audioMonitorRef.current = null
      }
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (sliceTimerRef.current) {
        clearTimeout(sliceTimerRef.current)
      }
    }
  }

  const processAudioSlice = async (audioBlob: Blob, isFinal: boolean = false) => {
    try {
      setIsProcessing(true)

      const formData = new FormData()
      formData.append('audio', audioBlob, 'slice.webm')
      formData.append('isStreaming', 'true')
      formData.append('previousText', accumulatedTextRef.current)

      // Dictionary words are automatically fetched in the backend
      // Backend handles it at app/api/transcribe/route.ts line 61

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || 'Failed to transcribe audio' }
        }
        throw new Error(errorData.error || 'Failed to transcribe audio')
      }

      const data = await response.json()

      // Merge with previous transcription
      const newText = data.transcription || ''
      if (newText) {
        // Smart merging: append new text, avoiding duplicates
        if (accumulatedTextRef.current) {
          // Check if new text overlaps with existing
          const existingWords = accumulatedTextRef.current.split(/\s+/).slice(-5).join(' ')
          if (!newText.toLowerCase().includes(existingWords.toLowerCase())) {
            accumulatedTextRef.current += ' ' + newText
          } else {
            // Replace overlapping portion
            const words = accumulatedTextRef.current.split(/\s+/)
            const newWords = newText.split(/\s+/)
            // Simple merge: keep most of existing, append truly new words
            accumulatedTextRef.current = accumulatedTextRef.current.trim() + ' ' + newText
          }
        } else {
          accumulatedTextRef.current = newText
        }
        
        setTranscription(accumulatedTextRef.current.trim())
      }

      // Save final transcription to database
      if (isFinal && accumulatedTextRef.current) {
        try {
          const finalFormData = new FormData()
          // Send final text without audio blob to avoid Groq API call
          finalFormData.append('audio', new Blob([''], { type: 'audio/webm' }), 'final.webm')
          finalFormData.append('isStreaming', 'false')
          finalFormData.append('finalText', accumulatedTextRef.current)

          const saveResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: finalFormData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })

          if (saveResponse.ok) {
            toast({
              title: 'Success',
              description: 'Audio transcribed and saved successfully',
            })
          } else {
            const errorData = await saveResponse.json().catch(() => ({ error: 'Failed to save transcription' }))
            console.error('Error saving final transcription:', errorData.error)
          }
        } catch (error) {
          console.error('Error saving final transcription:', error)
        }
      }
    } catch (error) {
      console.error('Error processing slice:', error)
      if (isFinal) {
        toast({
          title: 'Error',
          description: 'Failed to transcribe audio',
          variant: 'destructive',
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription)
      toast({
        title: 'Copied',
        description: 'Text copied to clipboard',
      })
    }
  }

  const clearTranscription = () => {
    setTranscription('')
    accumulatedTextRef.current = ''
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Voice Recorder</h2>
        <p className="text-muted-foreground">Click the button below to start recording your voice</p>
      </div>

      <Card className="border-0 shadow-lg p-8 bg-card">
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center gap-6">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl ${
                isRecording
                  ? 'bg-destructive hover:bg-destructive/90 animate-pulse ring-4 ring-destructive/20'
                  : 'bg-primary hover:bg-primary/90 ring-4 ring-primary/20'
              }`}
            >
              <Mic className={`w-14 h-14 text-primary-foreground ${isRecording ? 'animate-bounce' : ''}`} />
            </Button>

            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Ready'}
              </p>
              {isRecording && (
                <p className="text-2xl font-mono text-primary mt-2">{formatTime(recordingTime)}</p>
              )}
            </div>
          </div>

          {transcription && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap break-words">{transcription}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1 gap-2 border-border text-foreground hover:bg-secondary"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button
                  onClick={clearTranscription}
                  variant="outline"
                  className="flex-1 gap-2 border-border text-foreground hover:bg-secondary"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
