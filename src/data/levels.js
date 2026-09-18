/**
 * Computer Quest – Curriculum levels (data-driven)
 * Phase 0: structure + Level 1 sample. Full content in later phases.
 */

export const LEVELS = [
  {
    id: 1,
    title: 'Computer Basics',
    description: 'What a computer is, hardware vs software, and getting started.',
    icon: '💻',
    color: '#4f46e5',
    lessons: 8,
    xpReward: 100,
  },
  {
    id: 2,
    title: 'Operating System & Files',
    description: 'Windows/macOS basics, folders, files, and file management.',
    icon: '📁',
    color: '#0891b2',
    lessons: 7,
    xpReward: 120,
  },
  {
    id: 3,
    title: 'Internet & Browser',
    description: 'Browsing safely, search, downloads, and online accounts.',
    icon: '🌐',
    color: '#059669',
    lessons: 8,
    xpReward: 130,
  },
  {
    id: 4,
    title: 'Email & Communication',
    description: 'Email etiquette, attachments, and professional communication.',
    icon: '📧',
    color: '#d97706',
    lessons: 6,
    xpReward: 110,
  },
  {
    id: 5,
    title: 'Microsoft Word',
    description: 'Documents, formatting, tables, and sharing Word files.',
    icon: '📝',
    color: '#2563eb',
    lessons: 8,
    xpReward: 140,
  },
  {
    id: 6,
    title: 'Microsoft Excel',
    description: 'Spreadsheets, formulas, charts, and data basics.',
    icon: '📊',
    color: '#16a34a',
    lessons: 9,
    xpReward: 150,
  },
  {
    id: 7,
    title: 'Microsoft PowerPoint',
    description: 'Presentations, slides, design, and delivery tips.',
    icon: '📽️',
    color: '#dc2626',
    lessons: 7,
    xpReward: 130,
  },
  {
    id: 8,
    title: 'Safety & Security',
    description: 'Passwords, phishing, privacy, and safe computing habits.',
    icon: '🔒',
    color: '#7c3aed',
    lessons: 7,
    xpReward: 140,
  },
  {
    id: 9,
    title: 'AI & Future Skills',
    description: 'Using AI tools, prompting, and digital productivity.',
    icon: '🤖',
    color: '#db2777',
    lessons: 6,
    xpReward: 150,
  },
]

export function getLevel(id) {
  return LEVELS.find((l) => l.id === Number(id)) || null
}

export function getTotalLessons() {
  return LEVELS.reduce((sum, l) => sum + (l.lessons || 0), 0)
}

export function getLevelProgress(completedLessonIds, levelId) {
  // Placeholder – actual lesson IDs come from lessons data
  return { completed: 0, total: getLevel(levelId)?.lessons || 0 }
}

export default LEVELS
