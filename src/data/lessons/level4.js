export const LEVEL4_LESSONS = {
  'l4-email': {
    id: 'l4-email',
    title: 'Email Basics',
    summary: 'Send and receive email',
    xpReward: 20,
    estimatedMin: 8,
    content: '<p>Email lets you send messages and files. Use a clear subject and check the recipient address.</p>',
  },
}
export function getLevel4Lesson(id) {
  return LEVEL4_LESSONS[id] || null
}
