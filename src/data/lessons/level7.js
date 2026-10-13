/** Level 7 — AI Tools */
export const LEVEL7_LESSONS = {
  'l7-1': {
    id: 'l7-1',
    levelId: 7,
    title: 'What is AI?',
    duration: '8 min',
    xp: 20,
    explanation: [
      'Artificial Intelligence (AI) is software that can perform tasks that often need human-like judgment — recognising patterns, generating text or images, and suggesting answers.',
      'AI learns from data and examples; it is not magic and can make mistakes.',
      'Students should verify important facts from trusted sources.',
    ],
    examples: [
      {
        title: 'Photo filters',
        text: 'Apps detect faces using trained models.',
      },
      {
        title: 'Spam filters',
        text: 'Email systems learn patterns of unwanted messages.',
      },
    ],
    keyPoints: [
      'AI pattern-matches from data',
      'Outputs can be wrong',
      'Verify important information',
      'AI is a tool, not a replacement for thinking',
    ],
    tryIt: {
      title: 'Try it – AI or not?',
      instruction: 'Is a calculator doing 2+2 “AI” in the modern sense? Why or why not?',
      hint: 'Usually no — simple fixed arithmetic rules are not modern learning-based AI.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'AI systems often:',
          options: [
            'Never use data',
            'Learn patterns from data',
            'Replace electricity',
            'Delete all files weekly',
          ],
          correctIndex: 1,
          explanation: 'AI systems learn patterns from data and examples.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'AI answers are:',
          options: [
            'Always perfect',
            'Sometimes wrong and need checking',
            'Printed only on paper',
            'Only in binary forever',
          ],
          correctIndex: 1,
          explanation: 'AI can be wrong — always verify important information.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'AI is best treated as:',
          options: [
            'A magic teacher who is never wrong',
            'A helpful tool you still supervise',
            'A replacement for all study',
            'A type of mouse',
          ],
          correctIndex: 1,
          explanation: 'Treat AI as a helpful tool you still supervise.',
        },
      ],
    },
  },
  'l7-2': {
    id: 'l7-2',
    levelId: 7,
    title: 'ChatGPT & Gemini',
    duration: '12 min',
    xp: 30,
    explanation: [
      'ChatGPT and Gemini are conversational AI assistants that respond to text prompts.',
      'Good prompts are clear: state the goal, level, and format you want.',
      'Do not paste private passwords or sensitive personal data into public AI tools.',
    ],
    examples: [
      {
        title: 'Study help',
        text: 'Ask for a simple explanation of a topic at your level.',
      },
      {
        title: 'Drafting',
        text: 'Request an outline, then edit it in your own words.',
      },
    ],
    keyPoints: [
      'Clear prompts → better answers',
      'Review and edit AI text',
      'Protect private data',
      'Use for learning, not only copying',
    ],
    tryIt: {
      title: 'Try it – better prompt',
      instruction: 'Rewrite “tell me about computers” into a clearer prompt for a Class 6 student who wants 5 bullet points.',
      hint: 'Include audience, length, and format.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'ChatGPT and Gemini are:',
          options: [
            'Printers',
            'Conversational AI assistants',
            'Types of RAM',
            'Antivirus brands only',
          ],
          correctIndex: 1,
          explanation: 'They are conversational AI assistants.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A better prompt is usually:',
          options: [
            'One vague word',
            'Clear goal, topic and format',
            'Only emojis',
            'Your bank password',
          ],
          correctIndex: 1,
          explanation: 'Clear goals and format improve answers.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'You should avoid pasting:',
          options: [
            'Public lesson questions',
            'Passwords and private personal data',
            'Chapter names',
            'Quiz topics',
          ],
          correctIndex: 1,
          explanation: 'Never paste passwords or private personal data into public AI tools.',
        },
      ],
    },
  },
  'l7-3': {
    id: 'l7-3',
    levelId: 7,
    title: 'AI Image & Video Generation',
    duration: '12 min',
    xp: 30,
    explanation: [
      'AI image tools create pictures from text descriptions (prompts).',
      'AI video tools generate or edit short clips from text or images — quality and rules vary by tool.',
      'Respect school policies and copyright; do not create harmful or deceptive deepfakes of real people.',
    ],
    examples: [
      {
        title: 'Poster idea',
        text: 'Describe subject, style, colours, and text placement.',
      },
      {
        title: 'Review',
        text: 'Check hands, text, and odd details before using an image.',
      },
    ],
    keyPoints: [
      'Describe subject, style and details',
      'Check for odd mistakes in images',
      'Follow ethics and policies',
      'Combine AI art with your own work when allowed',
    ],
    tryIt: {
      title: 'Try it – image prompt',
      instruction: 'Write a prompt for a simple school poster about cyber safety (include style and colours).',
      hint: 'Subject + style + colours + purpose.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'AI image tools generate pictures from:',
          options: [
            'Only scanner hardware',
            'Text prompts',
            'CPU fans',
            'Ink cartridges only',
          ],
          correctIndex: 1,
          explanation: 'Text prompts drive AI image generation.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Ethical use means:',
          options: [
            'Deepfaking classmates without consent',
            'Following rules and not harming others',
            'Ignoring copyright always',
            'Sharing OTPs to AI',
          ],
          correctIndex: 1,
          explanation: 'Follow rules and avoid harm.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'AI images can:',
          options: [
            'Never have mistakes',
            'Contain strange errors — always review',
            'Replace antivirus',
            'Format disks safely by themselves',
          ],
          correctIndex: 1,
          explanation: 'Always review AI images for errors.',
        },
      ],
    },
  },
  'l7-4': {
    id: 'l7-4',
    levelId: 7,
    title: 'AI Writing & Presentation Tools',
    duration: '12 min',
    xp: 30,
    explanation: [
      'AI can draft emails, summaries and slide outlines — you must edit for accuracy and your own voice.',
      'Presentation tools may suggest layouts or speaker notes; still check facts and spelling.',
      'Teachers may require disclosure when AI helped — follow classroom rules.',
    ],
    examples: [
      {
        title: 'Email draft',
        text: 'Ask for a polite request email, then personalise it.',
      },
      {
        title: 'Slide outline',
        text: 'Request 5 slide titles, then write your own speaker notes.',
      },
    ],
    keyPoints: [
      'Draft ≠ final submission',
      'Edit for truth and voice',
      'Cite or disclose if required',
      'Fact-check statistics',
    ],
    tryIt: {
      title: 'Try it – outline',
      instruction: 'List 4 slide titles for a 3-minute talk on “Strong passwords”.',
      hint: 'Intro, why it matters, tips, conclusion.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'AI writing output should be:',
          options: [
            'Submitted with zero reading',
            'Reviewed and edited by you',
            'Used to store passwords',
            'Installed as antivirus',
          ],
          correctIndex: 1,
          explanation: 'Always review and edit AI writing.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'For presentations, AI is useful to:',
          options: [
            'Replace the projector lamp',
            'Suggest outlines and structure',
            'Delete slide masters only',
            'Disable animations forever',
          ],
          correctIndex: 1,
          explanation: 'AI helps with outlines and structure.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Classroom AI use:',
          options: [
            'Ignore all teacher rules',
            'Follow school and teacher policies',
            'Always hide AI help',
            'Paste private keys',
          ],
          correctIndex: 1,
          explanation: 'Follow school and teacher policies.',
        },
      ],
    },
  },
  'l7-5': {
    id: 'l7-5',
    levelId: 7,
    title: 'Prompt Writing & Productivity',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Prompt writing is the skill of instructing AI clearly — role, task, constraints and output format.',
      'Iterate: if the answer is weak, refine the prompt with examples or stricter limits.',
      'Use AI to brainstorm, summarise and quiz yourself — still do the real learning.',
    ],
    examples: [
      {
        title: 'Role + task',
        text: '“Act as a patient tutor. Explain folders in simple words with one example.”',
      },
      {
        title: 'Self-quiz',
        text: 'Ask for 5 practice questions, answer them yourself, then check.',
      },
    ],
    keyPoints: [
      'Role + task + format',
      'Give examples when helpful',
      'Iterate on weak results',
      'Use AI to practice, not only to skip practice',
    ],
    tryIt: {
      title: 'Try it – refine',
      instruction: 'Improve the prompt “make notes” for a chapter on email safety for Class 7, 8 bullet points.',
      hint: 'Add audience, topic, format, and length.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'A strong prompt often includes:',
          options: [
            'Only one letter',
            'Task and desired format',
            'Your banking PIN',
            'Random binary',
          ],
          correctIndex: 1,
          explanation: 'Include the task and desired format.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'If AI output is weak, you should:',
          options: [
            'Accept it forever',
            'Refine the prompt and try again',
            'Throw away the computer',
            'Disable the display',
          ],
          correctIndex: 1,
          explanation: 'Refine the prompt and iterate.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Productive student use of AI:',
          options: [
            'Only copy final exams',
            'Brainstorm, summarise, self-quiz with review',
            'Share OTPs',
            'Avoid all learning',
          ],
          correctIndex: 1,
          explanation: 'Use AI to support real learning.',
        },
      ],
    },
  },
}
export function getLevel7Lesson(id) { return LEVEL7_LESSONS[id] || null }
