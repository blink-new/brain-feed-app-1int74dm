import { useState } from 'react'
import { RotateCcw, BookOpen, Play, ThumbsUp, ThumbsDown } from 'lucide-react'

interface Flashcard {
  id: string
  contentType: 'book' | 'video'
  contentId: string
  contentTitle: string
  contentAuthor: string
  topic: string
  frontText: string
  backText: string
}

interface FlashCardProps {
  flashcard: Flashcard
  onAnswer: (isCorrect: boolean) => void
}

export default function FlashCard({ flashcard, onAnswer }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showRating, setShowRating] = useState(false)

  const handleFlip = () => {
    setIsFlipped(true)
    setTimeout(() => {
      setShowRating(true)
    }, 300)
  }

  const handleRating = (difficulty: 'easy' | 'hard') => {
    const isCorrect = difficulty === 'easy'
    onAnswer(isCorrect)
  }

  return (
    <div className="bg-white brutalist-border brutalist-shadow">
      {/* Content Header */}
      <div className="p-4 border-b-4 border-black">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            {flashcard.contentType === 'book' ? (
              <BookOpen className="w-5 h-5 text-blue-600" />
            ) : (
              <Play className="w-5 h-5 text-red-600" />
            )}
            <span className="font-semibold text-sm">{flashcard.contentTitle}</span>
          </div>
          <span className="text-xs text-muted-foreground">by {flashcard.contentAuthor}</span>
        </div>
        
        <span className={`px-3 py-1 text-xs font-bold brutalist-border topic-${flashcard.topic}`}>
          {flashcard.topic.toUpperCase()}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-6 min-h-[300px] flex flex-col justify-center">
        {!isFlipped ? (
          /* Front Side */
          <div className="text-center">
            <div className="mb-6">
              <span className="text-sm font-semibold text-muted-foreground mb-2 block">QUESTION</span>
              <h3 className="text-2xl font-bold">{flashcard.frontText}</h3>
            </div>
            
            <button
              onClick={handleFlip}
              className="brutalist-border brutalist-shadow bg-primary text-primary-foreground px-6 py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                <span>Reveal Answer</span>
              </div>
            </button>
          </div>
        ) : (
          /* Back Side */
          <div className="text-center animate-slide-up">
            <div className="mb-6">
              <span className="text-sm font-semibold text-muted-foreground mb-2 block">ANSWER</span>
              <p className="text-lg leading-relaxed">{flashcard.backText}</p>
            </div>
            
            {showRating && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground">How well did you know this?</p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleRating('hard')}
                    className="brutalist-border brutalist-shadow bg-red-100 text-red-800 px-4 py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-5 h-5" />
                      <span>Hard</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleRating('easy')}
                    className="brutalist-border brutalist-shadow bg-green-100 text-green-800 px-4 py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5" />
                      <span>Easy</span>
                    </div>
                  </button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Easy = +10 XP • Hard = +5 XP (will show again sooner)</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}