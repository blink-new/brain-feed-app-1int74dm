// Enhanced content store with database integration
import blink from '../blink/client'

export interface Question {
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
  userId: string
  createdAt: string
}

export interface Flashcard {
  id: string
  contentType: 'book' | 'video'
  contentId: string
  contentTitle: string
  contentAuthor: string
  topic: string
  frontText: string
  backText: string
  userId: string
  createdAt: string
}

export interface Book {
  id: string
  title: string
  author: string
  topic: string
  description: string
  coverUrl: string
  totalQuestions: number
  totalFlashcards: number
  userId: string
  createdAt: string
}

export interface Video {
  id: string
  title: string
  author: string
  topic: string
  videoId: string
  url: string
  thumbnailUrl: string
  duration: number
  totalQuestions: number
  totalFlashcards: number
  userId: string
  createdAt: string
}

class ContentStore {
  private books: Book[] = []
  private videos: Video[] = []
  private questions: Question[] = []
  private flashcards: Flashcard[] = []
  private useDatabase = false

  constructor() {
    // Try to detect if database is available
    this.checkDatabaseAvailability()
  }

  private initializeDemoData() {
    // Add demo data immediately for in-memory storage
    const demoUserId = 'demo_user'
    
    const book: Book = {
      id: 'book_demo_1',
      title: 'Atomic Habits',
      author: 'James Clear',
      topic: 'psychology',
      description: 'A comprehensive guide to building good habits and breaking bad ones.',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
      totalQuestions: 20,
      totalFlashcards: 20,
      userId: demoUserId,
      createdAt: new Date().toISOString()
    }

    const video: Video = {
      id: 'video_demo_1',
      title: 'Top 10 Productivity Tips',
      author: 'Ali Abdaal',
      topic: 'tech',
      videoId: 'dQw4w9WgXcQ',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop',
      duration: 720,
      totalQuestions: 12,
      totalFlashcards: 10,
      userId: demoUserId,
      createdAt: new Date().toISOString()
    }

    const questions: Question[] = [
      {
        id: 'q_demo_1',
        contentType: 'book',
        contentId: book.id,
        contentTitle: 'Atomic Habits',
        contentAuthor: 'James Clear',
        topic: 'psychology',
        questionType: 'mcq',
        questionText: 'What is the main principle behind habit stacking?',
        options: [
          'Doing multiple habits at once',
          'Linking a new habit to an existing one',
          'Creating habits that stack on top of each other',
          'Building habits in a specific order'
        ],
        correctAnswer: 'Linking a new habit to an existing one',
        explanation: 'Habit stacking involves linking a new habit to an existing habit that you already do consistently.',
        userId: demoUserId,
        createdAt: new Date().toISOString()
      },
      {
        id: 'q_demo_2',
        contentType: 'video',
        contentId: video.id,
        contentTitle: 'Top 10 Productivity Tips',
        contentAuthor: 'Ali Abdaal',
        topic: 'tech',
        questionType: 'true_false',
        questionText: 'According to the video, multitasking increases productivity.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'The video explains that multitasking actually decreases productivity and focus.',
        userId: demoUserId,
        createdAt: new Date().toISOString()
      }
    ]

    const flashcards: Flashcard[] = [
      {
        id: 'f_demo_1',
        contentType: 'book',
        contentId: book.id,
        contentTitle: 'Atomic Habits',
        contentAuthor: 'James Clear',
        topic: 'psychology',
        frontText: 'What is the 1% rule?',
        backText: 'Getting 1% better every day leads to 37x improvement over a year through compound growth.',
        userId: demoUserId,
        createdAt: new Date().toISOString()
      },
      {
        id: 'f_demo_2',
        contentType: 'video',
        contentId: video.id,
        contentTitle: 'Top 10 Productivity Tips',
        contentAuthor: 'Ali Abdaal',
        topic: 'tech',
        frontText: 'What is the Pomodoro Technique?',
        backText: 'A time management method using 25-minute focused work sessions followed by 5-minute breaks.',
        userId: demoUserId,
        createdAt: new Date().toISOString()
      }
    ]

    // Add to in-memory storage
    this.books.push(book)
    this.videos.push(video)
    this.questions.push(...questions)
    this.flashcards.push(...flashcards)

    console.log('Demo data initialized for in-memory storage')
  }

  private async checkDatabaseAvailability() {
    try {
      // Try a simple query to see if database works
      await blink.db.books.list({ limit: 1 })
      this.useDatabase = true
      console.log('Database available, using persistent storage')
    } catch (error) {
      console.warn('Database not available, using in-memory storage. This is normal for demo purposes.')
      this.useDatabase = false
      // Initialize with some demo data immediately
      this.initializeDemoData()
    }
  }

  // Books
  async addBook(book: Omit<Book, 'id' | 'createdAt'>) {
    const newBook: Book = {
      ...book,
      id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }

    if (this.useDatabase) {
      try {
        await blink.db.books.create({
          id: newBook.id,
          title: newBook.title,
          author: newBook.author,
          topic: newBook.topic,
          description: newBook.description,
          coverUrl: newBook.coverUrl,
          totalQuestions: newBook.totalQuestions,
          totalFlashcards: newBook.totalFlashcards,
          userId: newBook.userId,
          createdAt: newBook.createdAt
        })
      } catch (error) {
        console.warn('Failed to save book to database, using memory:', error)
        this.useDatabase = false
      }
    }

    // Always keep in memory as backup
    this.books.push(newBook)
    return newBook
  }

  async getBooksByUser(userId: string): Promise<Book[]> {
    if (this.useDatabase) {
      try {
        const dbBooks = await blink.db.books.list({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })
        return dbBooks.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          topic: book.topic,
          description: book.description || '',
          coverUrl: book.coverUrl || '',
          totalQuestions: book.totalQuestions || 0,
          totalFlashcards: book.totalFlashcards || 0,
          userId: book.userId,
          createdAt: book.createdAt
        }))
      } catch (error) {
        console.warn('Failed to get books from database, using memory:', error)
        this.useDatabase = false
        // Re-initialize demo data if needed
        if (this.books.length === 0) {
          this.initializeDemoData()
        }
      }
    }

    // For demo purposes, return demo data for any user when database is not available
    if (!this.useDatabase) {
      // Create user-specific demo data if it doesn't exist
      const userBooks = this.books.filter(book => book.userId === userId)
      if (userBooks.length === 0 && this.books.length > 0) {
        // Clone demo data for this user
        const demoBooks = this.books.filter(book => book.userId === 'demo_user')
        const userSpecificBooks = demoBooks.map(book => ({
          ...book,
          id: `book_${userId}_${Date.now()}`,
          userId: userId
        }))
        this.books.push(...userSpecificBooks)
        return userSpecificBooks
      }
      return userBooks
    }

    return this.books.filter(book => book.userId === userId)
  }

  // Videos
  async addVideo(video: Omit<Video, 'id' | 'createdAt'>) {
    const newVideo: Video = {
      ...video,
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }

    if (this.useDatabase) {
      try {
        await blink.db.videos.create({
          id: newVideo.id,
          title: newVideo.title,
          author: newVideo.author,
          topic: newVideo.topic,
          videoId: newVideo.videoId,
          url: newVideo.url,
          thumbnailUrl: newVideo.thumbnailUrl,
          duration: newVideo.duration,
          totalQuestions: newVideo.totalQuestions,
          totalFlashcards: newVideo.totalFlashcards,
          userId: newVideo.userId,
          createdAt: newVideo.createdAt
        })
      } catch (error) {
        console.warn('Failed to save video to database, using memory:', error)
        this.useDatabase = false
      }
    }

    this.videos.push(newVideo)
    return newVideo
  }

  async getVideosByUser(userId: string): Promise<Video[]> {
    if (this.useDatabase) {
      try {
        const dbVideos = await blink.db.videos.list({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })
        return dbVideos.map(video => ({
          id: video.id,
          title: video.title,
          author: video.author,
          topic: video.topic,
          videoId: video.videoId,
          url: video.url,
          thumbnailUrl: video.thumbnailUrl || '',
          duration: video.duration || 0,
          totalQuestions: video.totalQuestions || 0,
          totalFlashcards: video.totalFlashcards || 0,
          userId: video.userId,
          createdAt: video.createdAt
        }))
      } catch (error) {
        console.warn('Failed to get videos from database, using memory:', error)
        this.useDatabase = false
        if (this.videos.length === 0) {
          this.initializeDemoData()
        }
      }
    }

    // For demo purposes, return demo data for any user when database is not available
    if (!this.useDatabase) {
      const userVideos = this.videos.filter(video => video.userId === userId)
      if (userVideos.length === 0 && this.videos.length > 0) {
        const demoVideos = this.videos.filter(video => video.userId === 'demo_user')
        const userSpecificVideos = demoVideos.map(video => ({
          ...video,
          id: `video_${userId}_${Date.now()}`,
          userId: userId
        }))
        this.videos.push(...userSpecificVideos)
        return userSpecificVideos
      }
      return userVideos
    }

    return this.videos.filter(video => video.userId === userId)
  }

  // Questions
  async addQuestions(questions: Omit<Question, 'id' | 'createdAt'>[]) {
    const newQuestions = questions.map(q => ({
      ...q,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }))

    if (this.useDatabase) {
      try {
        for (const question of newQuestions) {
          await blink.db.questions.create({
            id: question.id,
            contentType: question.contentType,
            contentId: question.contentId,
            contentTitle: question.contentTitle,
            contentAuthor: question.contentAuthor,
            topic: question.topic,
            questionType: question.questionType,
            questionText: question.questionText,
            options: JSON.stringify(question.options),
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            userId: question.userId,
            createdAt: question.createdAt
          })
        }
      } catch (error) {
        console.warn('Failed to save questions to database, using memory:', error)
        this.useDatabase = false
      }
    }

    this.questions.push(...newQuestions)
    return newQuestions
  }

  async getQuestionsByUser(userId: string): Promise<Question[]> {
    if (this.useDatabase) {
      try {
        const dbQuestions = await blink.db.questions.list({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })
        return dbQuestions.map(q => ({
          id: q.id,
          contentType: q.contentType as 'book' | 'video',
          contentId: q.contentId,
          contentTitle: q.contentTitle,
          contentAuthor: q.contentAuthor,
          topic: q.topic,
          questionType: q.questionType as Question['questionType'],
          questionText: q.questionText,
          options: JSON.parse(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          userId: q.userId,
          createdAt: q.createdAt
        }))
      } catch (error) {
        console.warn('Failed to get questions from database, using memory:', error)
        this.useDatabase = false
        if (this.questions.length === 0) {
          this.initializeDemoData()
        }
      }
    }

    // For demo purposes, return demo data for any user when database is not available
    if (!this.useDatabase) {
      const userQuestions = this.questions.filter(q => q.userId === userId)
      if (userQuestions.length === 0 && this.questions.length > 0) {
        const demoQuestions = this.questions.filter(q => q.userId === 'demo_user')
        const userSpecificQuestions = demoQuestions.map(q => ({
          ...q,
          id: `q_${userId}_${Date.now()}`,
          userId: userId
        }))
        this.questions.push(...userSpecificQuestions)
        return userSpecificQuestions
      }
      return userQuestions
    }

    return this.questions.filter(q => q.userId === userId)
  }

  // Flashcards
  async addFlashcards(flashcards: Omit<Flashcard, 'id' | 'createdAt'>[]) {
    const newFlashcards = flashcards.map(f => ({
      ...f,
      id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }))

    if (this.useDatabase) {
      try {
        for (const flashcard of newFlashcards) {
          await blink.db.flashcards.create({
            id: flashcard.id,
            contentType: flashcard.contentType,
            contentId: flashcard.contentId,
            contentTitle: flashcard.contentTitle,
            contentAuthor: flashcard.contentAuthor,
            topic: flashcard.topic,
            frontText: flashcard.frontText,
            backText: flashcard.backText,
            userId: flashcard.userId,
            createdAt: flashcard.createdAt
          })
        }
      } catch (error) {
        console.warn('Failed to save flashcards to database, using memory:', error)
        this.useDatabase = false
      }
    }

    this.flashcards.push(...newFlashcards)
    return newFlashcards
  }

  async getFlashcardsByUser(userId: string): Promise<Flashcard[]> {
    if (this.useDatabase) {
      try {
        const dbFlashcards = await blink.db.flashcards.list({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })
        return dbFlashcards.map(f => ({
          id: f.id,
          contentType: f.contentType as 'book' | 'video',
          contentId: f.contentId,
          contentTitle: f.contentTitle,
          contentAuthor: f.contentAuthor,
          topic: f.topic,
          frontText: f.frontText,
          backText: f.backText,
          userId: f.userId,
          createdAt: f.createdAt
        }))
      } catch (error) {
        console.warn('Failed to get flashcards from database, using memory:', error)
        this.useDatabase = false
        if (this.flashcards.length === 0) {
          this.initializeDemoData()
        }
      }
    }

    // For demo purposes, return demo data for any user when database is not available
    if (!this.useDatabase) {
      const userFlashcards = this.flashcards.filter(f => f.userId === userId)
      if (userFlashcards.length === 0 && this.flashcards.length > 0) {
        const demoFlashcards = this.flashcards.filter(f => f.userId === 'demo_user')
        const userSpecificFlashcards = demoFlashcards.map(f => ({
          ...f,
          id: `f_${userId}_${Date.now()}`,
          userId: userId
        }))
        this.flashcards.push(...userSpecificFlashcards)
        return userSpecificFlashcards
      }
      return userFlashcards
    }

    return this.flashcards.filter(f => f.userId === userId)
  }

  // Get all content for feed
  async getFeedItems(userId: string): Promise<(Question & { type: 'question' } | Flashcard & { type: 'flashcard' })[]> {
    const userQuestions = (await this.getQuestionsByUser(userId)).map(q => ({ ...q, type: 'question' as const }))
    const userFlashcards = (await this.getFlashcardsByUser(userId)).map(f => ({ ...f, type: 'flashcard' as const }))
    
    // Combine and shuffle
    const combined = [...userQuestions, ...userFlashcards]
    return combined.sort(() => Math.random() - 0.5)
  }

  // Clear all data (for testing)
  clear() {
    this.books = []
    this.videos = []
    this.questions = []
    this.flashcards = []
  }
}

// Export singleton instance
export const contentStore = new ContentStore()

// Demo data is now initialized immediately when database is not available