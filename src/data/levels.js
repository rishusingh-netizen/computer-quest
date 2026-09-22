/**
 * Computer Quest – Curriculum levels (data-driven)
 * Phase 0: structure + Level 1 sample. Full content in later phases.
 */

export const LEVELS = [
  {
    id: 1,
    title: 'Computer Basics',
    description: 'What a computer is, hardware, software, Windows basics, files & folders.',
    icon: 'Monitor',
    color: '#4f46e5',
    lessons: [
      { id: 'l1-1', title: 'What is a Computer?', duration: '8 min', xp: 20 },
      { id: 'l1-2', title: 'Hardware and Software', duration: '10 min', xp: 25 },
      { id: 'l1-3', title: 'CPU, RAM, ROM, HDD/SSD', duration: '12 min', xp: 30 },
      { id: 'l1-4', title: 'Keyboard and Mouse', duration: '8 min', xp: 20 },
      { id: 'l1-5', title: 'Monitor, Printer, Scanner', duration: '8 min', xp: 20 },
      { id: 'l1-6', title: 'Windows Basics', duration: '10 min', xp: 25 },
      { id: 'l1-7', title: 'Desktop, Taskbar & Start Menu', duration: '10 min', xp: 25 },
      { id: 'l1-8', title: 'Files and Folders', duration: '12 min', xp: 30 },
      { id: 'l1-9', title: 'Create, Copy, Cut, Paste, Rename, Delete', duration: '15 min', xp: 35 },
      { id: 'l1-10', title: 'Download, Upload & ZIP/RAR', duration: '10 min', xp: 25 },
      { id: 'l1-11', title: 'Pen Drive & Basic Settings', duration: '8 min', xp: 20 },
    ],
  },
  {
    id: 2,
    title: 'Typing + Keyboard',
    description: 'English & Hindi typing, touch typing, shortcuts, speed improvement.',
    icon: 'Keyboard',
    color: '#0ea5e9',
    lessons: [
      { id: 'l2-1', title: 'English Typing Basics', duration: '10 min', xp: 25 },
      { id: 'l2-2', title: 'Hindi Typing', duration: '12 min', xp: 30 },
      { id: 'l2-3', title: 'Keyboard Shortcuts', duration: '15 min', xp: 35 },
      { id: 'l2-4', title: 'Touch Typing', duration: '15 min', xp: 35 },
      { id: 'l2-5', title: 'Typing Speed Improvement', duration: '12 min', xp: 30 },
    ],
  },
  {
    id: 3,
    title: 'Microsoft Office',
    description: 'MS Word, Excel and PowerPoint – from basics to professional use.',
    icon: 'FileText',
    color: '#10b981',
    lessons: [
      { id: 'l3-1', title: 'MS Word – Documents & Formatting', duration: '15 min', xp: 35 },
      { id: 'l3-2', title: 'MS Word – Tables, Images & Resume', duration: '15 min', xp: 35 },
      { id: 'l3-3', title: 'MS Excel – Rows, Columns & Data Entry', duration: '12 min', xp: 30 },
      { id: 'l3-4', title: 'MS Excel – Formulas & Functions', duration: '18 min', xp: 40 },
      { id: 'l3-5', title: 'MS Excel – Charts & Analysis', duration: '12 min', xp: 30 },
      { id: 'l3-6', title: 'MS PowerPoint – Slides & Design', duration: '15 min', xp: 35 },
      { id: 'l3-7', title: 'MS PowerPoint – Animation & Transitions', duration: '12 min', xp: 30 },
    ],
  },
  {
    id: 4,
    title: 'Internet & Email',
    description: 'How the internet works, browsers, Gmail, Google Drive & Docs.',
    icon: 'Globe',
    color: '#f59e0b',
    lessons: [
      { id: 'l4-1', title: 'How Internet Works', duration: '10 min', xp: 25 },
      { id: 'l4-2', title: 'Browsers & Google Search', duration: '10 min', xp: 25 },
      { id: 'l4-3', title: 'Gmail – Send, Receive & Attachments', duration: '15 min', xp: 35 },
      { id: 'l4-4', title: 'Google Drive, Docs, Sheets & Forms', duration: '15 min', xp: 35 },
      { id: 'l4-5', title: 'Cloud Storage & Online Applications', duration: '10 min', xp: 25 },
    ],
  },
  {
    id: 5,
    title: 'Computer Security',
    description: 'Passwords, 2FA, phishing, malware, antivirus and privacy.',
    icon: 'Shield',
    color: '#ef4444',
    lessons: [
      { id: 'l5-1', title: 'Strong Passwords & 2FA', duration: '10 min', xp: 25 },
      { id: 'l5-2', title: 'Phishing & Scam Messages', duration: '12 min', xp: 30 },
      { id: 'l5-3', title: 'Safe Downloads & Malware', duration: '12 min', xp: 30 },
      { id: 'l5-4', title: 'Antivirus & Privacy', duration: '10 min', xp: 25 },
      { id: 'l5-5', title: 'Public Wi-Fi Safety', duration: '8 min', xp: 20 },
    ],
  },
  {
    id: 6,
    title: 'Design & Creative Tools',
    description: 'Canva, Photoshop basics, photo/video editing, social creatives.',
    icon: 'Palette',
    color: '#8b5cf6',
    lessons: [
      { id: 'l6-1', title: 'Canva Basics', duration: '12 min', xp: 30 },
      { id: 'l6-2', title: 'Photoshop Basics', duration: '15 min', xp: 35 },
      { id: 'l6-3', title: 'Photo & Video Editing', duration: '15 min', xp: 35 },
      { id: 'l6-4', title: 'Graphic & Thumbnail Design', duration: '12 min', xp: 30 },
      { id: 'l6-5', title: 'Social Media Creatives', duration: '10 min', xp: 25 },
    ],
  },
  {
    id: 7,
    title: 'AI Tools',
    description: 'ChatGPT, Gemini, AI image/video, prompt writing, productivity.',
    icon: 'Sparkles',
    color: '#ec4899',
    lessons: [
      { id: 'l7-1', title: 'What is AI?', duration: '8 min', xp: 20 },
      { id: 'l7-2', title: 'ChatGPT & Gemini', duration: '12 min', xp: 30 },
      { id: 'l7-3', title: 'AI Image & Video Generation', duration: '12 min', xp: 30 },
      { id: 'l7-4', title: 'AI Writing & Presentation Tools', duration: '12 min', xp: 30 },
      { id: 'l7-5', title: 'Prompt Writing & Productivity', duration: '15 min', xp: 35 },
    ],
  },
  {
    id: 8,
    title: 'Programming Basics',
    description: 'HTML, CSS, JavaScript, Python – variables, conditions, loops, functions.',
    icon: 'Code',
    color: '#06b6d4',
    lessons: [
      { id: 'l8-1', title: 'What is Programming?', duration: '10 min', xp: 25 },
      { id: 'l8-2', title: 'HTML Basics', duration: '15 min', xp: 35 },
      { id: 'l8-3', title: 'CSS Basics', duration: '15 min', xp: 35 },
      { id: 'l8-4', title: 'JavaScript Basics', duration: '18 min', xp: 40 },
      { id: 'l8-5', title: 'Python Basics', duration: '18 min', xp: 40 },
      { id: 'l8-6', title: 'Variables, Conditions, Loops, Functions', duration: '20 min', xp: 45 },
      { id: 'l8-7', title: 'Basic Projects', duration: '20 min', xp: 45 },
    ],
  },
  {
    id: 9,
    title: 'Advanced Computer Skills',
    description: 'Networking, databases, SQL, cloud, cybersecurity, Git, web development.',
    icon: 'Cpu',
    color: '#64748b',
    lessons: [
      { id: 'l9-1', title: 'Computer Networking', duration: '15 min', xp: 35 },
      { id: 'l9-2', title: 'Databases & SQL', duration: '18 min', xp: 40 },
      { id: 'l9-3', title: 'Operating Systems & Cloud', duration: '15 min', xp: 35 },
      { id: 'l9-4', title: 'Cybersecurity Basics', duration: '15 min', xp: 35 },
      { id: 'l9-5', title: 'Git and GitHub', duration: '15 min', xp: 35 },
      { id: 'l9-6', title: 'Web Development Overview', duration: '15 min', xp: 35 },
      { id: 'l9-7', title: 'Data Analysis Basics', duration: '15 min', xp: 35 },
    ],
  },
]

export function getLevelById(id) {
  return LEVELS.find((l) => l.id === Number(id))
}

export function getLessonMeta(lessonId) {
  for (const level of LEVELS) {
    const lesson = level.lessons.find((l) => l.id === lessonId)
    if (lesson) return { ...lesson, levelId: level.id, levelTitle: level.title }
  }
  return null
}

export function getTotalLessons() {
  return LEVELS.reduce((sum, l) => sum + l.lessons.length, 0)
}
