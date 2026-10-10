import {
  LEVEL5_QUESTIONS,
  LEVEL6_QUESTIONS,
  LEVEL7_QUESTIONS,
  LEVEL8_QUESTIONS,
  LEVEL9_QUESTIONS,
} from './testsLevels5to9.js'

/** Level / topic tests — data-driven question banks. */
export const TESTS = [
  {
    id: 'level1-basics',
    title: 'Level 1 — Computer Basics Test',
    description: 'Covers Level 1 lessons: hardware, software, Windows, files and settings.',
    level: 1,
    questionCount: 15,
    timeLimitSec: 15 * 60,
    passPercent: 60,
    xpReward: 50,
    topics: ['What is a Computer', 'Hardware and Software', 'CPU RAM Storage', 'Windows Basics', 'Files and Folders'],
  },
  {
    id: 'level2-typing',
    title: 'Level 2 — Typing + Keyboard Test',
    description: 'Typing basics, shortcuts and speed ideas.',
    level: 2,
    questionCount: 12,
    timeLimitSec: 12 * 60,
    passPercent: 60,
    xpReward: 50,
    topics: ['English Typing', 'Hindi Typing', 'Shortcuts', 'Touch Typing'],
  },
  {
    id: 'level3-office',
    title: 'Level 3 — Microsoft Office Test',
    description: 'Word, Excel and PowerPoint basics.',
    level: 3,
    questionCount: 15,
    timeLimitSec: 15 * 60,
    passPercent: 60,
    xpReward: 50,
    topics: ['Word', 'Excel', 'PowerPoint'],
  },
  {
    id: 'level4-internet',
    title: 'Level 4 — Internet & Email Test',
    description: 'Browsers, search, Gmail and cloud basics.',
    level: 4,
    questionCount: 12,
    timeLimitSec: 12 * 60,
    passPercent: 60,
    xpReward: 50,
    topics: ['Internet', 'Browsers', 'Gmail', 'Drive'],
  },
  {
    id: 'level5-security',
    title: 'Level 5 — Computer Security Test',
    description: 'Passwords, phishing, malware and privacy.',
    level: 5,
    questionCount: 10,
    timeLimitSec: 12 * 60,
    passPercent: 60,
    xpReward: 50,
    topics: ['Passwords 2FA', 'Phishing', 'Malware', 'Privacy', 'Public Wi-Fi'],
  },
  {
    id: 'level6-design',
    title: 'Level 6 — Design Tools Test',
    description: 'Canva, Photoshop concepts, editing and social creatives.',
    level: 6,
    questionCount: 10,
    timeLimitSec: 12 * 60,
    passPercent: 60,
    xpReward: 50,
    topics: ['Canva', 'Photoshop', 'Editing', 'Thumbnails', 'Social'],
  },
  {
    id: 'level7-ai',
    title: 'Level 7 — AI Tools Test',
    description: 'AI basics, chat tools, media generation and prompts.',
    level: 7,
    available: false,
    questionCount: 10,
    timeLimitSec: 12 * 60,
    passPercent: 60,
    xpReward: 50,
    topics: ['What is AI', 'Chat tools', 'AI media', 'Writing tools', 'Prompts'],
  },
  {
    id: 'level8-programming',
    title: 'Level 8 — Programming Basics Test',
    description: 'HTML, CSS, JavaScript, Python and core programming ideas.',
    level: 8,
    available: false,
    questionCount: 12,
    timeLimitSec: 15 * 60,
    xpReward: 55,
    passPercent: 60,
    topics: ['Programming', 'HTML', 'CSS', 'JavaScript', 'Python', 'Logic'],
  },
  {
    id: 'level9-advanced',
    title: 'Level 9 — Advanced Skills Test',
    description: 'Networking, databases, cloud, security, Git and data analysis.',
    level: 9,
    available: false,
    questionCount: 12,
    timeLimitSec: 15 * 60,
    passPercent: 60,
    xpReward: 55,
    topics: ['Networking', 'Databases', 'Cloud', 'Cybersecurity', 'Git', 'Web', 'Data'],
  },
]

export const LEVEL1_QUESTIONS = [
  { id: 'l1q1', topic: 'What is a Computer', type: 'mcq', question: 'A computer mainly works by following which cycle?', options: ['Input → Process → Output → Storage', 'Output → Input → Storage only', 'Storage → Delete → Restart', 'Print → Scan → Copy'], correctIndex: 0, explanation: 'The basic cycle is input, process, output and storage.' },
  { id: 'l1q2', topic: 'Hardware and Software', type: 'mcq', question: 'Hardware refers to:', options: ['Physical parts you can touch', 'Only mobile apps', 'Only internet browsers', 'Only passwords'], correctIndex: 0, explanation: 'Hardware is the physical equipment.' },
  { id: 'l1q3', topic: 'Hardware and Software', type: 'mcq', question: 'Software is:', options: ['Programs and instructions', 'Only the monitor glass', 'Only the power cable', 'Only the mouse pad'], correctIndex: 0, explanation: 'Software is the set of programs.' },
  { id: 'l1q4', topic: 'CPU RAM Storage', type: 'mcq', question: 'RAM is mainly used for:', options: ['Temporary working memory', 'Permanent long-term archive only', 'Printing pages', 'Cooling the CPU'], correctIndex: 0, explanation: 'RAM holds active work temporarily.' },
  { id: 'l1q5', topic: 'CPU RAM Storage', type: 'mcq', question: 'An SSD compared to an old HDD is usually:', options: ['Faster for many tasks', 'Always slower', 'Unable to store files', 'Only for printers'], correctIndex: 0, explanation: 'SSDs are typically much faster.' },
  { id: 'l1q6', topic: 'Input Output Devices', type: 'mcq', question: 'A keyboard is an:', options: ['Input device', 'Output device only', 'Storage device only', 'Power supply'], correctIndex: 0, explanation: 'Keyboards send input to the computer.' },
  { id: 'l1q7', topic: 'Input Output Devices', type: 'mcq', question: 'A monitor is mainly an:', options: ['Output device', 'Input-only device', 'Storage drive', 'Network router'], correctIndex: 0, explanation: 'Monitors display output.' },
  { id: 'l1q8', topic: 'Windows Basics', type: 'mcq', question: 'The taskbar in Windows is commonly used to:', options: ['Switch apps and open the Start menu', 'Replace the CPU', 'Format the BIOS', 'Change the PSU'], correctIndex: 0, explanation: 'Taskbar helps launch and switch apps.' },
  { id: 'l1q9', topic: 'Windows Basics', type: 'mcq', question: 'File Explorer helps you:', options: ['Browse files and folders', 'Only edit videos', 'Only send email', 'Only code websites'], correctIndex: 0, explanation: 'File Explorer manages files.' },
  { id: 'l1q10', topic: 'Files and Folders', type: 'mcq', question: 'A folder is used to:', options: ['Organize related files', 'Cool the laptop', 'Increase RAM size', 'Replace Wi-Fi'], correctIndex: 0, explanation: 'Folders group files.' },
  { id: 'l1q11', topic: 'Files and Folders', type: 'mcq', question: 'Copy keeps the original and also:', options: ['Creates another copy', 'Deletes the original always', 'Formats the drive', 'Turns off the PC'], correctIndex: 0, explanation: 'Copy duplicates without removing the source.' },
  { id: 'l1q12', topic: 'File Operations', type: 'mcq', question: 'Ctrl+C is commonly used to:', options: ['Copy', 'Paste', 'Undo', 'Save'], correctIndex: 0, explanation: 'Ctrl+C copies the selection.' },
  { id: 'l1q13', topic: 'File Operations', type: 'mcq', question: 'Ctrl+V is commonly used to:', options: ['Paste', 'Copy', 'Cut', 'Print'], correctIndex: 0, explanation: 'Ctrl+V pastes the clipboard content.' },
  { id: 'l1q14', topic: 'Download Upload ZIP', type: 'mcq', question: 'Downloading means:', options: ['Getting a file from the internet to your device', 'Sending only email text', 'Deleting the recycle bin', 'Restarting Windows'], correctIndex: 0, explanation: 'Download saves remote files locally.' },
  { id: 'l1q15', topic: 'Download Upload ZIP', type: 'mcq', question: 'A ZIP file is useful to:', options: ['Bundle and compress files', 'Replace the motherboard', 'Charge the battery', 'Clean the screen'], correctIndex: 0, explanation: 'ZIP packages files more compactly.' },
  { id: 'l1q16', topic: 'Settings', type: 'mcq', question: 'Windows Settings is used to:', options: ['Change system options like display and Wi-Fi', 'Only write novels', 'Only draw shapes', 'Only compile kernels'], correctIndex: 0, explanation: 'Settings controls system preferences.' },
  { id: 'l1q17', topic: 'What is a Computer', type: 'mcq', question: 'Which is a type of computer?', options: ['Laptop', 'A paper notebook only', 'A wooden desk', 'A plastic bottle'], correctIndex: 0, explanation: 'Laptops are portable computers.' },
  { id: 'l1q18', topic: 'Hardware and Software', type: 'mcq', question: 'An operating system is:', options: ['System software that manages the computer', 'Only a game controller', 'Only a printer cable', 'Only a webcam lens'], correctIndex: 0, explanation: 'The OS manages hardware and software.' },
]

export const LEVEL2_QUESTIONS = [
  { id: 'l2q1', topic: 'English Typing', type: 'mcq', question: 'Home row keys for the left hand include:', options: ['A S D F', 'Q W E R only', 'Z X C V only', '1 2 3 4 only'], correctIndex: 0, explanation: 'ASDF are left-hand home keys.' },
  { id: 'l2q2', topic: 'English Typing', type: 'mcq', question: 'Touch typing means:', options: ['Typing without looking at the keyboard', 'Only using one finger', 'Typing with the mouse', 'Typing only numbers'], correctIndex: 0, explanation: 'Touch typing relies on muscle memory.' },
  { id: 'l2q3', topic: 'Hindi Typing', type: 'mcq', question: 'Inscript and phonetic are examples of:', options: ['Hindi typing layouts', 'Printer models', 'CPU brands', 'Wi-Fi channels'], correctIndex: 0, explanation: 'They are keyboard layout approaches for Hindi.' },
  { id: 'l2q4', topic: 'Shortcuts', type: 'mcq', question: 'Ctrl+Z usually means:', options: ['Undo', 'Redo', 'Save', 'Print'], correctIndex: 0, explanation: 'Ctrl+Z undoes the last action.' },
  { id: 'l2q5', topic: 'Shortcuts', type: 'mcq', question: 'Ctrl+S usually means:', options: ['Save', 'Cut', 'Copy', 'Paste'], correctIndex: 0, explanation: 'Ctrl+S saves the document.' },
  { id: 'l2q6', topic: 'Shortcuts', type: 'mcq', question: 'Alt+Tab is commonly used to:', options: ['Switch between open apps', 'Delete a folder', 'Format a disk', 'Change wallpaper only'], correctIndex: 0, explanation: 'Alt+Tab cycles apps.' },
  { id: 'l2q7', topic: 'Touch Typing', type: 'mcq', question: 'Good posture while typing helps:', options: ['Reduce strain and improve speed', 'Overclock the CPU', 'Increase disk size', 'Boost Wi-Fi range'], correctIndex: 0, explanation: 'Posture supports comfort and speed.' },
  { id: 'l2q8', topic: 'Touch Typing', type: 'mcq', question: 'WPM measures:', options: ['Typing speed', 'Screen brightness', 'Battery percent', 'RAM capacity'], correctIndex: 0, explanation: 'Words per minute is a speed metric.' },
  { id: 'l2q9', topic: 'English Typing', type: 'mcq', question: 'Accuracy in typing is important because:', options: ['Fewer errors mean less correction time', 'It increases CPU cores', 'It replaces the mouse', 'It formats the SSD'], correctIndex: 0, explanation: 'Accurate typing saves rework.' },
  { id: 'l2q10', topic: 'Shortcuts', type: 'mcq', question: 'Ctrl+A usually:', options: ['Selects all', 'Aligns center', 'Adds a table', 'Opens settings'], correctIndex: 0, explanation: 'Ctrl+A selects everything.' },
  { id: 'l2q11', topic: 'Hindi Typing', type: 'mcq', question: 'To type Hindi on Windows you often need:', options: ['A Hindi keyboard layout enabled', 'A new motherboard', 'A second GPU', 'A paper dictionary only'], correctIndex: 0, explanation: 'OS language/keyboard settings enable Hindi input.' },
  { id: 'l2q12', topic: 'Touch Typing', type: 'mcq', question: 'Practice drills help mainly with:', options: ['Muscle memory and consistency', 'Changing IP address', 'Replacing thermal paste', 'Buying RAM'], correctIndex: 0, explanation: 'Drills build automatic finger movement.' },
  { id: 'l2q13', topic: 'English Typing', type: 'mcq', question: 'Spacebar is usually pressed with:', options: ['The thumb', 'The pinky only', 'The elbow', 'The nose'], correctIndex: 0, explanation: 'Thumbs operate the spacebar.' },
]

export const LEVEL3_QUESTIONS = [
  { id: 'l3q1', topic: 'Word', type: 'mcq', question: 'Bold text is often applied with:', options: ['Ctrl+B', 'Ctrl+P', 'Ctrl+N', 'Ctrl+W'], correctIndex: 0, explanation: 'Ctrl+B toggles bold.' },
  { id: 'l3q2', topic: 'Word', type: 'mcq', question: 'A table in Word is used to:', options: ['Organize data in rows and columns', 'Cool the laptop', 'Change IP settings', 'Replace Excel always'], correctIndex: 0, explanation: 'Tables structure information.' },
  { id: 'l3q3', topic: 'Word', type: 'mcq', question: 'Mail merge is useful for:', options: ['Personalized letters from a data list', 'Defragmenting disks', 'Updating BIOS', 'Overclocking CPU'], correctIndex: 0, explanation: 'Mail merge combines a template with data.' },
  { id: 'l3q4', topic: 'Excel', type: 'mcq', question: 'In Excel, a cell is identified by:', options: ['Column letter and row number', 'Only a color', 'Only a filename', 'Only a password'], correctIndex: 0, explanation: 'Example: B3 is column B, row 3.' },
  { id: 'l3q5', topic: 'Excel', type: 'mcq', question: 'SUM is used to:', options: ['Add numbers', 'Delete sheets', 'Hide the ribbon', 'Change font only'], correctIndex: 0, explanation: 'SUM totals values.' },
  { id: 'l3q6', topic: 'Excel', type: 'mcq', question: 'A chart helps you:', options: ['Visualize data', 'Replace the keyboard', 'Format the BIOS', 'Install drivers'], correctIndex: 0, explanation: 'Charts show patterns visually.' },
  { id: 'l3q7', topic: 'PowerPoint', type: 'mcq', question: 'A slide is:', options: ['One page of a presentation', 'A type of RAM', 'A network cable', 'A power brick'], correctIndex: 0, explanation: 'Presentations are sequences of slides.' },
  { id: 'l3q8', topic: 'PowerPoint', type: 'mcq', question: 'Transitions affect:', options: ['How slides change from one to the next', 'CPU temperature only', 'Disk partition size', 'Wi-Fi password'], correctIndex: 0, explanation: 'Transitions animate slide changes.' },
  { id: 'l3q9', topic: 'PowerPoint', type: 'mcq', question: 'Speaker notes are for:', options: ['Presenter reminders not shown to audience by default', 'Printing envelopes only', 'Formatting SSDs', 'Changing MAC address'], correctIndex: 0, explanation: 'Notes support the presenter.' },
  { id: 'l3q10', topic: 'Word', type: 'mcq', question: 'Page orientation can be:', options: ['Portrait or landscape', 'Only circular', 'Only diagonal', 'Only 3D'], correctIndex: 0, explanation: 'Portrait and landscape are standard.' },
  { id: 'l3q11', topic: 'Excel', type: 'mcq', question: 'A formula starts with:', options: ['=', '#', '@ only', '% only'], correctIndex: 0, explanation: 'Excel formulas begin with =.' },
  { id: 'l3q12', topic: 'Excel', type: 'mcq', question: 'Freeze panes helps you:', options: ['Keep header rows visible while scrolling', 'Freeze the operating system', 'Lock the BIOS', 'Disable USB'], correctIndex: 0, explanation: 'Frozen headers stay on screen.' },
  { id: 'l3q13', topic: 'PowerPoint', type: 'mcq', question: 'Design themes provide:', options: ['Consistent colors and fonts', 'New CPU fans', 'Extra RAM sticks', 'Longer HDMI cables'], correctIndex: 0, explanation: 'Themes unify visual style.' },
  { id: 'l3q14', topic: 'Word', type: 'mcq', question: 'Find and Replace can:', options: ['Update repeated text quickly', 'Replace the motherboard', 'Upgrade the GPU', 'Change the PSU'], correctIndex: 0, explanation: 'It searches and substitutes text.' },
  { id: 'l3q15', topic: 'Excel', type: 'mcq', question: 'Sorting data arranges it:', options: ['In order such as A–Z or smallest–largest', 'Into random pixels', 'Into BIOS menus', 'Into printer queues only'], correctIndex: 0, explanation: 'Sort orders values systematically.' },
  { id: 'l3q16', topic: 'Word', type: 'mcq', question: 'Bullet lists are useful for:', options: ['Presenting points clearly', 'Formatting hard drives', 'Setting IP addresses', 'Changing fan curves'], correctIndex: 0, explanation: 'Bullets structure key points.' },
  { id: 'l3q17', topic: 'PowerPoint', type: 'mcq', question: 'Slide show mode is for:', options: ['Presenting to an audience', 'Editing the registry only', 'Compiling code', 'Partitioning disks'], correctIndex: 0, explanation: 'Slide show displays the presentation.' },
]

export const LEVEL4_QUESTIONS = [
  { id: 'l4q1', topic: 'Internet', type: 'mcq', question: 'The internet is best described as:', options: ['A global network of networks', 'A single home PC', 'Only a printer protocol', 'Only a keyboard layout'], correctIndex: 0, explanation: 'Many networks interconnect worldwide.' },
  { id: 'l4q2', topic: 'Internet', type: 'mcq', question: 'A URL is:', options: ['The address of a web resource', 'A type of CPU', 'A power connector', 'A mouse sensor'], correctIndex: 0, explanation: 'URLs locate web pages and files.' },
  { id: 'l4q3', topic: 'Browsers', type: 'mcq', question: 'A web browser is used to:', options: ['Open and view websites', 'Replace the SSD', 'Solder circuits', 'Only edit registries'], correctIndex: 0, explanation: 'Browsers render web content.' },
  { id: 'l4q4', topic: 'Browsers', type: 'mcq', question: 'Search engines help you:', options: ['Find information on the web', 'Increase RAM capacity', 'Cool the GPU', 'Paint the case'], correctIndex: 0, explanation: 'Search indexes and finds pages.' },
  { id: 'l4q5', topic: 'Gmail', type: 'mcq', question: 'CC in email means:', options: ['Carbon copy to additional recipients', 'Close computer', 'Central CPU', 'Copy cable'], correctIndex: 0, explanation: 'CC sends visible copies to others.' },
  { id: 'l4q6', topic: 'Gmail', type: 'mcq', question: 'An attachment is:', options: ['A file sent with the email', 'A broken pixel', 'A BIOS chip', 'A desk stand'], correctIndex: 0, explanation: 'Attachments include files with messages.' },
  { id: 'l4q7', topic: 'Drive', type: 'mcq', question: 'Google Drive is mainly for:', options: ['Cloud file storage and sharing', 'Replacing Ethernet ports', 'Overclocking only', 'Cleaning keycaps'], correctIndex: 0, explanation: 'Drive stores files online.' },
  { id: 'l4q8', topic: 'Drive', type: 'mcq', question: 'Google Docs is used to:', options: ['Create and edit documents online', 'Format motherboards', 'Replace PSUs', 'Tune fans'], correctIndex: 0, explanation: 'Docs is an online word processor.' },
  { id: 'l4q9', topic: 'Internet', type: 'mcq', question: 'Wi-Fi provides:', options: ['Wireless network access', 'Extra CPU cores', 'Unlimited RAM', 'Free GPUs'], correctIndex: 0, explanation: 'Wi-Fi is wireless networking.' },
  { id: 'l4q10', topic: 'Browsers', type: 'mcq', question: 'A bookmark saves:', options: ['A quick link to a page', 'A copy of your CPU', 'Your PSU wattage', 'Only desktop icons'], correctIndex: 0, explanation: 'Bookmarks store page shortcuts.' },
  { id: 'l4q11', topic: 'Gmail', type: 'mcq', question: 'Phishing emails often try to:', options: ['Steal passwords or money', 'Upgrade your RAM', 'Clean your desk', 'Sharpen photos'], correctIndex: 0, explanation: 'Phishing is social engineering fraud.' },
  { id: 'l4q12', topic: 'Drive', type: 'mcq', question: 'Sharing a Drive link can allow others to:', options: ['View or edit the file based on permissions', 'Replace your motherboard', 'Change your BIOS password automatically', 'Overclock your CPU'], correctIndex: 0, explanation: 'Permissions control collaborator access.' },
]

export function getTestById(id) {
  return TESTS.find((t) => t.id === id) || null
}

export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleOptions(q) {
  const indexed = q.options.map((text, idx) => ({ text, idx }))
  const shuffled = shuffleArray(indexed)
  const correctIndex = shuffled.findIndex((o) => o.idx === q.correctIndex)
  return {
    options: shuffled.map((o) => o.text),
    correctIndex,
  }
}

const BANKS = {
  'level1-basics': LEVEL1_QUESTIONS,
  'level2-typing': LEVEL2_QUESTIONS,
  'level3-office': LEVEL3_QUESTIONS,
  'level4-internet': LEVEL4_QUESTIONS,
  'level5-security': LEVEL5_QUESTIONS,
  'level6-design': LEVEL6_QUESTIONS,
  'level7-ai': LEVEL7_QUESTIONS,
  'level8-programming': LEVEL8_QUESTIONS,
  'level9-advanced': LEVEL9_QUESTIONS,
}

export function buildTestAttempt(testId, count) {
  const bank = BANKS[testId] || []
  if (!bank.length) return []
  const n = count || bank.length
  const shuffled = shuffleArray(bank)
  return shuffled.slice(0, Math.min(n, shuffled.length)).map((q, i) => ({
    ...q,
    ...shuffleOptions(q),
    order: i,
  }))
}

export function buildLevel1Attempt(count = 15) {
  return buildTestAttempt('level1-basics', count)
}
