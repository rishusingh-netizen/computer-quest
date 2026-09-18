export const LEVEL5_LESSONS = {
  'l5-word': {
    id: 'l5-word',
    title: 'Word Processing',
    summary: 'Create documents',
    xpReward: 25,
    estimatedMin: 10,
    content: '<p>Word processors help you write, format and save documents.</p>',
  },
}
export function getLevel5Lesson(id) {
  return LEVEL5_LESSONS[id] || null
}
