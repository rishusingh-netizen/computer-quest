export const LEVEL9_LESSONS = {
  'l9-next-steps': {
    id: 'l9-next-steps',
    title: 'Next Steps',
    summary: 'Keep learning',
    xpReward: 30,
    estimatedMin: 8,
    content: '<p>You have built a foundation. Keep practicing and exploring new tools.</p>',
  },
}
export function getLevel9Lesson(id) {
  return LEVEL9_LESSONS[id] || null
}
