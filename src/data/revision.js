export const REVISION_TOPICS = [
  { id: 'hardware-basics', title: 'Hardware Basics', description: 'CPU, RAM, storage and peripherals', relatedWeak: ['hardware'] },
  { id: 'keyboard-shortcuts', title: 'Keyboard Shortcuts', description: 'Common shortcuts for productivity', relatedWeak: ['shortcuts'] },
  { id: 'file-organization', title: 'File Organization', description: 'Folders, naming and cleanup', relatedWeak: ['files'] },
  { id: 'internet-safety', title: 'Internet Safety', description: 'Passwords, phishing and safe browsing', relatedWeak: ['phishing', 'safety'] },
  { id: 'office-basics', title: 'Office Basics', description: 'Word, Excel and PowerPoint essentials', relatedWeak: ['office'] },
]

export function getRevisionTopic(id) {
  return REVISION_TOPICS.find((t) => t.id === id) || null
}
