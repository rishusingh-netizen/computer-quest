/**
 * Level 1 – Computer Basics
 * Full interactive lessons (explanation, examples, key points, try-it, quiz).
 */

export const LEVEL1_LESSONS = {
  'l1-1': {
    id: 'l1-1',
    levelId: 1,
    title: 'What is a Computer?',
    duration: '8 min',
    xp: 20,
    explanation: [
      'A computer is an electronic device that takes input, processes it according to instructions, and gives useful output.',
      'It can store data, perform calculations very fast, and help us with work, study, entertainment and communication.',
      'Modern computers include desktops, laptops, tablets and even smartphones – all of them follow the same basic idea: Input → Process → Output → Storage.',
    ],
    examples: [
      {
        title: 'Simple example',
        text: 'You type a number in a calculator app (input) → the computer adds them (process) → you see the answer on screen (output).',
      },
      {
        title: 'Everyday use',
        text: 'Watching a video, writing a document, searching Google, or playing a game – all of these are computers doing work for you.',
      },
    ],
    keyPoints: [
      'Computer = Input + Process + Output + Storage',
      'It works on instructions (programs / software)',
      'Desktops, laptops, tablets and phones are all computers',
    ],
    tryIt: {
      title: 'Spot the computer',
      steps: [
        'Look around you and list 3 devices that are computers.',
        'For each, write what input it takes and what output it gives.',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'What is the basic cycle of a computer?',
        options: ['Input → Process → Output → Storage', 'Only Input and Output', 'Only Storage', 'Random steps'],
        answer: 0,
        explanation: 'Every computer follows Input → Process → Output → Storage.',
      },
      {
        id: 'q2',
        question: 'Which of these is a computer?',
        options: ['A wooden table', 'A smartphone', 'A notebook (paper)', 'A chair'],
        answer: 1,
        explanation: 'A smartphone is a computer: it takes input, processes, and shows output.',
      },
      {
        id: 'q3',
        question: 'What does “process” mean in a computer?',
        options: ['Showing the screen', 'Doing work on the data according to instructions', 'Turning the power off', 'Buying new hardware'],
        answer: 1,
        explanation: 'Process means the computer works on data using programs.',
      },
    ],
  },
  'l1-2': {
    id: 'l1-2',
    levelId: 1,
    title: 'Hardware and Software',
    duration: '10 min',
    xp: 25,
    explanation: [
      'Hardware is the physical parts of a computer that you can touch — monitor, keyboard, mouse, CPU, RAM, hard disk.',
      'Software is the set of instructions (programs) that tell the hardware what to do — Windows, Chrome, MS Word, games.',
      'Without hardware, software has nothing to run on. Without software, hardware is just a machine that does nothing useful.',
    ],
    examples: [
      { title: 'Hardware', text: 'Keyboard, mouse, monitor, printer, CPU chip, RAM sticks, SSD.' },
      { title: 'Software', text: 'Windows 11, Google Chrome, MS Word, WhatsApp, antivirus.' },
    ],
    keyPoints: [
      'Hardware = physical parts',
      'Software = programs and apps',
      'Both are needed for a working computer',
    ],
    tryIt: {
      title: 'Sort hardware vs software',
      steps: [
        'Make two columns: Hardware and Software.',
        'Put these items in the right column: Mouse, Chrome, RAM, MS Excel, Monitor, Windows.',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'Which one is hardware?',
        options: ['MS Word', 'Keyboard', 'Chrome', 'Windows'],
        answer: 1,
        explanation: 'Keyboard is a physical device — hardware.',
      },
      {
        id: 'q2',
        question: 'Which one is software?',
        options: ['Monitor', 'Printer', 'Google Chrome', 'Mouse'],
        answer: 2,
        explanation: 'Chrome is a program — software.',
      },
      {
        id: 'q3',
        question: 'Can software run without hardware?',
        options: ['Yes always', 'No', 'Only on Sundays', 'Only games'],
        answer: 1,
        explanation: 'Software needs hardware to run.',
      },
    ],
  },
  'l1-3': {
    id: 'l1-3',
    levelId: 1,
    title: 'CPU, RAM, ROM, HDD/SSD',
    duration: '12 min',
    xp: 30,
    explanation: [
      'CPU (Central Processing Unit) is the “brain” of the computer. It executes instructions.',
      'RAM (Random Access Memory) is fast temporary memory. It holds programs and data while you use them. When power is off, RAM is cleared.',
      'ROM (Read Only Memory) stores permanent startup instructions.',
      'HDD (Hard Disk Drive) and SSD (Solid State Drive) are storage. They keep your files, photos and programs even when the computer is off. SSD is faster and more durable than HDD.',
    ],
    examples: [
      { title: 'RAM vs Storage', text: 'Opening 20 browser tabs uses more RAM. Saving a large video uses more disk space (HDD/SSD).' },
      { title: 'Why SSD feels faster', text: 'Booting Windows and opening apps is quicker on SSD because data is read much faster than from a spinning HDD.' },
    ],
    keyPoints: [
      'CPU = brain (processes instructions)',
      'RAM = temporary fast memory (cleared on power off)',
      'HDD/SSD = permanent storage for files and programs',
      'SSD is faster than HDD',
    ],
    tryIt: {
      title: 'Check your PC',
      steps: [
        'On Windows, open Settings → System → About and note RAM size.',
        'Open File Explorer → This PC and note free space on your drive.',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'Which memory is cleared when you turn off the computer?',
        options: ['SSD', 'HDD', 'RAM', 'ROM'],
        answer: 2,
        explanation: 'RAM is volatile — it loses data without power.',
      },
      {
        id: 'q2',
        question: 'What is the “brain” of the computer?',
        options: ['RAM', 'CPU', 'Monitor', 'Keyboard'],
        answer: 1,
        explanation: 'CPU executes instructions — the brain.',
      },
      {
        id: 'q3',
        question: 'Which storage is generally faster?',
        options: ['HDD', 'SSD', 'Floppy disk', 'CD'],
        answer: 1,
        explanation: 'SSD is much faster than HDD.',
      },
    ],
  },
  'l1-4': {
    id: 'l1-4',
    levelId: 1,
    title: 'Keyboard and Mouse',
    duration: '8 min',
    xp: 20,
    explanation: [
      'The keyboard is the main input device for typing text and using shortcuts.',
      'Important keys: Enter, Backspace, Delete, Shift, Ctrl, Alt, Windows key, Arrow keys, Esc.',
      'The mouse (or trackpad) lets you point, click, double-click, right-click and drag.',
      'Left click selects; right click opens a context menu; scroll wheel moves the page.',
    ],
    examples: [
      { title: 'Shortcut', text: 'Ctrl + C copies, Ctrl + V pastes, Ctrl + Z undoes — these work in almost every app.' },
      { title: 'Right-click', text: 'Right-click a file to Rename, Delete, or Copy without opening menus at the top.' },
    ],
    keyPoints: [
      'Keyboard = typing + shortcuts',
      'Mouse = point, click, drag',
      'Right-click opens useful menus',
      'Learn a few shortcuts to work faster',
    ],
    tryIt: {
      title: 'Practice clicks',
      steps: [
        'Right-click the desktop and explore the menu.',
        'Try Ctrl+C and Ctrl+V on some text in Notepad.',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'What does right-click usually do?',
        options: ['Deletes the file', 'Opens a context menu', 'Shuts down the PC', 'Opens the browser'],
        answer: 1,
        explanation: 'Right-click opens a context menu with actions for that item.',
      },
      {
        id: 'q2',
        question: 'Which key combination copies selected text?',
        options: ['Ctrl + V', 'Ctrl + C', 'Ctrl + X', 'Alt + F4'],
        answer: 1,
        explanation: 'Ctrl + C copies.',
      },
      {
        id: 'q3',
        question: 'What is the main job of the keyboard?',
        options: ['Show images', 'Input text and commands', 'Print pages', 'Cool the CPU'],
        answer: 1,
        explanation: 'Keyboard is for input.',
      },
    ],
  },
  'l1-5': {
    id: 'l1-5',
    levelId: 1,
    title: 'Monitor, Printer, Scanner',
    duration: '8 min',
    xp: 20,
    explanation: [
      'The monitor (display) is the main output device — it shows text, images and video.',
      'A printer creates a hard copy of documents on paper (inkjet or laser).',
      'A scanner converts paper documents or photos into digital files on the computer.',
      'Together they complete the input/output story: you see work on the monitor, print when needed, and scan paper into digital form.',
    ],
    examples: [
      { title: 'Output', text: 'Watching a YouTube video uses the monitor as output.' },
      { title: 'Print vs Scan', text: 'Print: digital → paper. Scan: paper → digital.' },
    ],
    keyPoints: [
      'Monitor = main screen output',
      'Printer = digital to paper',
      'Scanner = paper to digital',
    ],
    tryIt: {
      title: 'Identify devices',
      steps: [
        'List which output devices you have at home or school.',
        'If you have a printer, note whether it is inkjet or laser (check the label or manual).',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'Which device shows the picture on screen?',
        options: ['Printer', 'Scanner', 'Monitor', 'Speaker'],
        answer: 2,
        explanation: 'Monitor displays the visual output.',
      },
      {
        id: 'q2',
        question: 'What does a scanner do?',
        options: ['Prints on paper', 'Converts paper to digital file', 'Cools the computer', 'Types text'],
        answer: 1,
        explanation: 'Scanner digitizes paper.',
      },
      {
        id: 'q3',
        question: 'Printer converts:',
        options: ['Paper to digital', 'Digital to paper', 'Sound to text', 'Nothing'],
        answer: 1,
        explanation: 'Printer makes a paper copy from digital content.',
      },
    ],
  },
  'l1-6': {
    id: 'l1-6',
    levelId: 1,
    title: 'Windows Basics',
    duration: '10 min',
    xp: 25,
    explanation: [
      'Windows is an operating system (OS). It manages hardware and lets you run apps.',
      'After you sign in you see the Desktop — background, icons, Taskbar and Start button.',
      'You open apps from Start, the Taskbar, or desktop icons. You close them with the X button.',
      'Always shut down or restart properly from Start so files are saved safely.',
    ],
    examples: [
      { title: 'Start menu', text: 'Click Start (Windows icon) to search for “Notepad” and open it.' },
      { title: 'Taskbar', text: 'Pinned apps stay on the Taskbar for one-click access.' },
    ],
    keyPoints: [
      'Windows = operating system',
      'Desktop + Taskbar + Start are your home base',
      'Shut down from Start, not by holding the power button',
    ],
    tryIt: {
      title: 'Open and close an app',
      steps: [
        'Open Notepad from Start.',
        'Type a line, then close with the X. Choose whether to save if asked.',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'What is Windows?',
        options: ['A browser', 'An operating system', 'A printer brand', 'A game'],
        answer: 1,
        explanation: 'Windows is an OS.',
      },
      {
        id: 'q2',
        question: 'Where do you usually click to find installed apps?',
        options: ['Recycle Bin only', 'Start menu', 'Printer queue', 'BIOS'],
        answer: 1,
        explanation: 'Start menu lists apps.',
      },
      {
        id: 'q3',
        question: 'Best way to turn off the PC?',
        options: ['Hold power button 10 seconds always', 'Start → Power → Shut down', 'Unplug only', 'Close the lid only'],
        answer: 1,
        explanation: 'Use Shut down from Start for a safe shutdown.',
      },
    ],
  },
  'l1-7': {
    id: 'l1-7',
    levelId: 1,
    title: 'Desktop, Taskbar & Start Menu',
    duration: '10 min',
    xp: 25,
    explanation: [
      'Desktop: the main screen with wallpaper and icons (This PC, Recycle Bin, app shortcuts).',
      'Taskbar: the bar usually at the bottom — Start button, pinned apps, open windows, system tray (clock, network, volume).',
      'Start Menu: search box + list of apps + Power options.',
      'You can pin your favourite apps to the Taskbar for faster access.',
    ],
    examples: [
      { title: 'Pin an app', text: 'Find Chrome in Start → right-click → Pin to taskbar.' },
      { title: 'System tray', text: 'Bottom-right shows time, Wi‑Fi, battery (on laptops) and notifications.' },
    ],
    keyPoints: [
      'Desktop = icons + wallpaper',
      'Taskbar = open apps + pins + tray',
      'Start = search and launch apps',
    ],
    tryIt: {
      title: 'Customize a little',
      steps: [
        'Pin one app you use daily to the Taskbar.',
        'Open two apps and switch between them using the Taskbar.',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'Where is the clock usually shown?',
        options: ['Top-left of desktop', 'Taskbar system tray', 'Inside Recycle Bin', 'In BIOS'],
        answer: 1,
        explanation: 'Clock is in the system tray on the Taskbar.',
      },
      {
        id: 'q2',
        question: 'What does “Pin to taskbar” do?',
        options: ['Deletes the app', 'Keeps a shortcut on the Taskbar', 'Prints the app', 'Formats the disk'],
        answer: 1,
        explanation: 'Pinning keeps a one-click shortcut on the Taskbar.',
      },
      {
        id: 'q3',
        question: 'Start menu is mainly used to:',
        options: ['Change CPU', 'Search and open apps', 'Clean the screen', 'Install hardware'],
        answer: 1,
        explanation: 'Start is for launching apps and power options.',
      },
    ],
  },
  'l1-8': {
    id: 'l1-8',
    levelId: 1,
    title: 'Files and Folders',
    duration: '12 min',
    xp: 30,
    explanation: [
      'A file is a single document, image, video or program (e.g. notes.docx, photo.jpg).',
      'A folder (directory) holds files and other folders so you can organise your work.',
      'File Explorer (This PC) is the Windows app to browse drives, folders and files.',
      'Common folders: Desktop, Documents, Downloads, Pictures, Music, Videos.',
    ],
    examples: [
      { title: 'Path', text: 'C:\\Users\\YourName\\Documents\\School\\essay.docx tells you exactly where the file lives.' },
      { title: 'Extensions', text: '.docx = Word, .xlsx = Excel, .jpg = image, .pdf = portable document.' },
    ],
    keyPoints: [
      'File = one item; Folder = container',
      'Use File Explorer to browse',
      'File extensions hint at the type',
    ],
    tryIt: {
      title: 'Create a study folder',
      steps: [
        'Open File Explorer → Documents.',
        'Create a folder named ComputerQuest and open it.',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'What is a folder?',
        options: ['A type of virus', 'A container for files and other folders', 'Only for photos', 'A printer setting'],
        answer: 1,
        explanation: 'Folders organise files.',
      },
      {
        id: 'q2',
        question: 'Which app browses files in Windows?',
        options: ['Paint', 'File Explorer', 'Notepad only', 'Calculator'],
        answer: 1,
        explanation: 'File Explorer is the file browser.',
      },
      {
        id: 'q3',
        question: '.jpg usually means:',
        options: ['A spreadsheet', 'An image', 'A video editor', 'A virus'],
        answer: 1,
        explanation: '.jpg is a common image format.',
      },
    ],
  },
  'l1-9': {
    id: 'l1-9',
    levelId: 1,
    title: 'Create, Copy, Cut, Paste, Rename, Delete',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Create: right-click → New → Folder / Text Document.',
      'Copy: Ctrl+C (or right-click → Copy). Original stays; duplicate is made on Paste (Ctrl+V).',
      'Cut: Ctrl+X. Paste moves the item to the new location.',
      'Rename: select item → F2 or right-click → Rename.',
      'Delete: Delete key or right-click → Delete. Items usually go to Recycle Bin first.',
    ],
    examples: [
      { title: 'Copy vs Cut', text: 'Copy a photo to a USB stick so it stays on the PC too. Cut when you want to move a file into another folder.' },
      { title: 'Recycle Bin', text: 'Deleted files can often be restored from Recycle Bin until you empty it.' },
    ],
    keyPoints: [
      'Ctrl+C copy, Ctrl+X cut, Ctrl+V paste',
      'F2 renames',
      'Delete sends to Recycle Bin (usually)',
    ],
    tryIt: {
      title: 'File operations practice',
      steps: [
        'In your ComputerQuest folder, create a text file and rename it to practice.txt.',
        'Copy it, paste a duplicate, then delete the duplicate.',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'Ctrl+X is used to:',
        options: ['Copy', 'Cut', 'Undo', 'Save'],
        answer: 1,
        explanation: 'Ctrl+X cuts.',
      },
      {
        id: 'q2',
        question: 'Where do deleted files usually go first?',
        options: ['Gone forever', 'Recycle Bin', 'Desktop only', 'Printer'],
        answer: 1,
        explanation: 'Recycle Bin holds deleted items temporarily.',
      },
      {
        id: 'q3',
        question: 'Which key renames a selected file?',
        options: ['F1', 'F2', 'F5', 'F12'],
        answer: 1,
        explanation: 'F2 is rename.',
      },
    ],
  },
  'l1-10': {
    id: 'l1-10',
    levelId: 1,
    title: 'Download, Upload & ZIP/RAR',
    duration: '10 min',
    xp: 25,
    explanation: [
      'Download: copy a file from the internet to your computer (usually into Downloads folder).',
      'Upload: send a file from your computer to a website or cloud (Google Drive, email attachment).',
      'ZIP/RAR: compressed folders that pack many files into one smaller file for easy sharing. You extract (unzip) them to use the contents.',
    ],
    examples: [
      { title: 'Download', text: 'Clicking “Download PDF” on a website saves the file under Downloads.' },
      { title: 'ZIP', text: 'Right-click a folder → Compress to ZIP folder, then attach the .zip in email.' },
    ],
    keyPoints: [
      'Download = internet → your PC',
      'Upload = your PC → internet/cloud',
      'ZIP packs files; extract to use them',
    ],
    tryIt: {
      title: 'Find Downloads',
      steps: [
        'Open File Explorer → Downloads and see recent files.',
        'If you have a .zip, double-click it and extract to a folder.',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'Download means:',
        options: ['Send file to internet', 'Get file from internet to PC', 'Delete a file', 'Print a file'],
        answer: 1,
        explanation: 'Download brings files to your PC.',
      },
      {
        id: 'q2',
        question: 'A ZIP file is mainly used to:',
        options: ['Play music', 'Pack/compress files together', 'Edit photos', 'Update Windows'],
        answer: 1,
        explanation: 'ZIP compresses and packages files.',
      },
      {
        id: 'q3',
        question: 'Upload is the opposite of:',
        options: ['Copy', 'Download', 'Rename', 'Paste'],
        answer: 1,
        explanation: 'Upload sends to the internet; download receives.',
      },
    ],
  },
  'l1-11': {
    id: 'l1-11',
    levelId: 1,
    title: 'Pen Drive & Basic Settings',
    duration: '8 min',
    xp: 20,
    explanation: [
      'A pen drive (USB flash drive) is portable storage. Plug it into a USB port; it appears in File Explorer as a removable drive.',
      'Safely eject before unplugging to avoid file corruption (Taskbar → Eject).',
      'Basic Settings (Start → Settings): display brightness, Wi‑Fi, wallpaper, time & language, Windows Update.',
      'Keeping Windows updated improves security and stability.',
    ],
    examples: [
      { title: 'Copy to pen drive', text: 'Copy project folder → open pen drive → Paste. Then Eject.' },
      { title: 'Wi‑Fi', text: 'Settings → Network & internet → Wi‑Fi to connect to a network.' },
    ],
    keyPoints: [
      'Pen drive = portable USB storage',
      'Always eject safely',
      'Settings app controls Wi‑Fi, display, updates',
    ],
    tryIt: {
      title: 'Open Settings',
      steps: [
        'Press Windows key + I to open Settings.',
        'Explore System and Network & internet sections (read only is fine).',
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'Before unplugging a pen drive you should:',
        options: ['Never mind', 'Eject/safely remove it', 'Format the C: drive', 'Restart twice'],
        answer: 1,
        explanation: 'Safe eject prevents data loss.',
      },
      {
        id: 'q2',
        question: 'Windows key + I opens:',
        options: ['File Explorer', 'Settings', 'Task Manager', 'Paint'],
        answer: 1,
        explanation: 'Win+I is the Settings shortcut.',
      },
      {
        id: 'q3',
        question: 'Why update Windows?',
        options: ['Only to change wallpaper', 'Security and bug fixes', 'To delete files', 'It is never needed'],
        answer: 1,
        explanation: 'Updates fix security issues and bugs.',
      },
    ],
  },
}

export function getLevel1Lesson(id) {
  return LEVEL1_LESSONS[id] || null
}

export function getAllLevel1LessonIds() {
  return Object.keys(LEVEL1_LESSONS)
}
