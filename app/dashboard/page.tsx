'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { VoiceRecorder } from '@/components/voice-recorder'
import { TranscriptionHistory } from '@/components/transcription-history'
import { DictionaryManager } from '@/components/dictionary-manager'
import { Settings } from '@/components/settings'

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('recorder')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        {activeTab === 'recorder' && <VoiceRecorder />}
        {activeTab === 'history' && <TranscriptionHistory />}
        {activeTab === 'dictionary' && <DictionaryManager />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}
