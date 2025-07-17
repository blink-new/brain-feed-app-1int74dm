import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { BookOpen, Play, Clock } from 'lucide-react'
import AddContentModal from '../components/AddContentModal'
import { contentStore, Book, Video } from '../lib/contentStore'

interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  xp?: number
  currentStreak?: number
}

interface LibraryProps {
  user: User
}

export default function Library({ user }: LibraryProps) {
  const [activeTab, setActiveTab] = useState('books')
  const [books, setBooks] = useState<Book[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  
  const loadLibraryData = useCallback(async () => {
    try {
      const userBooks = await contentStore.getBooksByUser(user.id)
      const userVideos = await contentStore.getVideosByUser(user.id)
      setBooks(userBooks)
      setVideos(userVideos)
    } catch (error) {
      console.error('Failed to load library content:', error)
    }
  }, [user.id])
  
  useEffect(() => {
    loadLibraryData()
  }, [loadLibraryData])
  
  const handleContentAdded = () => {
    // Refresh library data when new content is added
    loadLibraryData()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-2">📚 Your Library</h1>
          <p className="text-muted-foreground">
            {books.length + videos.length} items • 0 mastered
          </p>
        </div>
        
        <AddContentModal onContentAdded={handleContentAdded} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Books ({books.length})</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            <span>Videos ({videos.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4">
          {books.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No books yet</h3>
              <p className="text-muted-foreground mb-4">Add your first book to start learning!</p>
              <AddContentModal onContentAdded={handleContentAdded} />
            </div>
          ) : (
            books.map((book) => (
              <div key={book.id} className="bg-white brutalist-border brutalist-shadow p-6">
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <div className="flex-shrink-0">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-20 h-28 object-cover brutalist-border"
                    />
                  </div>
                  
                  {/* Book Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{book.title}</h3>
                        <p className="text-muted-foreground mb-2">by {book.author}</p>
                        <span className={`px-2 py-1 text-xs font-bold brutalist-border topic-${book.topic}`}>
                          {book.topic.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-semibold">Questions</span>
                          <span>0/{book.totalQuestions}</span>
                        </div>
                        <div className="w-full bg-gray-200 brutalist-border h-2">
                          <div 
                            className="bg-blue-600 h-full transition-all"
                            style={{ width: '0%' }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-semibold">Flashcards</span>
                          <span>0/{book.totalFlashcards}</span>
                        </div>
                        <div className="w-full bg-gray-200 brutalist-border h-2">
                          <div 
                            className="bg-green-600 h-full transition-all"
                            style={{ width: '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="brutalist-border bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        Continue Learning
                      </button>
                      <button className="brutalist-border bg-gray-100 px-4 py-2 font-semibold text-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-4">Add your first video to start learning!</p>
              <AddContentModal onContentAdded={handleContentAdded} />
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="bg-white brutalist-border brutalist-shadow p-6">
                <div className="flex gap-4">
                  {/* Video Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-32 h-20 object-cover brutalist-border"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-70 rounded-full p-2">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{video.title}</h3>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-muted-foreground">by {video.author}</p>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold brutalist-border topic-${video.topic}`}>
                          {video.topic.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-semibold">Questions</span>
                          <span>0/{video.totalQuestions}</span>
                        </div>
                        <div className="w-full bg-gray-200 brutalist-border h-2">
                          <div 
                            className="bg-blue-600 h-full transition-all"
                            style={{ width: '0%' }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-semibold">Flashcards</span>
                          <span>0/{video.totalFlashcards}</span>
                        </div>
                        <div className="w-full bg-gray-200 brutalist-border h-2">
                          <div 
                            className="bg-green-600 h-full transition-all"
                            style={{ width: '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="brutalist-border bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        Continue Learning
                      </button>
                      <button className="brutalist-border bg-gray-100 px-4 py-2 font-semibold text-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}