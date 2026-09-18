export const GAMES = [
  {
    id: 'typing-race',
    title: 'Typing Race',
    description: 'Improve typing speed and accuracy against the clock.',
    component: 'TypingRace',
    xpReward: 25,
    level: 1,
    icon: 'keyboard',
  },
  {
    id: 'shortcut-race',
    title: 'Shortcut Race',
    description: 'Master keyboard shortcuts under time pressure.',
    component: 'ShortcutRace',
    xpReward: 30,
    level: 2,
    icon: 'zap',
  },
  {
    id: 'folder-sort',
    title: 'Folder Sort',
    description: 'Organize files into the correct folders quickly.',
    component: 'FolderSort',
    xpReward: 20,
    level: 1,
    icon: 'folder',
  },
  {
    id: 'hardware-match',
    title: 'Hardware Match',
    description: 'Match computer parts with their names and functions.',
    component: 'HardwareMatch',
    xpReward: 25,
    level: 1,
    icon: 'cpu',
  },
  {
    id: 'phishing-spotter',
    title: 'Phishing Spotter',
    description: 'Identify suspicious emails and links before they cause harm.',
    component: 'PhishingSpotter',
    xpReward: 35,
    level: 3,
    icon: 'shield',
  },
]

export function getGame(id) {
  return GAMES.find((g) => g.id === id)
}
