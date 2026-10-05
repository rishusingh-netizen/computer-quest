/**
 * Level 2 – Typing + Keyboard
 * Full interactive lessons matching Level 1 structure.
 */

export const LEVEL2_LESSONS = {
  'l2-1': {
    id: 'l2-1',
    levelId: 2,
    title: 'English Typing Basics',
    duration: '10 min',
    xp: 25,
    explanation: [
      'English typing means using the QWERTY keyboard to type letters, numbers and symbols in English.',
      'Each key prints one character. Hold Shift for capital letters and many symbols. The Space bar makes spaces; Enter starts a new line; Backspace deletes the character before the cursor.',
      'Good posture and looking at the screen (not only the keys) help you type faster and with fewer mistakes over time.',
    ],
    examples: [
      {
        title: 'School work',
        text: 'Typing a homework paragraph in MS Word or Google Docs is everyday English typing.',
      },
      {
        title: 'Chat and email',
        text: 'Writing a message to a friend or an email to a teacher uses the same letter keys and Space bar.',
      },
    ],
    keyPoints: [
      'QWERTY is the standard English keyboard layout',
      'Shift + letter = capital letter',
      'Space = gap between words; Enter = new line',
      'Backspace deletes; Caps Lock keeps capitals on',
      'Practice short sentences daily to build confidence',
    ],
    tryIt: {
      title: 'Try it – Type a sentence',
      instruction:
        'Open Notepad or any text box and type: “I am learning English typing on the computer.” Check spelling and spacing.',
      hint: 'Use Space between words. Use Shift for the capital “I”. Press Enter only if you want a new line.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'What does the Space bar do?',
          options: [
            'Deletes a character',
            'Creates a blank space between words',
            'Saves the file',
            'Opens the Start Menu',
          ],
          correctIndex: 1,
          explanation: 'The Space bar inserts a space so words are separated.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'How do you type a capital letter without Caps Lock?',
          options: [
            'Press Ctrl + letter',
            'Hold Shift and press the letter',
            'Press Alt + letter',
            'Double-click the letter key',
          ],
          correctIndex: 1,
          explanation: 'Shift + letter types that letter in uppercase.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'What is the standard English keyboard layout called?',
          options: ['ABCD', 'QWERTY', 'AZERTY', 'DVORAK only'],
          correctIndex: 1,
          explanation: 'Most English keyboards use the QWERTY layout.',
        },
      ],
    },
  },
  'l2-2': {
    id: 'l2-2',
    levelId: 2,
    title: 'Hindi Typing',
    duration: '12 min',
    xp: 30,
    explanation: [
      'Hindi typing on a computer usually uses Inscript, Remington (typewriter), or phonetic (Roman) keyboards.',
      'On Windows you can add Hindi as an input language and switch with Win + Space or Alt + Shift.',
      'Phonetic typing lets you type Hindi sounds using English letters (e.g. “namaste”) and the system converts them.',
    ],
    examples: [
      {
        title: 'Switch language',
        text: 'Settings → Time & Language → Language → Add Hindi, then switch the language bar to Hindi before typing.',
      },
      {
        title: 'Phonetic example',
        text: 'Typing “bharat” on a phonetic keyboard often produces भारत.',
      },
    ],
    keyPoints: [
      'Install Hindi keyboard / language pack first',
      'Win + Space switches input language on many PCs',
      'Inscript matches government exam layouts',
      'Phonetic is easier for beginners who know Roman spelling',
      'Practice both letters and matras (vowel signs)',
    ],
    tryIt: {
      title: 'Try it – Switch to Hindi',
      instruction:
        'Add Hindi input if needed, switch with Win + Space, and type your name in Hindi in Notepad.',
      hint: 'If letters stay English, the language bar is still on English — switch again and watch the language indicator.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'How do you often switch keyboard language on Windows?',
          options: ['Ctrl + Alt + Delete', 'Win + Space', 'F5', 'Ctrl + S'],
          correctIndex: 1,
          explanation: 'Win + Space cycles installed input languages.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What is phonetic Hindi typing?',
          options: [
            'Typing only numbers',
            'Typing Hindi sounds using English letters',
            'Drawing letters with the mouse',
            'Using only the number pad',
          ],
          correctIndex: 1,
          explanation: 'Phonetic layouts map Roman spellings to Hindi characters.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Which layout is common in many government exams?',
          options: ['Only QWERTY English', 'Inscript', 'Only emoji keyboard', 'Braille only'],
          correctIndex: 1,
          explanation: 'Inscript is widely used for official Hindi typing tests.',
        },
      ],
    },
  },
  'l2-3': {
    id: 'l2-3',
    levelId: 2,
    title: 'Keyboard Shortcuts',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Keyboard shortcuts let you do common actions without the mouse — faster and easier on long documents.',
      'Ctrl combinations are the most used on Windows: copy, paste, cut, undo, save, select all.',
      'Learning a small set of shortcuts every week builds real office speed.',
    ],
    examples: [
      {
        title: 'Copy and paste',
        text: 'Select text → Ctrl+C to copy → click where you want it → Ctrl+V to paste.',
      },
      {
        title: 'Undo a mistake',
        text: 'Pressed the wrong key or deleted text? Ctrl+Z undoes the last change.',
      },
    ],
    keyPoints: [
      'Ctrl+C copy · Ctrl+V paste · Ctrl+X cut',
      'Ctrl+Z undo · Ctrl+Y redo',
      'Ctrl+S save · Ctrl+A select all',
      'Ctrl+F find · Ctrl+P print',
      'Alt+Tab switches between open apps',
    ],
    tryIt: {
      title: 'Try it – Shortcut drill',
      instruction:
        'In Notepad, type two lines, select the first line, copy with Ctrl+C, paste with Ctrl+V, then undo with Ctrl+Z.',
      hint: 'Select text by dragging with the mouse or Shift+arrow keys before Ctrl+C.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Which shortcut copies selected text?',
          options: ['Ctrl+V', 'Ctrl+C', 'Ctrl+X', 'Ctrl+Z'],
          correctIndex: 1,
          explanation: 'Ctrl+C copies; Ctrl+V pastes.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What does Ctrl+S do in most apps?',
          options: ['Shut down', 'Save the file', 'Select all', 'Spell check only'],
          correctIndex: 1,
          explanation: 'Ctrl+S saves the current document.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Which shortcut undoes the last action?',
          options: ['Ctrl+Y', 'Ctrl+Z', 'Ctrl+A', 'Alt+F4'],
          correctIndex: 1,
          explanation: 'Ctrl+Z is undo on Windows.',
        },
        {
          id: 'q4',
          type: 'mcq',
          question: 'Alt+Tab is used to:',
          options: ['Delete a file', 'Switch between open applications', 'Zoom in', 'Open Task Manager only'],
          correctIndex: 1,
          explanation: 'Alt+Tab cycles through open windows.',
        },
      ],
    },
  },
  'l2-4': {
    id: 'l2-4',
    levelId: 2,
    title: 'Touch Typing',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Touch typing means typing without looking at the keyboard, using home-row finger positions.',
      'Home row for English: left hand A S D F, right hand J K L ; — thumbs rest on the Space bar.',
      'Each finger is responsible for a column of keys. Looking at the screen reduces errors once muscle memory builds.',
    ],
    examples: [
      {
        title: 'Home row drill',
        text: 'Place fingers on ASDF JKL; and type “asdf jkl;” slowly without looking down.',
      },
      {
        title: 'Reach and return',
        text: 'Type a letter above or below home row, then return fingers to home position.',
      },
    ],
    keyPoints: [
      'Home row: ASDF (left) and JKL; (right)',
      'Thumbs press Space',
      'Each finger owns nearby keys',
      'Accuracy first, then speed',
      'Short daily practice beats rare long sessions',
    ],
    tryIt: {
      title: 'Try it – Home row',
      instruction:
        'Without looking at the keys, type: “aaa sss ddd fff jjj kkk lll” then a short sentence.',
      hint: 'Feel the small bumps on F and J keys — they guide your index fingers to home row.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Where do index fingers rest on the home row?',
          options: ['A and ;', 'F and J', 'G and H only', 'Space bar only'],
          correctIndex: 1,
          explanation: 'F and J have tactile bumps for the index fingers.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What should you prioritise when learning touch typing?',
          options: ['Maximum speed only', 'Accuracy first, then speed', 'Looking at keys always', 'Using one finger only'],
          correctIndex: 1,
          explanation: 'Accurate habits scale to speed later.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Which keys are the left-hand home row?',
          options: ['QWER', 'ASDF', 'ZXCV', 'HJKL'],
          correctIndex: 1,
          explanation: 'Left hand home row is A S D F.',
        },
      ],
    },
  },
  'l2-5': {
    id: 'l2-5',
    levelId: 2,
    title: 'Typing Speed Improvement',
    duration: '12 min',
    xp: 30,
    explanation: [
      'Typing speed is measured in words per minute (WPM). Accuracy matters as much as speed.',
      'Improve by practising timed passages, fixing weak keys, and keeping a steady rhythm.',
      'Common goals for students: 20–30 WPM comfortable; 40+ WPM strong for office work.',
    ],
    examples: [
      {
        title: 'Timed practice',
        text: 'Type a 100-word paragraph for one minute, count correct words, and track WPM weekly.',
      },
      {
        title: 'Weak key focus',
        text: 'If you miss “p” or “q” often, do one-minute drills only on those keys.',
      },
    ],
    keyPoints: [
      'WPM = words typed correctly per minute',
      'Aim for high accuracy before chasing speed',
      'Warm up with home-row drills',
      'Track progress once a week',
      'Relax shoulders; avoid pounding keys',
    ],
    tryIt: {
      title: 'Try it – One-minute test',
      instruction:
        'Open a timer for 60 seconds and type a familiar paragraph. Count words and note mistakes.',
      hint: 'Do not stop to correct every error during the timed minute — note them after.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'What does WPM stand for?',
          options: ['Words Per Month', 'Words Per Minute', 'Windows Print Mode', 'Wide Page Margin'],
          correctIndex: 1,
          explanation: 'WPM is words per minute.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What is a good focus while building speed?',
          options: ['Ignore all errors', 'Accuracy first, then speed', 'Only type numbers', 'Never use home row'],
          correctIndex: 1,
          explanation: 'Accuracy builds sustainable speed.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'A practical student goal for office readiness is often around:',
          options: ['5 WPM', '40+ WPM with good accuracy', '200 WPM only', '0 WPM'],
          correctIndex: 1,
          explanation: 'Around 40 WPM with accuracy is a solid target for many roles.',
        },
      ],
    },
  },
}

export function getLevel2Lesson(id) {
  return LEVEL2_LESSONS[id] || null
}

export function getAllLevel2LessonIds() {
  return Object.keys(LEVEL2_LESSONS)
}
