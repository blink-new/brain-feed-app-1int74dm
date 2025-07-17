import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { BookOpen, Play, Plus, Loader2 } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import blink from '../blink/client'
import { contentStore } from '../lib/contentStore'

interface AddContentModalProps {
  onContentAdded: () => void
}

export default function AddContentModal({ onContentAdded }: AddContentModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('book')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Book form state
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [bookTopic, setBookTopic] = useState('psychology')

  // Video form state
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTopic, setVideoTopic] = useState('tech')

  const topics = [
    { value: 'psychology', label: 'Psychology', color: 'bg-blue-600' },
    { value: 'tech', label: 'Tech/Startups', color: 'bg-orange-600' },
    { value: 'business', label: 'Business', color: 'bg-teal-600' },
    { value: 'history', label: 'History', color: 'bg-red-600' },
    { value: 'science', label: 'Science', color: 'bg-green-600' }
  ]

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookTitle.trim() || !bookAuthor.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and author",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Get current user
      const user = await blink.auth.me()
      
      // Call edge function to process book
      const response = await blink.data.fetch({
        url: 'https://1int74dm--add-book.functions.blink.new',
        method: 'POST',
        body: {
          title: bookTitle.trim(),
          author: bookAuthor.trim(),
          topic: bookTopic
        }
      })

      if (response.status === 200) {
        const result = response.body
        
        // Store book in content store
        const book = await contentStore.addBook({
          title: result.book.title,
          author: result.book.author,
          topic: result.book.topic,
          description: result.book.description || `A comprehensive guide exploring the key concepts from ${result.book.title}.`,
          coverUrl: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop&q=80&auto=format&sig=${Math.random()}`,
          totalQuestions: result.questions.length,
          totalFlashcards: result.flashcards.length,
          userId: user.id
        })

        // Store questions
        const questions = result.questions.map((q: any) => ({
          contentType: 'book' as const,
          contentId: book.id,
          contentTitle: book.title,
          contentAuthor: book.author,
          topic: book.topic,
          questionType: q.questionType,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          userId: user.id
        }))
        await contentStore.addQuestions(questions)

        // Store flashcards
        const flashcards = result.flashcards.map((f: any) => ({
          contentType: 'book' as const,
          contentId: book.id,
          contentTitle: book.title,
          contentAuthor: book.author,
          topic: book.topic,
          frontText: f.frontText,
          backText: f.backText,
          userId: user.id
        }))
        await contentStore.addFlashcards(flashcards)

        toast({
          title: "Book Added! 📚",
          description: `${bookTitle} has been processed and added to your library with ${questions.length} questions and ${flashcards.length} flashcards.`
        })
        
        // Reset form
        setBookTitle('')
        setBookAuthor('')
        setBookTopic('psychology')
        setOpen(false)
        onContentAdded()
      } else {
        throw new Error('Failed to add book')
      }
    } catch (error) {
      console.error('Error adding book:', error)
      toast({
        title: "Error",
        description: "Failed to add book. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a YouTube URL",
        variant: "destructive"
      })
      return
    }

    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Get current user
      const user = await blink.auth.me()
      
      // Call edge function to process video
      const response = await blink.data.fetch({
        url: 'https://1int74dm--add-video.functions.blink.new',
        method: 'POST',
        body: {
          url: videoUrl.trim(),
          videoId,
          topic: videoTopic
        }
      })

      if (response.status === 200) {
        const result = response.body
        
        // Store video in content store
        const video = await contentStore.addVideo({
          title: result.video.title,
          author: result.video.author,
          topic: result.video.topic,
          videoId: result.video.videoId,
          url: result.video.url,
          thumbnailUrl: result.video.thumbnail,
          duration: result.video.duration,
          totalQuestions: result.questions.length,
          totalFlashcards: result.flashcards.length,
          userId: user.id
        })

        // Store questions
        const questions = result.questions.map((q: any) => ({
          contentType: 'video' as const,
          contentId: video.id,
          contentTitle: video.title,
          contentAuthor: video.author,
          topic: video.topic,
          questionType: q.questionType,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          userId: user.id
        }))
        await contentStore.addQuestions(questions)

        // Store flashcards
        const flashcards = result.flashcards.map((f: any) => ({
          contentType: 'video' as const,
          contentId: video.id,
          contentTitle: video.title,
          contentAuthor: video.author,
          topic: video.topic,
          frontText: f.frontText,
          backText: f.backText,
          userId: user.id
        }))
        await contentStore.addFlashcards(flashcards)

        toast({
          title: "Video Added! 🎥",
          description: `Video has been processed and added to your library with ${questions.length} questions and ${flashcards.length} flashcards.`
        })
        
        // Reset form
        setVideoUrl('')
        setVideoTopic('tech')
        setOpen(false)
        onContentAdded()
      } else {
        throw new Error('Failed to add video')
      }
    } catch (error) {
      console.error('Error adding video:', error)
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="brutalist-border brutalist-shadow bg-accent text-accent-foreground px-6 py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Add Content</span>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">📚 Add Learning Content</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="book" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Book</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span>YouTube Video</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Book Title</label>
                <Input
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g., Atomic Habits"
                  className="brutalist-border"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Author</label>
                <Input
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="e.g., James Clear"
                  className="brutalist-border"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Topic</label>
                <div className="grid grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.value}
                      type="button"
                      onClick={() => setBookTopic(topic.value)}
                      disabled={loading}
                      className={`p-3 brutalist-border font-semibold text-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                        bookTopic === topic.value
                          ? `${topic.color} text-white`
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 brutalist-border p-4">
                <p className="text-sm">
                  <strong>What happens next:</strong> We'll use AI to generate 20 questions and 20 flashcards based on the book's key concepts and insights.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !bookTitle.trim() || !bookAuthor.trim()}
                className="w-full brutalist-border brutalist-shadow bg-primary text-primary-foreground py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Book...</span>
                  </div>
                ) : (
                  <span>Add Book 📚</span>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="video">
            <form onSubmit={handleVideoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">YouTube URL</label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="brutalist-border"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Topic</label>
                <div className="grid grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.value}
                      type="button"
                      onClick={() => setVideoTopic(topic.value)}
                      disabled={loading}
                      className={`p-3 brutalist-border font-semibold text-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                        videoTopic === topic.value
                          ? `${topic.color} text-white`
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 brutalist-border p-4">
                <p className="text-sm">
                  <strong>What happens next:</strong> We'll fetch the video transcript and generate 1 question + 1 flashcard for every 3 minutes of content.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !videoUrl.trim()}
                className="w-full brutalist-border brutalist-shadow bg-primary text-primary-foreground py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Video...</span>
                  </div>
                ) : (
                  <span>Add Video 🎥</span>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}