export const PRACTICE_CATEGORIES = [
  { id: 'basics', title: 'Computer Basics' },
  { id: 'office', title: 'Office Skills' },
  { id: 'internet', title: 'Internet & Safety' },
  { id: 'files', title: 'Files & System' },
]

export const PRACTICE_ACTIVITIES = [
  { id: 'hardware-id', title: 'Hardware Identification', description: 'Identify computer parts', category: 'basics', level: 1, xpReward: 20, difficulty: 'Easy', estimatedMin: 5, component: 'hardware-id' },
  { id: 'keyboard', title: 'Keyboard Practice', description: 'Learn keyboard layout and shortcuts', category: 'basics', level: 1, xpReward: 20, difficulty: 'Easy', estimatedMin: 5, component: 'keyboard' },
  { id: 'mouse', title: 'Mouse Practice', description: 'Practice mouse skills', category: 'basics', level: 1, xpReward: 15, difficulty: 'Easy', estimatedMin: 4, component: 'mouse' },
  { id: 'desktop', title: 'Desktop Simulation', description: 'Explore a simulated desktop', category: 'basics', level: 1, xpReward: 25, difficulty: 'Easy', estimatedMin: 6, component: 'desktop' },
  { id: 'file-manager', title: 'File Manager', description: 'Organize files and folders', category: 'files', level: 2, xpReward: 25, difficulty: 'Medium', estimatedMin: 7, component: 'file-manager' },
  { id: 'email', title: 'Email Compose', description: 'Write and send emails', category: 'internet', level: 2, xpReward: 20, difficulty: 'Easy', estimatedMin: 5, component: 'email' },
  { id: 'word', title: 'Word Practice', description: 'Basic word processing', category: 'office', level: 2, xpReward: 25, difficulty: 'Medium', estimatedMin: 8, component: 'word' },
  { id: 'excel', title: 'Excel Practice', description: 'Spreadsheets basics', category: 'office', level: 3, xpReward: 30, difficulty: 'Medium', estimatedMin: 8, component: 'excel' },
  { id: 'powerpoint', title: 'PowerPoint Practice', description: 'Create a simple presentation', category: 'office', level: 3, xpReward: 25, difficulty: 'Medium', estimatedMin: 7, component: 'powerpoint' },
  { id: 'phishing', title: 'Phishing Practice', description: 'Spot phishing attempts', category: 'internet', level: 3, xpReward: 30, difficulty: 'Medium', estimatedMin: 6, component: 'phishing' },
  { id: 'download-upload', title: 'Download & Upload', description: 'Safe file transfer', category: 'files', level: 2, xpReward: 20, difficulty: 'Easy', estimatedMin: 5, component: 'download-upload' },
  { id: 'zip', title: 'Zip & Extract', description: 'Compress and extract files', category: 'files', level: 2, xpReward: 20, difficulty: 'Easy', estimatedMin: 4, component: 'zip' },
  { id: 'settings', title: 'System Settings', description: 'Change common settings', category: 'basics', level: 2, xpReward: 20, difficulty: 'Easy', estimatedMin: 5, component: 'settings' },
  { id: 'design', title: 'Design Practice', description: 'Basic visual design', category: 'office', level: 3, xpReward: 25, difficulty: 'Medium', estimatedMin: 6, component: 'design' },
  { id: 'code-blocks', title: 'Code Blocks', description: 'Arrange code logic blocks', category: 'basics', level: 3, xpReward: 25, difficulty: 'Medium', estimatedMin: 6, component: 'code-blocks' },
  { id: 'prompt', title: 'Prompt Practice', description: 'Write clear AI prompts', category: 'internet', level: 3, xpReward: 20, difficulty: 'Easy', estimatedMin: 5, component: 'prompt' },
]

export function getActivityById(id) {
  return PRACTICE_ACTIVITIES.find((a) => a.id === id) || null
}
