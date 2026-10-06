/**
 * Level 4 — Internet & Email
 * Full interactive lessons matching Levels 1–3 structure.
 */

export const LEVEL4_LESSONS = {
  'l4-1': {
    id: 'l4-1',
    levelId: 4,
    title: 'How Internet Works',
    duration: '10 min',
    xp: 25,
    explanation: [
      'The Internet is a worldwide network of computers that share information using wires, fibre, and wireless signals.',
      'When you open a website, your device asks a server for the page. The server sends the page back through many routers — like post offices passing a letter.',
      'Important words: ISP (company that gives you internet), IP address (device’s network number), website (pages stored on a server), browser (app that shows websites).',
    ],
    examples: [
      {
        title: 'Watching a video',
        text: 'Your phone requests the video from YouTube’s servers. Data travels through your Wi‑Fi router and ISP until the video plays.',
      },
      {
        title: 'School result website',
        text: 'The result pages are stored on a school or board server. Many students can open the same site at once.',
      },
    ],
    keyPoints: [
      'Internet = network of networks',
      'Browser asks → server replies',
      'Wi‑Fi / mobile data connect you to the ISP',
      'https:// means a more secure connection to the site',
    ],
    tryIt: {
      title: 'Try it – Trace a request',
      instruction:
        'Imagine you open www.example.com. Put these steps in order: (1) Server sends the page (2) Browser shows the page (3) You type the address (4) Request goes through your router/ISP.',
      hint: 'Correct order: 3 → 4 → 1 → 2.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'What does ISP stand for in everyday internet use?',
          options: [
            'Internet Service Provider',
            'Internal Screen Program',
            'Instant Save Password',
            'Input Style Panel',
          ],
          correctIndex: 0,
          explanation: 'An ISP is the company that connects your home or phone to the internet.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'When you open a website, which device usually stores and sends the page?',
          options: ['Only your mouse', 'A server on the internet', 'The printer', 'The keyboard'],
          correctIndex: 1,
          explanation: 'Websites are stored on servers that respond to browser requests.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'https:// at the start of a web address usually means:',
          options: [
            'The site cannot load images',
            'A more secure connection to the site',
            'The site is offline forever',
            'You must use Internet Explorer only',
          ],
          correctIndex: 1,
          explanation: 'HTTPS encrypts the connection between your browser and the server.',
        },
      ],
    },
  },
  'l4-2': {
    id: 'l4-2',
    levelId: 4,
    title: 'Browsers & Google Search',
    duration: '10 min',
    xp: 25,
    explanation: [
      'A browser is the app you use to open websites — Chrome, Edge, Firefox, Safari and others.',
      'The address bar is where you type a website address (URL) or a search question.',
      'Good search tips: use clear keywords, check the date of results, and open trusted sites. Do not click every ad or strange link.',
    ],
    examples: [
      {
        title: 'Search vs type URL',
        text: 'Typing “school board results” searches the web. Typing results.example.gov opens that exact site if the address is correct.',
      },
      {
        title: 'Tabs',
        text: 'Open several tabs to compare two articles without losing either page.',
      },
    ],
    keyPoints: [
      'Browser shows web pages',
      'Address bar = URL or search',
      'Tabs keep multiple pages open',
      'Bookmarks save important links',
      'Read the link before you click',
    ],
    tryIt: {
      title: 'Try it – Smart search',
      instruction:
        'Open your browser and search for “how to create a strong password”. Open one trusted result (school, government, or well-known security site) in a new tab.',
      hint: 'Prefer .gov, .edu, or known brands. Skim the URL before clicking.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Chrome and Firefox are examples of:',
          options: ['Spreadsheets', 'Web browsers', 'Printers', 'Antiviruses only'],
          correctIndex: 1,
          explanation: 'They are web browsers used to open websites.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What is the address bar used for?',
          options: [
            'Only changing wallpaper',
            'Typing a website address or search query',
            'Emptying the Recycle Bin',
            'Turning off Wi‑Fi only',
          ],
          correctIndex: 1,
          explanation: 'You type URLs or search terms in the address bar.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'A safer habit when searching is to:',
          options: [
            'Click the first ad always',
            'Check the link and prefer trusted sources',
            'Ignore the website name',
            'Download every file offered',
          ],
          correctIndex: 1,
          explanation: 'Trusted sources and careful clicks reduce risk.',
        },
      ],
    },
  },
  'l4-3': {
    id: 'l4-3',
    levelId: 4,
    title: 'Gmail – Send, Receive & Attachments',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Email lets you send messages and files to anyone with an email address.',
      'Gmail is a free email service from Google. Inbox holds new mail; Sent stores what you sent.',
      'A clear subject, correct recipient address, polite message, and careful attachments make email professional and safe.',
    ],
    examples: [
      {
        title: 'Send homework',
        text: 'Compose → To: teacher@school.edu → Subject: Maths homework → attach PDF → Send.',
      },
      {
        title: 'Attachment caution',
        text: 'Do not open unexpected .exe or strange zip files from unknown senders.',
      },
    ],
    keyPoints: [
      'To, Subject, Message, Attach, Send',
      'Check spelling of the email address',
      'Inbox = received; Sent = your outgoing mail',
      'Log out on shared computers',
      'Never share your password or OTP by email',
    ],
    tryIt: {
      title: 'Try it – Draft a message',
      instruction:
        'In Gmail (or any email), draft a message to yourself with subject “Practice email” and one short paragraph. Attach a small image or PDF if allowed, then send or save draft.',
      hint: 'Use the paperclip icon for attachments. Confirm the file size is not huge.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Where do new emails usually appear?',
          options: ['Recycle Bin only', 'Inbox', 'Desktop wallpaper', 'Task Manager'],
          correctIndex: 1,
          explanation: 'New messages arrive in the Inbox.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What should you check before clicking Send?',
          options: [
            'Only the font colour',
            'Recipient address and subject',
            'The computer’s serial number',
            'Whether Caps Lock is decorative',
          ],
          correctIndex: 1,
          explanation: 'Wrong addresses send mail to the wrong person.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'A safe attachment habit is to:',
          options: [
            'Open every file from unknown senders',
            'Avoid unexpected executable files from strangers',
            'Always enable macros from anyone',
            'Forward OTPs to friends',
          ],
          correctIndex: 1,
          explanation: 'Unexpected programs and macros can be malware.',
        },
      ],
    },
  },
  'l4-4': {
    id: 'l4-4',
    levelId: 4,
    title: 'Google Drive, Docs, Sheets & Forms',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Google Drive stores files in the cloud so you can open them from any device with your account.',
      'Google Docs is online word processing; Sheets is online spreadsheets; Forms collects answers in a form.',
      'You can share a file with view or edit access using an email address or link — choose access carefully.',
    ],
    examples: [
      {
        title: 'Group project',
        text: 'Create a Google Doc, share it with classmates as Editors, and work on the same file together.',
      },
      {
        title: 'Class survey',
        text: 'Use Google Forms to collect feedback; answers can appear in a linked Sheet.',
      },
    ],
    keyPoints: [
      'Drive = cloud folder for your files',
      'Docs ≈ Word online; Sheets ≈ Excel online',
      'Forms collect responses',
      'Sharing: Viewer vs Editor',
      'You need internet (or offline mode set up) to work',
    ],
    tryIt: {
      title: 'Try it – Create and share safely',
      instruction:
        'In Google Drive, create a Doc titled “Level 4 practice”. Type two sentences. Open Share and see Viewer vs Editor options (you do not have to share publicly).',
      hint: 'Avoid “Anyone with the link – Editor” for private homework.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Google Drive is mainly used to:',
          options: ['Print only', 'Store and open files in the cloud', 'Replace the CPU', 'Delete the OS'],
          correctIndex: 1,
          explanation: 'Drive is cloud storage for your files.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Google Sheets is most like:',
          options: ['A web browser', 'A spreadsheet program', 'A video player', 'An antivirus'],
          correctIndex: 1,
          explanation: 'Sheets is an online spreadsheet tool.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'If you share a Doc as Viewer, others can:',
          options: ['Usually only read it', 'Always delete your account', 'Change your password', 'Install software'],
          correctIndex: 0,
          explanation: 'Viewer access is for reading, not full editing.',
        },
      ],
    },
  },
  'l4-5': {
    id: 'l4-5',
    levelId: 4,
    title: 'Cloud Storage & Online Applications',
    duration: '10 min',
    xp: 25,
    explanation: [
      'Cloud storage keeps copies of files on internet servers (Drive, OneDrive, iCloud, Dropbox, etc.).',
      'Online apps run in the browser so you may not install heavy software — useful on school PCs.',
      'Benefits: access from many devices, easy sharing. Risks: need login security, be careful what you upload, log out on shared PCs.',
    ],
    examples: [
      {
        title: 'Phone to PC',
        text: 'Save a photo to Drive on your phone; open the same file later on a computer.',
      },
      {
        title: 'Shared computer',
        text: 'After using Gmail or Drive in a cyber café or library, sign out and clear the session if possible.',
      },
    ],
    keyPoints: [
      'Cloud = files on internet servers',
      'Sync keeps devices updated',
      'Strong password + 2FA when available',
      'Do not store highly sensitive secrets carelessly',
      'Log out on shared computers',
    ],
    tryIt: {
      title: 'Try it – Cloud checklist',
      instruction:
        'List three files you could safely store in cloud storage and one type of information you should not put in an unsecured shared link.',
      hint: 'Safe: school notes. Risky: passwords, OTP screenshots, bank details in a public link.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Cloud storage means your files are:',
          options: [
            'Only inside the mouse',
            'Kept on internet servers you can access with a login',
            'Printed automatically every hour',
            'Deleted every midnight always',
          ],
          correctIndex: 1,
          explanation: 'Cloud services store data on remote servers accessible via your account.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A benefit of online apps is that they often:',
          options: [
            'Require no internet ever',
            'Run in the browser with less local install',
            'Replace the need for passwords',
            'Disable all sharing',
          ],
          correctIndex: 1,
          explanation: 'Many online apps work in the browser with light or no install.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'On a shared computer you should…',
          options: [
            'Stay logged in forever',
            'Save all passwords in the browser without care',
            'Log out of accounts when finished',
            'Share your OTP publicly',
          ],
          correctIndex: 2,
          explanation: 'Logging out protects your email and cloud files on shared PCs.',
        },
      ],
    },
  },
}

export function getLevel4Lesson(id) {
  return LEVEL4_LESSONS[id] || null
}

export function getAllLevel4LessonIds() {
  return Object.keys(LEVEL4_LESSONS)
}
