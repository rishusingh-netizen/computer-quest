export const LEVEL3_LESSONS = {
  'l3-internet': {
    id: 'l3-internet',
    title: 'Internet Basics',
    summary: 'Browse and stay safe',
    xpReward: 20,
    estimatedMin: 8,
    keyPoints: ['Browser opens websites', 'HTTPS is safer'],
    content: '<p>The internet connects computers worldwide. Use a browser and prefer HTTPS sites.</p>',
  },
}
export function getLevel3Lesson(id) {
  return LEVEL3_LESSONS[id] || null
}
