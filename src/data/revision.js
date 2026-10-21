/** Revision topics — real notes, key points, tips, mini quizzes */
export const REVISION_TOPICS = [
  {
    id: 'hardware-basics',
    title: 'Hardware Basics',
    description: 'CPU, RAM, storage and peripherals',
    level: 1,
    levelTitle: 'Computer Basics',
    matchTopics: ['Hardware and Software', 'CPU RAM Storage'],
    summary: 'Hardware is physical parts; software is programs. CPU processes; RAM is temporary; SSD/HDD store files permanently.',
    keyPoints: [
      'Hardware = parts you can touch',
      'Software = programs and the OS',
      'CPU = brain · RAM = temporary · SSD/HDD = permanent storage',
    ],
    commonMistakes: ['Calling Word hardware', 'Thinking RAM keeps files after shutdown'],
    tip: 'If you can drop it on the floor, it is probably hardware.',
    quiz: [
      { q: 'Which is software?', options: ['Keyboard', 'Microsoft Word', 'Monitor'], correctIndex: 1, explanation: 'Word is a program (software).' },
      { q: 'Which is temporary memory?', options: ['SSD', 'HDD', 'RAM'], correctIndex: 2, explanation: 'RAM clears when power is off.' },
    ],
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Common shortcuts for productivity',
    level: 2,
    levelTitle: 'Typing + Keyboard',
    matchTopics: ['English Typing', 'Keyboard Shortcuts', 'Shortcuts'],
    summary: 'Shift for capitals, Space between words. Core shortcuts: Ctrl+C/V/X/Z/S/A. Alt+Tab switches apps.',
    keyPoints: ['Shift + letter = capital', 'Ctrl+C copy · Ctrl+V paste · Ctrl+S save', 'Alt+Tab switches windows'],
    commonMistakes: ['Using Caps Lock for every capital', 'Forgetting Ctrl+S'],
    tip: 'Learn six shortcuts first: C V X Z S A with Ctrl.',
    quiz: [
      { q: 'Ctrl+S means:', options: ['Select all', 'Save', 'Search only'], correctIndex: 1, explanation: 'Ctrl+S saves the file.' },
      { q: 'Space bar creates:', options: ['A new file', 'A blank between words', 'A chart'], correctIndex: 1, explanation: 'Space separates words.' },
    ],
  },
  {
    id: 'file-organization',
    title: 'File Organization',
    description: 'Folders, naming and cleanup',
    level: 1,
    levelTitle: 'Computer Basics',
    matchTopics: ['Files and Folders', 'File Operations', 'Windows Basics'],
    summary: 'Folders group files. Copy keeps the original; Cut moves. Desktop, Documents and Downloads are common locations.',
    keyPoints: ['Folders organize related files', 'Ctrl+C copy · Ctrl+V paste · Delete removes', 'Clear names help you find files later'],
    commonMistakes: ['Saving everything on Desktop', 'Vague names like file1.docx'],
    tip: 'Name folders by purpose: School, Work, Photos.',
    quiz: [
      { q: 'A folder is used to:', options: ['Cool the laptop', 'Organize related files', 'Replace RAM'], correctIndex: 1, explanation: 'Folders group files.' },
      { q: 'Ctrl+C usually:', options: ['Pastes', 'Copies', 'Deletes'], correctIndex: 1, explanation: 'Ctrl+C copies.' },
    ],
  },
  {
    id: 'internet-safety',
    title: 'Internet Safety',
    description: 'Passwords, phishing and safe browsing',
    level: 5,
    levelTitle: 'Computer Security',
    matchTopics: ['Phishing', 'Passwords 2FA', 'Privacy', 'Malware'],
    summary: 'Strong unique passwords and 2FA protect accounts. Phishing pretends to be trusted to steal logins. Avoid suspicious links.',
    keyPoints: ['Long unique passwords', '2FA adds a second check', 'Phishing steals trust — verify the sender'],
    commonMistakes: ['Reusing one password everywhere', 'Clicking urgent “verify account” links'],
    tip: 'If a message rushes you to click, pause and verify.',
    quiz: [
      { q: 'A strong password should be:', options: ['Long and unique', 'Always 123456', 'Your name only'], correctIndex: 0, explanation: 'Long unique passwords are stronger.' },
      { q: 'Phishing mainly tries to:', options: ['Cool your CPU', 'Steal passwords or money', 'Speed up Wi-Fi'], correctIndex: 1, explanation: 'Phishing is social engineering fraud.' },
    ],
  },
  {
    id: 'office-basics',
    title: 'Office Basics',
    description: 'Word, Excel and PowerPoint essentials',
    level: 3,
    levelTitle: 'Microsoft Office',
    matchTopics: ['Word', 'Excel', 'PowerPoint'],
    summary: 'Word for documents, Excel for numbers and charts, PowerPoint for slides. Bold with Ctrl+B; Excel formulas start with =.',
    keyPoints: ['Word = text documents', 'Excel = cells, formulas, charts', 'PowerPoint = slides for presenting'],
    commonMistakes: ['Starting Excel formulas without =', 'Too much text on one slide'],
    tip: 'One idea per slide; one formula starts with =.',
    quiz: [
      { q: 'Excel formulas start with:', options: ['#', '=', '@'], correctIndex: 1, explanation: 'Formulas begin with =.' },
      { q: 'Ctrl+B usually applies:', options: ['Bold', 'Save', 'Paste'], correctIndex: 0, explanation: 'Ctrl+B toggles bold.' },
    ],
  },
]

export function getRevisionTopic(id) {
  const t = REVISION_TOPICS.find((x) => x.id === id) || null
  if (!t) return null
  return { ...t, description: t.description || t.summary || '' }
}

export function getAllRevisionTopics() {
  return REVISION_TOPICS.map((t) => ({ ...t, description: t.description || t.summary || '' }))
}

export function analyzeRevisionTopics(progress = {}) {
  const { revisionScores = {}, weakTopics = [], completedLessons = [] } = progress
  const weakSet = new Set(weakTopics || [])
  return REVISION_TOPICS.map((topic) => {
    const matchedWeak = (topic.matchTopics || []).some((m) => weakSet.has(m))
    const rev = revisionScores[topic.id]
    const revised = !!(rev && (rev.attempts || 0) > 0)
    return {
      ...topic,
      learned: (topic.lessonIds || []).some((id) => completedLessons.includes(id)),
      recentlyLearned: false,
      isWeak: matchedWeak,
      revised,
      status: matchedWeak ? 'weak' : revised ? 'revised' : 'available',
      accuracy: rev?.accuracy ?? null,
      lastScore: rev?.lastScore ?? null,
      lastTotal: rev?.lastTotal ?? null,
      attempts: rev?.attempts || 0,
      lessonsDone: 0,
      lessonsTotal: (topic.lessonIds || []).length,
    }
  })
}
