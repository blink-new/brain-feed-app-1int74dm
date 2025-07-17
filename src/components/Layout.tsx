import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Library, User, Plus } from 'lucide-react'
import blink from '../blink/client'

interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  xp?: number
  currentStreak?: number
}

interface LayoutProps {
  children: ReactNode
  user: User
}

export default function Layout({ children, user }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Feed' },
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="brutalist-border border-b-4 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black">🧠 Brain Feed</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* XP Display */}
            <div className="flex items-center gap-2 bg-green-100 px-3 py-1 brutalist-border">
              <span className="text-sm font-bold">⭐ {user.xp || 0} XP</span>
            </div>
            
            {/* Streak Display */}
            <div className="flex items-center gap-2 bg-orange-100 px-3 py-1 brutalist-border">
              <span className="text-sm font-bold">🔥 {user.currentStreak || 0}</span>
            </div>
            
            {/* Add Content Button */}
            <button className="brutalist-border brutalist-shadow bg-accent text-accent-foreground p-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <Plus className="w-5 h-5" />
            </button>
            
            {/* User Menu */}
            <button 
              onClick={() => blink.auth.logout()}
              className="brutalist-border bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white brutalist-border border-t-4 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 p-2 ${
                location.pathname === path
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2">
        <div className="bg-white brutalist-border brutalist-shadow p-4 space-y-4">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 p-3 rounded transition-colors ${
                location.pathname === path
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}