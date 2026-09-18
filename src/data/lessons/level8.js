export const LEVEL8_LESSONS = {
  'l8-safety': {
    id: 'l8-safety',
    title: 'Online Safety',
    summary: 'Passwords and phishing',
    xpReward: 25,
    estimatedMin: 10,
    content: '<p>Protect accounts with strong passwords and watch for phishing attempts.</p>',
  },
}
export function getLevel8Lesson(id) {
  return LEVEL8_LESSONS[id] || null
}
