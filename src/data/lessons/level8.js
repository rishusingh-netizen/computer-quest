/** Level 8 — Programming Basics */
export const LEVEL8_LESSONS = {
  'l8-1': {
    id: 'l8-1',
    levelId: 8,
    title: 'What is Programming?',
    duration: '10 min',
    xp: 25,
    explanation: [
      'Programming means writing instructions a computer can follow to solve problems or build apps.',
      'A program is a set of steps in a programming language such as Python or JavaScript.',
      'Computers follow instructions exactly — clear logic matters.',
    ],
    examples: [
      {
        title: 'Traffic lights',
        text: 'A program could change lights on a timer.',
      },
      {
        title: 'School fee calculator',
        text: 'Inputs fees and outputs total with tax.',
      },
    ],
    keyPoints: [
      'Programs = instructions',
      'Languages express those instructions',
      'Order of steps matters',
      'Test and fix (debug)',
    ],
    tryIt: {
      title: 'Try it – Steps as a program',
      instruction: 'Write 3 ordered steps to make tea (like a program).',
      hint: 'Example: boil water → add tea → pour cup. Order matters.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Programming is:',
          options: [
            'Only drawing icons',
            'Writing instructions for computers',
            'Cleaning keyboards',
            'Replacing monitors',
          ],
          correctIndex: 1,
          explanation: 'Programming is writing instructions for computers.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A program is:',
          options: [
            'A single random click',
            'A set of instructions',
            'Only a power cable',
            'A type of printer ink',
          ],
          correctIndex: 1,
          explanation: 'A program is a set of instructions.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'If steps are in the wrong order:',
          options: [
            'Results may be wrong',
            'The monitor always breaks',
            'Wi‑Fi renames itself',
            'RAM becomes permanent',
          ],
          correctIndex: 0,
          explanation: 'Wrong order can produce wrong results.',
        },
      ],
    },
  },
  'l8-2': {
    id: 'l8-2',
    levelId: 8,
    title: 'HTML Basics',
    duration: '15 min',
    xp: 35,
    explanation: [
      'HTML (HyperText Markup Language) structures web page content with tags.',
      'Common tags: h1 for headings, p for paragraphs, a for links, img for images.',
      'HTML is the skeleton; CSS styles it; JavaScript adds behaviour.',
    ],
    examples: [
      {
        title: 'Heading',
        text: 'Use h1 for the main title of a page.',
      },
      {
        title: 'Paragraph',
        text: 'Use p for normal text blocks.',
      },
    ],
    keyPoints: [
      'Tags describe structure',
      'HTML is not a styling language',
      'Browsers display HTML',
      'Nest tags correctly',
    ],
    tryIt: {
      title: 'Try it – Mental HTML',
      instruction: 'Which tag fits a main page title — h1 or p?',
      hint: 'Main title → h1.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'HTML is used to:',
          options: [
            'Style colours only',
            'Structure web content',
            'Compile Python only',
            'Scan malware only',
          ],
          correctIndex: 1,
          explanation: 'HTML structures web content.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'The <p> tag usually marks:',
          options: [
            'A paragraph',
            'A password',
            'A printer',
            'A processor',
          ],
          correctIndex: 0,
          explanation: '<p> marks a paragraph.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'HTML, CSS and JavaScript roles:',
          options: [
            'All identical',
            'Structure, style, behaviour',
            'Only networking',
            'Only databases',
          ],
          correctIndex: 1,
          explanation: 'HTML structure, CSS style, JS behaviour.',
        },
      ],
    },
  },
  'l8-3': {
    id: 'l8-3',
    levelId: 8,
    title: 'CSS Basics',
    duration: '15 min',
    xp: 35,
    explanation: [
      'CSS (Cascading Style Sheets) controls colours, fonts, spacing and layout.',
      'Selectors target HTML elements; properties set visual rules.',
      'Example idea: make all h1 headings blue and centred.',
    ],
    examples: [
      {
        title: 'Colour',
        text: 'Set text colour with the color property.',
      },
      {
        title: 'Font size',
        text: 'Use font-size to make text larger or smaller.',
      },
    ],
    keyPoints: [
      'CSS styles HTML',
      'Selectors + properties',
      'Separation keeps design flexible',
      'Responsive design matters',
    ],
    tryIt: {
      title: 'Try it – Style choice',
      instruction: 'To change only paragraph text colour, which language — HTML or CSS?',
      hint: 'Styling is CSS.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'CSS mainly controls:',
          options: [
            'Database tables',
            'Visual style and layout',
            'CPU voltage',
            'Email SMTP only',
          ],
          correctIndex: 1,
          explanation: 'CSS controls visual style and layout.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A CSS selector:',
          options: [
            'Chooses which elements to style',
            'Deletes files',
            'Creates user accounts',
            'Formats disks',
          ],
          correctIndex: 0,
          explanation: 'Selectors choose which elements to style.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Separating CSS from HTML:',
          options: [
            'Is never useful',
            'Makes redesign easier',
            'Removes all images',
            'Disables browsers',
          ],
          correctIndex: 1,
          explanation: 'Separation makes redesign easier.',
        },
      ],
    },
  },
  'l8-4': {
    id: 'l8-4',
    levelId: 8,
    title: 'JavaScript Basics',
    duration: '18 min',
    xp: 40,
    explanation: [
      'JavaScript adds interactivity to web pages in the browser.',
      'It can respond to clicks, change text, and update content without reloading the whole page.',
      'Start simple: variables, events, and small functions.',
    ],
    examples: [
      {
        title: 'Button click',
        text: 'Show a message when a button is pressed.',
      },
      {
        title: 'Update text',
        text: 'Change a heading when the user types their name.',
      },
    ],
    keyPoints: [
      'JS runs in the browser',
      'Handles events and logic',
      'Can update the page dynamically',
      'Practice with small scripts',
    ],
    tryIt: {
      title: 'Try it – JS idea',
      instruction: 'Name one thing JS could do when a “Submit” button is clicked.',
      hint: 'Examples: check a form, show a thank-you message.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'JavaScript is mainly used to:',
          options: [
            'Only print paper',
            'Add interactivity to web pages',
            'Replace the power supply',
            'Clean dust from fans',
          ],
          correctIndex: 1,
          explanation: 'JS adds interactivity to web pages.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A button click is an example of:',
          options: [
            'An event',
            'A hard disk partition',
            'A DNS server',
            'A heat sink',
          ],
          correctIndex: 0,
          explanation: 'A click is an event.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'JS can update page content:',
          options: [
            'Never',
            'Yes, dynamically in the browser',
            'Only by replacing the CPU',
            'Only offline on paper',
          ],
          correctIndex: 1,
          explanation: 'JS can update content dynamically in the browser.',
        },
      ],
    },
  },
  'l8-5': {
    id: 'l8-5',
    levelId: 8,
    title: 'Python Basics',
    duration: '18 min',
    xp: 40,
    explanation: [
      'Python is a popular programming language known for clear, readable syntax.',
      'print() displays output; variables store values; indentation defines blocks.',
      'Python files commonly use the .py extension.',
    ],
    examples: [
      {
        title: 'Hello',
        text: 'print("Hello") shows text on the screen.',
      },
      {
        title: 'Variable',
        text: 'name = "Asha" stores a value in name.',
      },
    ],
    keyPoints: [
      'Readable syntax',
      'print for output',
      '.py file extension',
      'Indentation matters',
    ],
    tryIt: {
      title: 'Try it – Python line',
      instruction: 'What would print(2 + 3) display?',
      hint: '5',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Python is:',
          options: [
            'Only a snake diagram',
            'A popular programming language',
            'A type of GPU fan',
            'A browser only',
          ],
          correctIndex: 1,
          explanation: 'Python is a popular programming language.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'print in Python is used to:',
          options: [
            'Display output',
            'Delete folders',
            'Format BIOS',
            'Disable Wi‑Fi',
          ],
          correctIndex: 0,
          explanation: 'print displays output.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Python code is commonly saved as:',
          options: [
            '.py files',
            '.mp3 only',
            '.exe only always',
            '.bmp only',
          ],
          correctIndex: 0,
          explanation: 'Python files use .py.',
        },
      ],
    },
  },
  'l8-6': {
    id: 'l8-6',
    levelId: 8,
    title: 'Variables, Conditions, Loops, Functions',
    duration: '20 min',
    xp: 45,
    explanation: [
      'Variables store values that can change — like a labelled box.',
      'Conditions (if/else) choose different actions based on true/false tests.',
      'Loops repeat actions; functions package reusable blocks of code.',
    ],
    examples: [
      {
        title: 'Variable',
        text: 'score = 10 stores the number 10 in score.',
      },
      {
        title: 'Loop',
        text: 'Repeat “Hello” ten times with a loop instead of copying the line.',
      },
    ],
    keyPoints: [
      'Variable = named storage',
      'if/else for decisions',
      'Loops for repetition',
      'Functions for reuse',
    ],
    tryIt: {
      title: 'Try it – Choose the tool',
      instruction: 'You need to repeat “Hello” 10 times. Variable, loop, or only a condition?',
      hint: 'A loop is best for repetition.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'A variable is used to:',
          options: [
            'Store a value',
            'Cool the CPU',
            'Replace HDMI',
            'Scan fingerprints only',
          ],
          correctIndex: 0,
          explanation: 'Variables store values.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'if/else helps with:',
          options: [
            'Decisions in code',
            'Printing only once always',
            'Removing CSS',
            'Formatting disks',
          ],
          correctIndex: 0,
          explanation: 'if/else handles decisions.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Functions help you:',
          options: [
            'Reuse logic without copy-paste',
            'Avoid all practice',
            'Hide the desktop forever',
            'Disable input devices',
          ],
          correctIndex: 0,
          explanation: 'Functions let you reuse logic.',
        },
      ],
    },
  },
  'l8-7': {
    id: 'l8-7',
    levelId: 8,
    title: 'Basic Projects',
    duration: '20 min',
    xp: 45,
    explanation: [
      'Small projects combine skills: a quiz page, a tip calculator, or a personal profile page.',
      'Break projects into steps: plan → build a little → test → improve.',
      'Share code carefully — never include secrets or private keys.',
    ],
    examples: [
      {
        title: 'Tip calculator',
        text: 'Inputs bill amount and tip percent; outputs total.',
      },
      {
        title: 'Profile page',
        text: 'HTML structure + CSS style + a little JS for a greeting.',
      },
    ],
    keyPoints: [
      'Start small',
      'Test often',
      'Read error messages',
      'Save versions of your work',
    ],
    tryIt: {
      title: 'Try it – Project plan',
      instruction: 'List 3 features for a “study timer” mini project.',
      hint: 'e.g. start/stop, minutes display, alert when done.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'A good project approach is:',
          options: [
            'Build everything untested in one day with no plan',
            'Plan small steps and test often',
            'Ignore all errors',
            'Hard-code passwords in public files',
          ],
          correctIndex: 1,
          explanation: 'Plan small steps and test often.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Error messages help you:',
          options: [
            'Only panic',
            'Find and fix problems',
            'Delete Python permanently',
            'Turn off the monitor',
          ],
          correctIndex: 1,
          explanation: 'Error messages help you find and fix problems.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'In shared projects, you should:',
          options: [
            'Commit secret API keys',
            'Avoid putting secrets in code',
            'Email OTPs to the team chat publicly',
            'Disable 2FA for convenience',
          ],
          correctIndex: 1,
          explanation: 'Never expose secrets in code.',
        },
      ],
    },
  },
}
export function getLevel8Lesson(id) { return LEVEL8_LESSONS[id] || null }
