'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Word {
  id: string
  word: string
  pronunciation?: string
}

export function DictionaryManager() {
  const { toast } = useToast()
  const [words, setWords] = useState<Word[]>([])
  const [newWord, setNewWord] = useState('')
  const [newPronunciation, setNewPronunciation] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchDictionary()
  }, [])

  const fetchDictionary = async () => {
    try {
      const response = await fetch('/api/dictionary', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWords(data.words || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dictionary',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addWord = async () => {
    if (!newWord.trim()) return

    setIsAdding(true)
    try {
      const response = await fetch('/api/dictionary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          word: newWord.trim(),
          pronunciation: newPronunciation.trim() || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setWords([...words, data.word])
        setNewWord('')
        setNewPronunciation('')
        toast({
          title: 'Success',
          description: 'Word added to dictionary',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add word',
        variant: 'destructive',
      })
    } finally {
      setIsAdding(false)
    }
  }

  const deleteWord = async (id: string) => {
    try {
      const response = await fetch(`/api/dictionary/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        setWords(words.filter((w) => w.id !== id))
        toast({
          title: 'Deleted',
          description: 'Word removed from dictionary',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete word',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Custom Dictionary</h2>
        <p className="text-muted-foreground">
          Add custom words to improve transcription accuracy for specialized terms
        </p>
      </div>

      <Card className="border-0 shadow-lg p-6 bg-card mb-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word" className="text-foreground">
              Word
            </Label>
            <Input
              id="word"
              placeholder="Enter a word (e.g., 'Kubernetes')"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              className="bg-input border-border text-foreground placeholder-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronunciation" className="text-foreground">
              Pronunciation (Optional)
            </Label>
            <Input
              id="pronunciation"
              placeholder="How it sounds (e.g., 'koo-ber-nee-tees')"
              value={newPronunciation}
              onChange={(e) => setNewPronunciation(e.target.value)}
              className="bg-input border-border text-foreground placeholder-muted-foreground"
            />
          </div>

          <Button
            onClick={addWord}
            disabled={isAdding || !newWord.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Word
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading dictionary...</div>
        ) : words.length === 0 ? (
          <Card className="border-0 shadow-md p-6 bg-card text-center">
            <p className="text-muted-foreground">No custom words yet. Add one to get started!</p>
          </Card>
        ) : (
          words.map((word) => (
            <Card key={word.id} className="border-0 shadow-md p-4 bg-card flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{word.word}</p>
                {word.pronunciation && (
                  <p className="text-sm text-muted-foreground">{word.pronunciation}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteWord(word.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
