'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Moon, Sun } from 'lucide-react'

export function Settings() {
  const { toast } = useToast()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    toast({
      title: 'Theme Updated',
      description: newDarkMode ? 'Switched to dark mode' : 'Switched to light mode',
    })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Customize your Voice Keyboard experience</p>
      </div>

      <Card className="border-0 shadow-lg p-6 bg-card">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div>
              <Label className="text-base font-medium text-foreground">Dark Mode</Label>
              <p className="text-sm text-muted-foreground mt-1">Use dark theme for comfortable viewing</p>
            </div>
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              className="border-border text-foreground hover:bg-secondary gap-2"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? 'Light' : 'Dark'}
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">About</Label>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Voice Keyboard v1.0</p>
              <p>Powered by Groq Whisper AI</p>
              <p>© 2025 All rights reserved</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
