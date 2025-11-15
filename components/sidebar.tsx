import { Button } from '@/components/ui/button'
import { Mic, History, BookOpen, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const navItems = [
    { id: 'recorder', icon: Mic, label: 'Voice Recorder' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'dictionary', icon: BookOpen, label: 'Dictionary' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Mic className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-bold text-sidebar-foreground">Voice Keyboard</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${
                activeTab === item.id
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        Logout
      </Button>
    </div>
  )
}
