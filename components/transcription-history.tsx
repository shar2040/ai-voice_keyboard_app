'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Trash2, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Transcription {
  id: string
  text: string
  createdAt: string
}

export function TranscriptionHistory() {
  const { toast } = useToast()
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/transcriptions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTranscriptions(data.transcriptions || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load transcription history',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      // Check if clipboard API is available and document is focused
      if (navigator.clipboard && document.hasFocus()) {
        await navigator.clipboard.writeText(text)
        toast({
          title: 'Copied',
          description: 'Text copied to clipboard',
        })
      } else {
        // Fallback: use execCommand for older browsers or when not focused
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast({
          title: 'Copied',
          description: 'Text copied to clipboard',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      })
    }
  }

  const deleteTranscription = async (id: string) => {
    try {
      const response = await fetch(`/api/transcriptions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        setTranscriptions(transcriptions.filter((t) => t.id !== id))
        toast({
          title: 'Deleted',
          description: 'Transcription deleted successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transcription',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Transcription History</h2>
        <p className="text-muted-foreground">Your recent voice recordings and transcriptions</p>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : transcriptions.length === 0 ? (
        <Card className="border-0 shadow-lg p-8 bg-card text-center">
          <p className="text-muted-foreground">No transcriptions yet. Start recording to create your first one!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {transcriptions.map((transcription) => (
            <Card
              key={transcription.id}
              className="border-0 shadow-md p-6 bg-card hover:shadow-lg transition-shadow group relative"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{formatDate(transcription.createdAt)}</p>
                  </div>
                  <p className="text-foreground break-words line-clamp-3 group-hover:line-clamp-none transition-all cursor-pointer">
                    {transcription.text}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(transcription.text)}
                    className="text-muted-foreground hover:text-primary"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTranscription(transcription.id)}
                    className="text-muted-foreground hover:text-destructive"
                    title="Delete transcription"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
