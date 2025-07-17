import { useState, useEffect } from 'react'
import QuizCard from '../components/QuizCard'
import FlashCard from '../components/FlashCard'
import { Shuffle } from 'lucide-react'
import { contentStore } from '../lib/contentStore'

interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  xp?: number
  currentStreak?: number
}

interface FeedProps {
  user: User
}



export default function Feed({ user }: FeedProps) {
  const [feedItems, setFeedItems] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(user.xp || 0)

  useEffect(() => {
    // Get feed items from content store (now async)
    const loadFeedItems = async () => {
      try {
        const items = await contentStore.getFeedItems(user.id)
        setFeedItems(items)
      } catch (error) {
        console.error('Failed to load feed items:', error)
      }
    }
    
    loadFeedItems()
  }, [user.id])

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setStreak(prev => prev + 1)
      setXp(prev => prev + 10)
    } else {
      setStreak(0)
    }
    
    // Move to next item after a short delay
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % feedItems.length)
    }, 1500)
  }

  const handleShuffle = async () => {
    try {
      const items = await contentStore.getFeedItems(user.id)
      setFeedItems(items)
      setCurrentIndex(0)
    } catch (error) {
      console.error('Failed to shuffle feed items:', error)
    }
  }

  if (feedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-4">🧠 Your Feed</h1>
          <div className="bg-blue-50 brutalist-border p-8 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-2">No content yet!</h3>
            <p className="text-muted-foreground mb-4">
              Add books or videos to your library to start generating questions and flashcards.
            </p>
            <button 
              onClick={() => window.location.href = '/library'}
              className="brutalist-border brutalist-shadow bg-primary text-primary-foreground px-6 py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Go to Library 📚
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentItem = feedItems[currentIndex]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-2">🧠 Your Feed</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Streak:</span>
              <span className="bg-orange-100 px-2 py-1 brutalist-border text-sm font-bold">
                🔥 {streak}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">XP:</span>
              <span className="bg-green-100 px-2 py-1 brutalist-border text-sm font-bold">
                ⭐ {xp}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleShuffle}
          className="brutalist-border brutalist-shadow bg-accent text-accent-foreground p-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-semibold mb-2">
          <span>Progress</span>
          <span>{currentIndex + 1} / {feedItems.length}</span>
        </div>
        <div className="w-full bg-gray-200 brutalist-border h-3">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / feedItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Item */}
      <div className="mb-20 md:mb-6">
        {currentItem.type === 'question' ? (
          <QuizCard
            key={currentItem.id}
            question={currentItem}
            onAnswer={handleAnswer}
          />
        ) : (
          <FlashCard
            key={currentItem.id}
            flashcard={currentItem}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      {/* Next Items Preview */}
      <div className="space-y-4 opacity-50">
        <h3 className="font-bold text-lg">Coming Up</h3>
        {feedItems.slice(currentIndex + 1, currentIndex + 4).map((item, index) => (
          <div key={item.id} className="bg-gray-50 brutalist-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-bold brutalist-border topic-${item.topic}`}>
                {item.topic.toUpperCase()}
              </span>
              <span className="text-sm font-semibold">{item.contentTitle}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {item.type === 'question' ? item.questionText : item.frontText}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}