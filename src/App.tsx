import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import blink from './blink/client'
import Layout from './components/Layout'
import Feed from './pages/Feed'
import Library from './pages/Library'
import Profile from './pages/Profile'
import { Toaster } from './components/ui/toaster'

interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  xp?: number
  currentStreak?: number
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Global error handler for analytics errors
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('analytics') || 
          event.error?.message?.includes('BlinkNetworkError')) {
        console.warn('Analytics error caught and suppressed:', event.error)
        event.preventDefault()
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('analytics') || 
          event.reason?.message?.includes('BlinkNetworkError')) {
        console.warn('Analytics promise rejection caught and suppressed:', event.reason)
        event.preventDefault()
        return false
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading Brain Feed...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2">🧠 Brain Feed</h1>
            <p className="text-lg text-muted-foreground">
              Gamified microlearning from books & videos
            </p>
          </div>
          <button
            onClick={() => blink.auth.login()}
            className="brutalist-border brutalist-shadow bg-primary text-primary-foreground px-8 py-4 font-bold text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Start Learning 🚀
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Feed user={user} />} />
          <Route path="/library" element={<Library user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  )
}

export default App