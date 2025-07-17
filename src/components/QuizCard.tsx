import { useState } from 'react'
import { Check, X, BookOpen, Play } from 'lucide-react'

interface Question {
  id: string
  contentType: 'book' | 'video'
  contentId: string
  contentTitle: string
  contentAuthor: string
  topic: string
  questionType: 'mcq' | 'true_false' | 'match_pairs' | 'arrange_steps' | 'image_based'
  questionText: string
  options: string[]
  correctAnswer: string
  explanation: string
}

interface QuizCardProps {
  question: Question
  onAnswer: (isCorrect: boolean) => void
}

export default function QuizCard({ question, onAnswer }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return
    
    setSelectedAnswer(answer)
    setShowResult(true)
    setIsAnimating(true)
    
    const isCorrect = answer === question.correctAnswer
    
    // Trigger animation
    setTimeout(() => {
      setIsAnimating(false)
      onAnswer(isCorrect)
    }, 1000)
  }

  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <div className={`bg-white brutalist-border brutalist-shadow p-6 ${isAnimating ? (isCorrect ? 'flash-correct' : 'flash-wrong shake') : ''}`}>
      {/* Content Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          {question.contentType === 'book' ? (
            <BookOpen className="w-5 h-5 text-blue-600" />
          ) : (
            <Play className="w-5 h-5 text-red-600" />
          )}
          <span className="font-semibold text-sm">{question.contentTitle}</span>
        </div>
        <span className="text-xs text-muted-foreground">by {question.contentAuthor}</span>
      </div>

      {/* Topic Badge */}
      <div className="mb-4">
        <span className={`px-3 py-1 text-xs font-bold brutalist-border topic-${question.topic}`}>
          {question.topic.toUpperCase()}
        </span>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">{question.questionText}</h3>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isCorrectOption = option === question.correctAnswer
          
          let buttonClass = 'w-full p-4 text-left brutalist-border font-semibold transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
          
          if (showResult) {
            if (isCorrectOption) {
              buttonClass += ' bg-green-100 border-green-600'
            } else if (isSelected && !isCorrectOption) {
              buttonClass += ' bg-red-100 border-red-600'
            } else {
              buttonClass += ' bg-gray-100 opacity-50'
            }
          } else {
            buttonClass += ' bg-white hover:bg-gray-50'
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showResult}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && isCorrectOption && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <X className="w-5 h-5 text-red-600" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="bg-blue-50 brutalist-border p-4 animate-slide-up">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-600 brutalist-border flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">💡</span>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Explanation</h4>
              <p className="text-sm">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Badge */}
      {showResult && (
        <div className="mt-4 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 brutalist-border font-bold ${
            isCorrect 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isCorrect ? (
              <>
                <Check className="w-4 h-4" />
                <span>+10 XP</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                <span>Try Again!</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}