export const GAMES = [
  {
    id: 'shortcut-race',
    title: 'Shortcut Speed Race',
    description: 'Race the clock — hit the correct keyboard shortcuts as fast as you can.',
    instructions: 'You have 45 seconds. Press each shortcut on your keyboard when shown. Skip if stuck. Aim for speed and accuracy.',
    learnPoints: ['Ctrl+C copy', 'Ctrl+V paste', 'Ctrl+X cut', 'Ctrl+Z undo', 'Ctrl+S save', 'Ctrl+A select all'],
    difficulty: 'Medium',
    xpReward: 30,
    estimatedMin: 2,
  },
  {
    id: 'hardware-match',
    title: 'Hardware Match Memory',
    description: 'Flip cards and match hardware parts with their jobs.',
    instructions: 'Click two cards to flip them. Match each component with its function. Clear the board in as few moves as possible.',
    learnPoints: ['CPU processes', 'RAM is temporary memory', 'SSD/HDD store data', 'Input vs output devices'],
    difficulty: 'Easy',
    xpReward: 25,
    estimatedMin: 3,
  },
  {
    id: 'typing-race',
    title: 'Typing Race (WPM)',
    description: 'Type the given sentences accurately and build your words-per-minute score.',
    instructions: 'Type each prompt exactly. Mistakes reduce accuracy. Your WPM and accuracy decide the score.',
    learnPoints: ['Home row improves speed', 'Accuracy matters more than rushing', 'Practice builds muscle memory'],
    difficulty: 'Medium',
    xpReward: 35,
    estimatedMin: 3,
  },
  {
    id: 'folder-sort',
    title: 'Folder Sort Puzzle',
    description: 'Drag or tap files into the correct folders before time runs out.',
    instructions: 'Sort each file into Documents, Pictures, Music or Videos. Wrong folder loses a life. 60 seconds total.',
    learnPoints: ['Organise by file type', 'Documents for text/PDF', 'Pictures for images', 'Music and Videos have their own folders'],
    difficulty: 'Easy',
    xpReward: 25,
    estimatedMin: 2,
  },
  {
    id: 'phishing-spotter',
    title: 'Phishing Spotter',
    description: 'Spot scam emails and safe messages — protect yourself online.',
    instructions: 'Read each message. Choose Safe or Phishing. Learn the red flags after every answer.',
    learnPoints: ['Check sender address', 'Urgent threats are often scams', 'Odd links and attachments are risky', 'Banks never ask for passwords by email'],
    difficulty: 'Medium',
    xpReward: 35,
    estimatedMin: 4,
  },
]

export function getGameById(id) {
  return GAMES.find((g) => g.id === id) || null
}
