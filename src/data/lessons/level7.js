export const LEVEL7_LESSONS = {
  'l7-presentation': {
    id: 'l7-presentation',
    title: 'Presentations',
    summary: 'Slides and storytelling',
    xpReward: 25,
    estimatedMin: 10,
    content: '<p>Presentations use slides to share ideas with an audience.</p>',
  },
}
export function getLevel7Lesson(id) {
  return LEVEL7_LESSONS[id] || null
}
