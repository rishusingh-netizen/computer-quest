/** Level 9 — Advanced Computer Skills */
export const LEVEL9_LESSONS = {
  'l9-1': {
    id: 'l9-1',
    levelId: 9,
    title: 'Computer Networking',
    duration: '15 min',
    xp: 35,
    explanation: [
      'A network connects computers so they can share data — home Wi‑Fi is a small network; the Internet is a global one.',
      'IP addresses identify devices on a network; routers forward traffic.',
      'LAN is local; WAN covers wider areas.',
    ],
    examples: [
      {
        title: 'Home Wi‑Fi',
        text: 'Phones and laptops share the same router.',
      },
      {
        title: 'School lab',
        text: 'PCs connect to a local network and then to the Internet.',
      },
    ],
    keyPoints: [
      'Network = connected devices',
      'Router directs traffic',
      'IP identifies devices',
      'LAN vs WAN',
    ],
    tryIt: {
      title: 'Try it – Home map',
      instruction: 'Name two devices on your home network and what connects them.',
      hint: 'Example: phone + laptop connected through the Wi‑Fi router.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'A network allows devices to:',
          options: [
            'Only heat up',
            'Share data and resources',
            'Replace all cables with paper',
            'Delete IP forever',
          ],
          correctIndex: 1,
          explanation: 'Networks let devices share data and resources.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A router typically:',
          options: [
            'Forwards network traffic',
            'Prints only',
            'Cools the CPU with water only',
            'Formats Word files',
          ],
          correctIndex: 0,
          explanation: 'Routers forward network traffic.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'LAN usually means:',
          options: [
            'Local Area Network',
            'Large Antenna Node',
            'Limited App Notice',
            'Logical Antivirus Name',
          ],
          correctIndex: 0,
          explanation: 'LAN means Local Area Network.',
        },
      ],
    },
  },
  'l9-2': {
    id: 'l9-2',
    levelId: 9,
    title: 'Databases & SQL',
    duration: '18 min',
    xp: 40,
    explanation: [
      'A database stores organised data so it can be searched and updated reliably.',
      'Tables hold rows (records) and columns (fields).',
      'SQL is a language to ask questions of relational databases — for example SELECT name FROM students.',
    ],
    examples: [
      {
        title: 'Student table',
        text: 'Columns: id, name, class. Each student is a row.',
      },
      {
        title: 'SQL idea',
        text: 'SELECT name FROM students WHERE class = 10;',
      },
    ],
    keyPoints: [
      'Tables + rows + columns',
      'SQL queries data',
      'Primary keys identify rows',
      'Backups matter',
    ],
    tryIt: {
      title: 'Try it – Table design',
      instruction: 'Design columns for a simple books table.',
      hint: 'Example: id, title, author, year.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'A database is used to:',
          options: [
            'Only play music',
            'Store organised data',
            'Replace the mouse',
            'Cool the GPU',
          ],
          correctIndex: 1,
          explanation: 'Databases store organised data.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'SQL is commonly used to:',
          options: [
            'Query relational databases',
            'Wash keyboards',
            'Set wallpaper only',
            'Charge batteries',
          ],
          correctIndex: 0,
          explanation: 'SQL queries relational databases.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'A table row usually represents:',
          options: [
            'One record',
            'The power cable',
            'A font file',
            'A heat pipe',
          ],
          correctIndex: 0,
          explanation: 'A row is one record.',
        },
      ],
    },
  },
  'l9-3': {
    id: 'l9-3',
    levelId: 9,
    title: 'Operating Systems & Cloud',
    duration: '15 min',
    xp: 35,
    explanation: [
      'An operating system (Windows, macOS, Linux, Android) manages hardware and runs apps.',
      'Cloud computing means using servers on the Internet for storage, apps and processing.',
      'Examples: Google Drive, online photo storage, web email.',
    ],
    examples: [
      {
        title: 'OS role',
        text: 'Windows manages files, memory and starts programs.',
      },
      {
        title: 'Cloud file',
        text: 'Save a document to Drive and open it on another device.',
      },
    ],
    keyPoints: [
      'OS manages hardware and apps',
      'Cloud = internet services',
      'Access from many devices',
      'Know what you store online',
    ],
    tryIt: {
      title: 'Try it – Cloud use',
      instruction: 'Name one cloud service you use and what you store there.',
      hint: 'Example: Google Drive for school files.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'An operating system:',
          options: [
            'Only draws wallpapers',
            'Manages hardware and runs applications',
            'Is only a browser extension',
            'Replaces electricity',
          ],
          correctIndex: 1,
          explanation: 'An OS manages hardware and runs applications.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Cloud services usually run:',
          options: [
            'Only on floppy disks',
            'On internet-connected servers',
            'Inside the mouse cable',
            'Without any login ever',
          ],
          correctIndex: 1,
          explanation: 'Cloud services run on internet-connected servers.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Google Drive is an example of:',
          options: [
            'Local only RAM',
            'Cloud storage',
            'A GPU brand',
            'A soldering tool',
          ],
          correctIndex: 1,
          explanation: 'Google Drive is cloud storage.',
        },
      ],
    },
  },
  'l9-4': {
    id: 'l9-4',
    levelId: 9,
    title: 'Cybersecurity Basics',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Cybersecurity protects systems and data from attacks and mistakes.',
      'Integrity means data is not improperly changed; availability means systems stay usable.',
      'Backups help recover after ransomware, deletion or hardware failure.',
    ],
    examples: [
      {
        title: 'Strong password',
        text: 'Long unique passwords plus 2FA reduce account takeovers.',
      },
      {
        title: 'Backup',
        text: 'Copy important files to another drive or trusted cloud.',
      },
    ],
    keyPoints: [
      'Protect systems and data',
      'Integrity and availability',
      'Backups for recovery',
      'Think before you click',
    ],
    tryIt: {
      title: 'Try it – Backup plan',
      instruction: 'List two places you could keep a backup of school work.',
      hint: 'Example: external drive + cloud folder.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Cybersecurity aims to:',
          options: [
            'Protect systems and data',
            'Remove all keyboards',
            'Ban all networks forever',
            'Delete backups weekly on purpose',
          ],
          correctIndex: 0,
          explanation: 'Cybersecurity protects systems and data.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Data integrity means:',
          options: [
            'Data is not improperly changed',
            'Screens are brighter',
            'Fans are louder',
            'Cables are shorter',
          ],
          correctIndex: 0,
          explanation: 'Integrity means data is not improperly changed.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Backups help you:',
          options: [
            'Only slow the PC',
            'Recover from attacks or mistakes',
            'Delete encryption keys randomly',
            'Disable firewalls',
          ],
          correctIndex: 1,
          explanation: 'Backups help recovery from attacks or mistakes.',
        },
      ],
    },
  },
  'l9-5': {
    id: 'l9-5',
    levelId: 9,
    title: 'Git and GitHub',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Git is version control — it tracks changes to code and files over time.',
      'A commit is a saved snapshot of changes with a message.',
      'GitHub hosts Git repositories online for collaboration and backup.',
    ],
    examples: [
      {
        title: 'Commit',
        text: 'Save progress with a message like “Add login form”.',
      },
      {
        title: 'GitHub',
        text: 'Push a project so teammates can clone and improve it.',
      },
    ],
    keyPoints: [
      'Git tracks versions',
      'Commit = snapshot',
      'GitHub hosts repos',
      'Never commit secrets',
    ],
    tryIt: {
      title: 'Try it – Commit message',
      instruction: 'Write a short commit message for adding a contact page.',
      hint: 'Example: Add contact page with form.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Git is mainly used for:',
          options: [
            'Version control of code/files',
            'Only image filters',
            'Only antivirus definitions',
            'Only Wi‑Fi passwords',
          ],
          correctIndex: 0,
          explanation: 'Git is version control for code and files.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A commit is:',
          options: [
            'A saved snapshot of changes',
            'A type of monitor',
            'A phishing email',
            'A broken router',
          ],
          correctIndex: 0,
          explanation: 'A commit is a saved snapshot of changes.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'GitHub provides:',
          options: [
            'Online hosting for Git repos',
            'Free electricity',
            'Physical keyboards only',
            'CPU water blocks',
          ],
          correctIndex: 0,
          explanation: 'GitHub hosts Git repositories online.',
        },
      ],
    },
  },
  'l9-6': {
    id: 'l9-6',
    levelId: 9,
    title: 'Web Development Overview',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Web development builds websites and web apps using HTML, CSS, JavaScript and often backend services.',
      'Frontend is what users see; backend is servers, databases and APIs.',
      'Modern apps may use frameworks, but fundamentals still matter.',
    ],
    examples: [
      {
        title: 'Frontend',
        text: 'Buttons, forms and page layout in the browser.',
      },
      {
        title: 'Backend',
        text: 'Server checks login and stores user data safely.',
      },
    ],
    keyPoints: [
      'Frontend vs backend',
      'HTTP requests fetch data',
      'APIs connect systems',
      'Fundamentals first',
    ],
    tryIt: {
      title: 'Try it – Frontend or backend?',
      instruction: 'Storing passwords securely on a server is mainly frontend or backend?',
      hint: 'Backend.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Frontend focuses on:',
          options: [
            'What users see and interact with',
            'Only power supply units',
            'Only BIOS chips',
            'Only Ethernet crimping',
          ],
          correctIndex: 0,
          explanation: 'Frontend is what users see and interact with.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A backend often includes:',
          options: [
            'Servers and databases',
            'Only CSS colours',
            'Only desktop wallpapers',
            'Only mouse DPI',
          ],
          correctIndex: 0,
          explanation: 'Backends often include servers and databases.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'HTML/CSS/JS are:',
          options: [
            'Core web fundamentals',
            'Types of RAM only',
            'Antivirus engines only',
            'Cloud GPUs only',
          ],
          correctIndex: 0,
          explanation: 'HTML, CSS and JS are core web fundamentals.',
        },
      ],
    },
  },
  'l9-7': {
    id: 'l9-7',
    levelId: 9,
    title: 'Data Analysis Basics',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Data analysis turns raw data into useful insights using sorting, filtering, charts and simple statistics.',
      'Tools include spreadsheets, Python libraries and BI dashboards.',
      'Always ask: Is the data accurate? What question are we answering?',
    ],
    examples: [
      {
        title: 'Spreadsheet',
        text: 'Filter exam scores and chart averages by subject.',
      },
      {
        title: 'Insight',
        text: 'Attendance is lower on Mondays — useful for planning.',
      },
    ],
    keyPoints: [
      'Clean data first',
      'Choose the right chart',
      'Correlation ≠ always causation',
      'Explain results simply',
    ],
    tryIt: {
      title: 'Try it – Pick a chart',
      instruction: 'Best chart to compare average marks of 5 subjects — pie of one student or bar chart of averages?',
      hint: 'Bar chart of averages.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Data analysis aims to:',
          options: [
            'Find useful insights from data',
            'Delete all CSVs',
            'Replace keyboards',
            'Heat the CPU only',
          ],
          correctIndex: 0,
          explanation: 'Data analysis finds useful insights from data.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Before charting, you should:',
          options: [
            'Ignore errors in data',
            'Clean and understand the data',
            'Shuffle columns randomly always',
            'Remove all headers',
          ],
          correctIndex: 1,
          explanation: 'Clean and understand the data first.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'A bar chart is useful to:',
          options: [
            'Compare values across categories',
            'Encrypt hard drives',
            'Configure BIOS',
            'Replace SQL',
          ],
          correctIndex: 0,
          explanation: 'Bar charts compare values across categories.',
        },
      ],
    },
  },
}
export function getLevel9Lesson(id) { return LEVEL9_LESSONS[id] || null }
