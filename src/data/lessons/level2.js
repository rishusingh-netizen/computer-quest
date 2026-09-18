export const LEVEL2_LESSONS = {
  'l2-files': {
    id: 'l2-files',
    title: 'Files and Folders',
    summary: 'Organize your documents',
    xpReward: 20,
    estimatedMin: 8,
    keyPoints: ['Folders group files', 'Use clear names'],
    content: '<p>Files store your work. Folders help you organize files by topic or project.</p>',
  },
}
export function getLevel2Lesson(id) {
  return LEVEL2_LESSONS[id] || null
}
