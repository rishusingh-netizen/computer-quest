export const LEVEL1_LESSONS = {
  'l1-what-is-computer': {
    id: 'l1-what-is-computer',
    title: 'What is a Computer?',
    summary: 'Introduction to computers and their uses',
    xpReward: 20,
    estimatedMin: 8,
    keyPoints: ['A computer processes data', 'Hardware vs software', 'Input and output'],
    content: '<p>A computer is an electronic device that takes input, processes data, and produces output. You use computers for learning, work, communication and entertainment.</p>',
  },
  'l1-hardware': {
    id: 'l1-hardware',
    title: 'Hardware Basics',
    summary: 'CPU, RAM, storage and devices',
    xpReward: 20,
    estimatedMin: 10,
    keyPoints: ['CPU is the brain', 'RAM is temporary memory', 'Storage keeps files'],
    content: '<p>Hardware is the physical parts of a computer: monitor, keyboard, mouse, CPU, RAM and storage.</p>',
  },
}

export function getLevel1Lesson(id) {
  return LEVEL1_LESSONS[id] || null
}
