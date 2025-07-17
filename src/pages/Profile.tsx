import { Trophy, Target, Calendar, TrendingUp, Star, Flame } from 'lucide-react'

interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  xp?: number
  currentStreak?: number
}

interface ProfileProps {
  user: User
}

// Mock data for achievements and stats
const mockStats = {
  totalXP: 1250,
  currentStreak: 7,
  longestStreak: 23,
  questionsAnswered: 156,
  flashcardsReviewed: 89,
  booksCompleted: 3,
  videosCompleted: 8,
  averageAccuracy: 78,
  weeklyGoal: 100,
  weeklyProgress: 67
}

const mockAchievements = [
  {
    id: 'first-question',
    title: 'First Steps',
    description: 'Answer your first question',
    icon: '🎯',
    unlocked: true,
    unlockedAt: '2024-01-10'
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    unlocked: true,
    unlockedAt: '2024-01-17'
  },
  {
    id: 'book-master',
    title: 'Book Master',
    description: 'Complete your first book',
    icon: '📚',
    unlocked: true,
    unlockedAt: '2024-01-15'
  },
  {
    id: 'streak-30',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 'accuracy-90',
    title: 'Precision Pro',
    description: 'Achieve 90% accuracy',
    icon: '🎯',
    unlocked: false,
    unlockedAt: null
  }
]

const mockRecentActivity = [
  {
    id: '1',
    type: 'question',
    content: 'Atomic Habits - Chapter 2',
    result: 'correct',
    xp: 10,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    type: 'flashcard',
    content: 'Deep Work - Focus techniques',
    result: 'easy',
    xp: 10,
    timestamp: '3 hours ago'
  },
  {
    id: '3',
    type: 'question',
    content: 'Productivity Tips - Time blocking',
    result: 'incorrect',
    xp: 0,
    timestamp: '5 hours ago'
  }
]

export default function Profile({ user }: ProfileProps) {
  const level = Math.floor(mockStats.totalXP / 100) + 1
  const xpToNextLevel = 100 - (mockStats.totalXP % 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white brutalist-border brutalist-shadow p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary brutalist-border flex items-center justify-center">
            <span className="text-2xl font-black text-primary-foreground">
              {user.displayName?.[0] || user.email[0].toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-black mb-1">
              {user.displayName || user.email.split('@')[0]}
            </h1>
            <p className="text-muted-foreground mb-3">{user.email}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="font-bold">Level {level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="font-bold">{mockStats.currentStreak} day streak</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* XP Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold">Progress to Level {level + 1}</span>
            <span>{xpToNextLevel} XP to go</span>
          </div>
          <div className="w-full bg-gray-200 brutalist-border h-4">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-full transition-all"
              style={{ width: `${((100 - xpToNextLevel) / 100) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white brutalist-border brutalist-shadow p-4 text-center">
          <div className="text-2xl font-black text-primary mb-1">{mockStats.totalXP}</div>
          <div className="text-sm font-semibold text-muted-foreground">Total XP</div>
        </div>
        
        <div className="bg-white brutalist-border brutalist-shadow p-4 text-center">
          <div className="text-2xl font-black text-orange-600 mb-1">{mockStats.longestStreak}</div>
          <div className="text-sm font-semibold text-muted-foreground">Best Streak</div>
        </div>
        
        <div className="bg-white brutalist-border brutalist-shadow p-4 text-center">
          <div className="text-2xl font-black text-green-600 mb-1">{mockStats.averageAccuracy}%</div>
          <div className="text-sm font-semibold text-muted-foreground">Accuracy</div>
        </div>
        
        <div className="bg-white brutalist-border brutalist-shadow p-4 text-center">
          <div className="text-2xl font-black text-blue-600 mb-1">{mockStats.booksCompleted + mockStats.videosCompleted}</div>
          <div className="text-sm font-semibold text-muted-foreground">Completed</div>
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="bg-white brutalist-border brutalist-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black">Weekly Goal</h2>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold">XP Progress</span>
            <span>{mockStats.weeklyProgress}/{mockStats.weeklyGoal} XP</span>
          </div>
          <div className="w-full bg-gray-200 brutalist-border h-4">
            <div 
              className="bg-primary h-full transition-all"
              style={{ width: `${(mockStats.weeklyProgress / mockStats.weeklyGoal) * 100}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {mockStats.weeklyGoal - mockStats.weeklyProgress} XP to reach your weekly goal!
        </p>
      </div>

      {/* Achievements */}
      <div className="bg-white brutalist-border brutalist-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h2 className="text-xl font-black">Achievements</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockAchievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`p-4 brutalist-border ${
                achievement.unlocked 
                  ? 'bg-yellow-50 border-yellow-600' 
                  : 'bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      Unlocked {achievement.unlockedAt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white brutalist-border brutalist-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black">Recent Activity</h2>
        </div>
        
        <div className="space-y-3">
          {mockRecentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 brutalist-border">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  activity.result === 'correct' || activity.result === 'easy'
                    ? 'bg-green-600'
                    : 'bg-red-600'
                }`} />
                <div>
                  <p className="font-semibold text-sm">{activity.content}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-bold ${
                  activity.xp > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {activity.xp > 0 ? `+${activity.xp} XP` : 'No XP'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}