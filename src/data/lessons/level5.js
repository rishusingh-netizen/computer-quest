/**
 * Level 5 — Computer Security
 * Full interactive lessons (same structure as Levels 1–4)
 */

export const LEVEL5_LESSONS = {
  'l5-1': {
    id: 'l5-1',
    levelId: 5,
    title: 'Strong Passwords & 2FA',
    duration: '10 min',
    xp: 25,
    explanation: [
      'A password is the main lock on your accounts. A strong password is long, unique, and hard for others to guess.',
      'Avoid short passwords, your name, birth year, or the same password on email, banking, and social apps. If one site is hacked, reused passwords open every other account.',
      'Two-factor authentication (2FA or MFA) adds a second step after the password — often a one-time code from your phone, an authenticator app, or a security key. Even if someone steals the password, they still need the second factor.',
      'A password manager can create and store unique passwords so you only remember one master password. Never share OTP codes with anyone who calls or messages you.',
    ],
    examples: [
      {
        title: 'Weak vs strong',
        text: 'Weak: ravi123. Stronger: a long phrase you can remember, mixed with numbers/symbols, used only for one important account.',
      },
      {
        title: 'School or bank portal',
        text: 'Turn on 2FA if the site offers it. Keep your phone lock enabled so codes stay private.',
      },
    ],
    keyPoints: [
      'Long + unique beats short common words',
      'Do not reuse important passwords',
      '2FA = password + second proof',
      'Never share OTP or authenticator codes',
    ],
    tryIt: {
      title: 'Try it – Rate the password',
      instruction:
        'Which is stronger for email: (A) name123 (B) a long unique phrase with numbers/symbols that only you use for that account?',
      hint: 'B is stronger. Length, uniqueness, and not reusing it elsewhere matter most.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'A good password should be:',
          options: [
            'Very short so you type it fast',
            'Long, unique, and hard to guess',
            'The same on every website',
            'Only your birth year',
          ],
          correctIndex: 1,
          explanation: 'Length and uniqueness make passwords much harder to crack or reuse after a leak.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What does 2FA add?',
          options: [
            'A second password written on a sticky note only',
            'A second proof of identity after the password',
            'Faster login with no security',
            'Permission to share OTP with strangers',
          ],
          correctIndex: 1,
          explanation: 'Two-factor authentication requires something you know plus something you have (or biometric).',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Someone calls and asks for the OTP from your phone. You should:',
          options: [
            'Read the code to them',
            'Refuse — never share OTP codes',
            'Send a photo of the screen',
            'Post the code in a group chat',
          ],
          correctIndex: 1,
          explanation: 'Legitimate services do not ask you to read OTPs to callers. Sharing OTP can hand over your account.',
        },
      ],
    },
  },

  'l5-2': {
    id: 'l5-2',
    levelId: 5,
    title: 'Phishing & Scam Messages',
    duration: '12 min',
    xp: 30,
    explanation: [
      'Phishing is a trick that pretends to be a trusted person or company so you reveal passwords, OTPs, or money.',
      'Scams often arrive by email, SMS, WhatsApp, or fake websites. They create urgency: “Account locked”, “You won a prize”, “Pay fine in 1 hour”.',
      'Warning signs: strange sender address, spelling mistakes, links that do not match the real company domain, requests for password/OTP, and pressure to act immediately.',
      'Safe habits: do not click suspicious links; open the official app or type the real website yourself; verify with a known phone number; report and delete obvious scams.',
    ],
    examples: [
      {
        title: 'Fake bank SMS',
        text: '“Your account will close. Click http://bank-secure-login.xyz”. Real banks rarely send login links in SMS. Use the official app instead.',
      },
      {
        title: 'Prize message',
        text: '“You won ₹50,000 — pay ₹500 processing fee.” Legitimate prizes do not ask you to pay first to receive money.',
      },
    ],
    keyPoints: [
      'Phishing steals trust, then steals data or money',
      'Urgency + unexpected links = high risk',
      'Check the real domain before entering passwords',
      'Never send OTP or card PIN to messengers',
    ],
    tryIt: {
      title: 'Try it – Spot the scam',
      instruction:
        'A message says your exam fee is unpaid and gives a short link to “pay now or seat cancelled”. What should you do first?',
      hint: 'Do not click. Verify on the official school/board site or call the known office number.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Phishing mainly tries to:',
          options: [
            'Speed up your Wi‑Fi',
            'Trick you into giving secrets or money',
            'Install free antivirus only',
            'Fix spelling in emails',
          ],
          correctIndex: 1,
          explanation: 'Phishing messages impersonate trusted sources to steal credentials, codes, or payments.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A safe response to a suspicious “account locked” email is:',
          options: [
            'Click the link in the email immediately',
            'Reply with your password',
            'Open the official site/app yourself and check',
            'Forward the link to friends to test',
          ],
          correctIndex: 2,
          explanation: 'Going through the official channel avoids fake login pages.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Which is a common phishing red flag?',
          options: [
            'A message from a known teacher in the school portal',
            'Urgent threat plus a strange link asking for OTP',
            'A calendar reminder you created',
            'An offline textbook',
          ],
          correctIndex: 1,
          explanation: 'Pressure combined with unexpected links and OTP requests is a classic scam pattern.',
        },
      ],
    },
  },

  'l5-3': {
    id: 'l5-3',
    levelId: 5,
    title: 'Safe Downloads & Malware',
    duration: '12 min',
    xp: 30,
    explanation: [
      'Malware is harmful software — viruses, ransomware, spyware, trojans — that can steal data, lock files, or spy on you.',
      'Malware often arrives through risky downloads, email attachments, cracked software, or fake “update” buttons on untrusted sites.',
      'Safe download habits: prefer official websites and app stores; avoid unknown .exe/.apk from random links; read the file name before opening; keep the system updated.',
      'If a site forces many pop-up “Download” buttons, close the page. Real updates usually come from the operating system or the official app settings.',
    ],
    examples: [
      {
        title: 'Cracked game installer',
        text: '“Free full version” from an unknown site may install malware along with the game. Use legitimate sources.',
      },
      {
        title: 'Email attachment',
        text: 'Unexpected “invoice.exe” or “resume.scr” from a stranger should not be opened.',
      },
    ],
    keyPoints: [
      'Malware = software that harms or spies',
      'Prefer official download sources',
      'Be careful with unknown executables',
      'System and browser updates close security holes',
    ],
    tryIt: {
      title: 'Try it – Choose the safer source',
      instruction:
        'You need a PDF reader. Safer choice: (A) first random result promising “crack + free” (B) the publisher’s official site or a trusted store?',
      hint: 'B is safer. Official sources reduce malware risk.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Malware is:',
          options: [
            'A type of healthy backup',
            'Harmful software that can damage or spy',
            'Only a slow internet connection',
            'A strong password tool',
          ],
          correctIndex: 1,
          explanation: 'Malware includes viruses, ransomware, spyware, and similar threats.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Safer place to get an app is usually:',
          options: [
            'A random pop-up ad',
            'Official store or publisher website',
            'An email from an unknown sender with an .exe',
            'A “crack” forum only',
          ],
          correctIndex: 1,
          explanation: 'Official stores and publishers are more carefully controlled than random downloads.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'An unexpected email attachment named payment.exe is:',
          options: [
            'Always safe if the subject says “invoice”',
            'Risky — do not open without verification',
            'Required by every school',
            'A type of antivirus',
          ],
          correctIndex: 1,
          explanation: 'Executable attachments from unexpected senders are a common malware path.',
        },
      ],
    },
  },

  'l5-4': {
    id: 'l5-4',
    levelId: 5,
    title: 'Antivirus & Privacy',
    duration: '10 min',
    xp: 25,
    explanation: [
      'Antivirus / security software helps detect and block known malware. Keep it updated and run scans when something feels wrong. Built-in tools (like Windows Security) matter too.',
      'Privacy means controlling who sees your personal information: full name, phone, address, photos, ID numbers, and location.',
      'Practical privacy steps: review app permissions; limit what you post publicly; use privacy settings on social apps; avoid oversharing on unknown websites; lock your device.',
      'On shared or public computers, use private/incognito only as a light helper — still log out of accounts and never save passwords there.',
    ],
    examples: [
      {
        title: 'App permissions',
        text: 'A simple calculator app does not need constant access to your contacts and microphone. Deny unnecessary permissions.',
      },
      {
        title: 'Social post',
        text: 'Posting your home address and daily routine publicly can help strangers track you. Share carefully.',
      },
    ],
    keyPoints: [
      'Keep security tools and the OS updated',
      'Personal data is valuable — share less by default',
      'Check app permissions',
      'Lock devices and log out on shared PCs',
    ],
    tryIt: {
      title: 'Try it – Privacy choice',
      instruction:
        'A new free flashlight app asks for Contacts, SMS, and Location. What should you consider before installing?',
      hint: 'Ask whether those permissions are needed. If not, refuse install or deny permissions.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Antivirus software mainly helps by:',
          options: [
            'Making documents longer',
            'Detecting and blocking many malware threats',
            'Replacing the need for any password',
            'Turning off the internet forever',
          ],
          correctIndex: 1,
          explanation: 'Security software scans for and helps stop malicious programs.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A good privacy habit is:',
          options: [
            'Posting your ID card photo publicly',
            'Reviewing app permissions and limiting public posts',
            'Sharing OTP in group chats',
            'Using the same PIN on every device and writing it on the laptop',
          ],
          correctIndex: 1,
          explanation: 'Limiting data exposure and checking permissions reduces privacy risk.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'On a cybercafe computer you should:',
          options: [
            'Stay logged into email and save passwords',
            'Log out of accounts when finished',
            'Disable the screen lock on your own phone permanently',
            'Install random toolbars for “speed”',
          ],
          correctIndex: 1,
          explanation: 'Logging out protects your accounts on machines other people use.',
        },
      ],
    },
  },

  'l5-5': {
    id: 'l5-5',
    levelId: 5,
    title: 'Public Wi-Fi Safety',
    duration: '8 min',
    xp: 20,
    explanation: [
      'Public Wi‑Fi (cafes, stations, free hotspots) is convenient but riskier because you do not control the network.',
      'Risks include fake hotspots with similar names, eavesdropping on unencrypted traffic, and malicious portals that ask for unnecessary personal data.',
      'Safer habits: prefer mobile data for banking and important logins; confirm the correct network name with staff; avoid auto-joining open networks; log out after use; use HTTPS sites (padlock in the browser).',
      'A VPN can encrypt traffic on untrusted networks, but basic caution still matters. Never ignore browser warnings about unsafe sites just because Wi‑Fi is free.',
    ],
    examples: [
      {
        title: 'Fake hotspot',
        text: 'Networks named “Free_Airport_WiFi” or “Cafe_Guest_1” may be set up by attackers. Ask staff for the exact name.',
      },
      {
        title: 'Banking on open Wi‑Fi',
        text: 'If you must bank while out, mobile data is usually safer than unknown open Wi‑Fi.',
      },
    ],
    keyPoints: [
      'Public Wi‑Fi is convenient, not always trustworthy',
      'Confirm network names; avoid random open SSIDs',
      'Sensitive tasks prefer mobile data or trusted networks',
      'Look for HTTPS and avoid odd login portals',
    ],
    tryIt: {
      title: 'Try it – Network choice',
      instruction:
        'You need to check bank balance at a cafe. Safer option: (A) first open Wi‑Fi that appears (B) mobile data or a network name confirmed with staff?',
      hint: 'B is safer for sensitive accounts.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Public Wi‑Fi is often riskier because:',
          options: [
            'It is always faster than home internet',
            'You do not control who runs the network',
            'It blocks all websites',
            'It forces 2FA off',
          ],
          correctIndex: 1,
          explanation: 'Unknown operators and users on the same network increase risk.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'For banking on the go, a safer choice is usually:',
          options: [
            'Any free open hotspot with a similar name',
            'Mobile data or a verified trusted network',
            'A random USB “Wi‑Fi booster” from a stranger',
            'Turning off all passwords',
          ],
          correctIndex: 1,
          explanation: 'Mobile data and verified networks reduce exposure to fake hotspots.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Auto-joining unknown open networks:',
          options: [
            'Is always the safest setting',
            'Can connect you to malicious hotspots — better turn it off',
            'Forces 2FA off',
            'Increases battery only with no risk',
          ],
          correctIndex: 1,
          explanation: 'Auto-join can attach your device to untrusted or fake networks without your review.',
        },
      ],
    },
  },
}

export function getLevel5Lesson(id) {
  return LEVEL5_LESSONS[id] || null
}

export function getAllLevel5LessonIds() {
  return Object.keys(LEVEL5_LESSONS)
}
