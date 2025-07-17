import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'brain-feed-app-1int74dm',
  authRequired: true
})

// Disable analytics if it's causing issues
try {
  if (blink.analytics && blink.analytics.disable) {
    blink.analytics.disable()
  }
} catch (error) {
  console.warn('Analytics not available or already disabled:', error)
}

export default blink