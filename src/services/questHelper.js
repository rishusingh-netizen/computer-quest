/** Local Quest Helper — rule-based teaching replies (no live cloud AI required) */

export const HELPER_DISCLAIMER =
  'Local teaching guide. Not a live cloud AI. Answers are educational and simplified.'

const FAQ = [
  { keys: ['cpu', 'processor'], reply: 'CPU (Central Processing Unit) is the brain of the computer. It runs instructions and does calculations.' },
  { keys: ['ram', 'memory'], reply: 'RAM is temporary memory. It holds data the CPU is using right now. More RAM helps you run more programs at once.' },
  { keys: ['storage', 'ssd', 'hard disk', 'hdd'], reply: 'Storage (SSD or HDD) keeps your files permanently. SSD is faster than HDD.' },
  { keys: ['phishing'], reply: 'Phishing is a scam that tries to steal passwords or money by pretending to be a trusted company. Check the sender address and never click suspicious links.' },
  { keys: ['shortcut', 'ctrl'], reply: 'Useful shortcuts: Ctrl+C copy, Ctrl+V paste, Ctrl+X cut, Ctrl+Z undo, Ctrl+S save, Ctrl+A select all.' },
  { keys: ['folder', 'file'], reply: 'Keep files organized in folders by type or project. Use clear names so you can find things later.' },
  { keys: ['password'], reply: 'Use a long unique password. Prefer a mix of words or a password manager. Never share it by email or chat.' },
]

export function getSuggestedQuestions(context = {}) {
  return [
    'What is a CPU?',
    'How do I stay safe online?',
    'What are common keyboard shortcuts?',
    'How should I organize files?',
  ]
}

export async function generateHelperReply({ message, context, progress } = {}) {
  const q = (message || '').toLowerCase()
  if (!q.trim()) return { ok: false, error: 'Empty message', text: '' }

  for (const item of FAQ) {
    if (item.keys.some((k) => q.includes(k))) {
      return { ok: true, text: item.reply }
    }
  }

  if (progress?.weakTopics?.length) {
    return {
      ok: true,
      text: `I see topics you can improve: ${progress.weakTopics.slice(0, 3).join(', ')}. Try the Revision section for those, or ask me a specific question about one of them.`,
    }
  }

  return {
    ok: true,
    text: 'Good question! Try asking about CPU, RAM, storage, folders, passwords, phishing, or keyboard shortcuts — I can explain those in simple language.',
  }
}
