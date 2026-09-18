export const TESTS = [
  {
    id: 'level1-basics',
    title: 'Level 1 — Computer Basics',
    description: 'Hardware, software, and basic operations',
    level: 1,
    questionCount: 10,
    passPercent: 60,
    xpReward: 40,
    available: true,
    questions: [],
  },
  {
    id: 'level2-files',
    title: 'Level 2 — Files & Folders',
    description: 'File management and organization',
    level: 2,
    questionCount: 10,
    passPercent: 60,
    xpReward: 40,
    available: true,
    questions: [],
  },
  {
    id: 'level3-internet',
    title: 'Level 3 — Internet & Safety',
    description: 'Browsing, email and online safety',
    level: 3,
    questionCount: 12,
    passPercent: 60,
    xpReward: 50,
    available: true,
    questions: [],
  },
]

export function getTestById(id) {
  return TESTS.find((t) => t.id === id) || null
}
