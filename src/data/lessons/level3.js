/**
 * Level 3 – Microsoft Office
 * Full interactive lessons: Word, Excel, PowerPoint.
 */

export const LEVEL3_LESSONS = {
  'l3-1': {
    id: 'l3-1',
    levelId: 3,
    title: 'MS Word – Documents & Formatting',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Microsoft Word is used to create letters, notes, resumes and reports.',
      'Formatting means changing font, size, bold/italic, alignment and colour so text is clear and professional.',
      'Always save your file with a clear name and know where the folder is (Desktop, Documents, or a project folder).',
    ],
    examples: [
      { title: 'School assignment', text: 'Type the title in Heading style, body in 12pt, and save as ClassNotes.docx.' },
      { title: 'Bold and lists', text: 'Select a heading → Bold. Use bullets for steps or ingredients.' },
    ],
    keyPoints: [
      'New document → type → format → save',
      'Bold, italic, underline and font size change emphasis',
      'Alignment: left, centre, right, justify',
      'Bullets and numbers organise lists',
      'Ctrl+S saves often so work is not lost',
    ],
    tryIt: {
      title: 'Try it – Format a short note',
      instruction: 'In Word or Google Docs, type a 4-line note, make the title bold and larger, add a bullet list, then save.',
      hint: 'Select text before applying Bold or font size. Use the bullet button on the toolbar.',
    },
    quiz: {
      questions: [
        { id: 'q1', type: 'mcq', question: 'What is MS Word mainly used for?', options: ['Only spreadsheets', 'Creating and editing text documents', 'Only drawing', 'Only email'], correctIndex: 1, explanation: 'Word is a word processor for text documents.' },
        { id: 'q2', type: 'mcq', question: 'Which shortcut usually saves a document?', options: ['Ctrl+V', 'Ctrl+S', 'Ctrl+Z', 'Alt+F4'], correctIndex: 1, explanation: 'Ctrl+S saves.' },
        { id: 'q3', type: 'mcq', question: 'To make text thicker and stand out you use:', options: ['Italic only', 'Bold', 'Subscript only', 'Zoom'], correctIndex: 1, explanation: 'Bold increases visual weight of text.' },
      ],
    },
  },
  'l3-2': {
    id: 'l3-2',
    levelId: 3,
    title: 'MS Word – Tables, Images & Resume',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Tables organise information in rows and columns inside a Word document.',
      'Images and shapes make posters and resumes clearer when used sparingly.',
      'A simple resume includes name, contact, education, skills and experience in a clean layout.',
    ],
    examples: [
      { title: 'Insert table', text: 'Insert → Table → choose 2×4 for a small schedule or skill list.' },
      { title: 'Resume block', text: 'Name at top, then Education and Skills as headings with short bullets.' },
    ],
    keyPoints: [
      'Insert → Table for grids of data',
      'Insert → Pictures for images from your PC',
      'Keep resume to 1 page when possible',
      'Use consistent fonts and spacing',
      'Export or save as PDF when sharing',
    ],
    tryIt: {
      title: 'Try it – Mini resume',
      instruction: 'Create a one-page resume with your name, two education lines, and a 3-item skills list. Add a simple table if useful.',
      hint: 'Use headings for sections. Avoid large decorative images on a resume.',
    },
    quiz: {
      questions: [
        { id: 'q1', type: 'mcq', question: 'Tables in Word are best for:', options: ['Playing music', 'Organising data in rows and columns', 'Browsing the internet', 'Antivirus'], correctIndex: 1, explanation: 'Tables structure information in a grid.' },
        { id: 'q2', type: 'mcq', question: 'A student resume should usually:', options: ['Be 20 pages', 'Be clear, short and well formatted', 'Use only images', 'Avoid contact details'], correctIndex: 1, explanation: 'Clarity and brevity help readers.' },
        { id: 'q3', type: 'mcq', question: 'Where do you typically insert a picture in Word?', options: ['Only in Excel', 'Insert → Pictures', 'Task Manager', 'Recycle Bin'], correctIndex: 1, explanation: 'Insert → Pictures adds images.' },
      ],
    },
  },
  'l3-3': {
    id: 'l3-3',
    levelId: 3,
    title: 'MS Excel – Rows, Columns & Data Entry',
    duration: '12 min',
    xp: 30,
    explanation: [
      'Excel stores data in a grid of cells. Columns are letters (A, B, C…); rows are numbers (1, 2, 3…).',
      'A cell address like B3 means column B, row 3.',
      'Enter text or numbers, press Enter or Tab to move, and use clear headers in row 1.',
    ],
    examples: [
      { title: 'Mark list', text: 'Headers: Name | Marks. Fill student names and scores under each column.' },
      { title: 'Select a range', text: 'Click A1 and drag to C5 to select a block for formatting or formulas.' },
    ],
    keyPoints: [
      'Cell = intersection of a column and a row',
      'Row 1 often holds headers',
      'Numbers align right; text usually left',
      'Widen columns by dragging the boundary',
      'Save workbooks as .xlsx',
    ],
    tryIt: {
      title: 'Try it – Enter a table',
      instruction: 'Create headers Name, Item, Qty. Enter 3 sample rows of data and adjust column widths.',
      hint: 'Double-click a column border to auto-fit width on many Excel versions.',
    },
    quiz: {
      questions: [
        { id: 'q1', type: 'mcq', question: 'In Excel, columns are labelled with:', options: ['Only numbers', 'Letters (A, B, C…)', 'Roman numerals only', 'Colours only'], correctIndex: 1, explanation: 'Columns use letters.' },
        { id: 'q2', type: 'mcq', question: 'Cell C2 is in:', options: ['Column 2, Row C', 'Column C, Row 2', 'Sheet 2 only', 'A chart'], correctIndex: 1, explanation: 'Letter = column, number = row.' },
        { id: 'q3', type: 'mcq', question: 'Headers are commonly placed in:', options: ['The last row only', 'Row 1', 'A separate app', 'The formula bar only'], correctIndex: 1, explanation: 'Row 1 is the usual header row.' },
      ],
    },
  },
  'l3-4': {
    id: 'l3-4',
    levelId: 3,
    title: 'MS Excel – Formulas & Functions',
    duration: '18 min',
    xp: 40,
    explanation: [
      'Formulas start with = and calculate results from cell values.',
      'Common functions: SUM, AVERAGE, MIN, MAX, COUNT.',
      'Example: =SUM(B2:B10) adds all numbers from B2 through B10.',
    ],
    examples: [
      { title: 'Total marks', text: 'If marks are in B2:B6, type =SUM(B2:B6) in B7 for the total.' },
      { title: 'Average', text: '=AVERAGE(B2:B6) gives the mean score.' },
    ],
    keyPoints: [
      'Every formula begins with =',
      'SUM adds; AVERAGE finds the mean',
      'Use cell references, not only typed numbers',
      'Fill handle copies formulas down a column',
      'Check for #DIV/0! and wrong ranges',
    ],
    tryIt: {
      title: 'Try it – SUM and AVERAGE',
      instruction: 'Enter 5 numbers in A1:A5. In A6 use =SUM(A1:A5). In A7 use =AVERAGE(A1:A5).',
      hint: 'Type the = sign first. Select the range with the mouse after typing SUM(.',
    },
    quiz: {
      questions: [
        { id: 'q1', type: 'mcq', question: 'Excel formulas must start with:', options: ['#', '=', '+ only', 'SUM without ='], correctIndex: 1, explanation: 'The = sign starts a formula.' },
        { id: 'q2', type: 'mcq', question: 'What does =SUM(A1:A5) do?', options: ['Deletes A1:A5', 'Adds values in A1 through A5', 'Sorts the sheet', 'Prints the file'], correctIndex: 1, explanation: 'SUM totals the range.' },
        { id: 'q3', type: 'mcq', question: 'AVERAGE is used to find the:', options: ['Maximum only', 'Mean of numbers', 'File size', 'Sheet name'], correctIndex: 1, explanation: 'AVERAGE computes the mean.' },
        { id: 'q4', type: 'mcq', question: 'Why use cell references in formulas?', options: ['They look colourful', 'Results update when data changes', 'They disable save', 'They hide the ribbon'], correctIndex: 1, explanation: 'Referenced cells recalculate when inputs change.' },
      ],
    },
  },
  'l3-5': {
    id: 'l3-5',
    levelId: 3,
    title: 'MS Excel – Charts & Analysis',
    duration: '12 min',
    xp: 30,
    explanation: [
      'Charts turn numbers into visual bars, lines or pies so patterns are easier to see.',
      'Select data including headers, then Insert → Charts and pick a suitable type.',
      'Sort and simple filters help analyse lists (highest marks, specific city, etc.).',
    ],
    examples: [
      { title: 'Bar chart', text: 'Select Name and Marks columns → Insert → Column chart to compare students.' },
      { title: 'Sort', text: 'Data → Sort to order marks from highest to lowest.' },
    ],
    keyPoints: [
      'Select data before inserting a chart',
      'Column/bar charts compare values',
      'Pie charts show parts of a whole',
      'Always title the chart clearly',
      'Sort and filter for quick analysis',
    ],
    tryIt: {
      title: 'Try it – Make a chart',
      instruction: 'Create a small table of 4 items and amounts. Insert a column chart and give it a title.',
      hint: 'Include the header row in your selection so the legend uses correct labels.',
    },
    quiz: {
      questions: [
        { id: 'q1', type: 'mcq', question: 'Charts in Excel are used to:', options: ['Delete data', 'Visualise numbers', 'Send email', 'Install fonts'], correctIndex: 1, explanation: 'Charts visualise data.' },
        { id: 'q2', type: 'mcq', question: 'Before Insert → Chart you should:', options: ['Close Excel', 'Select the data range', 'Unplug the mouse', 'Disable formulas'], correctIndex: 1, explanation: 'Selection defines what is plotted.' },
        { id: 'q3', type: 'mcq', question: 'Sorting marks highest to lowest helps you:', options: ['Hide the ribbon', 'Rank performance quickly', 'Change OS language', 'Format only headers'], correctIndex: 1, explanation: 'Sort orders values for comparison.' },
      ],
    },
  },
  'l3-6': {
    id: 'l3-6',
    levelId: 3,
    title: 'MS PowerPoint – Slides & Design',
    duration: '15 min',
    xp: 35,
    explanation: [
      'PowerPoint presents ideas as a sequence of slides for class or meetings.',
      'Each slide should have one clear idea: short title, limited bullets, optional image.',
      'Themes apply consistent colours and fonts across the whole deck.',
    ],
    examples: [
      { title: 'Title slide', text: 'Slide 1: project title, your name, date.' },
      { title: 'Content slide', text: 'Title + 3–5 short bullets. Avoid full paragraphs on a slide.' },
    ],
    keyPoints: [
      'One main idea per slide',
      'Use a theme for consistent design',
      'Large readable fonts',
      'Images support the message, not decorate randomly',
      'Slide Sorter view helps reorder',
    ],
    tryIt: {
      title: 'Try it – 3-slide deck',
      instruction: 'Create a title slide, one content slide with bullets, and a thank-you slide. Apply a theme.',
      hint: 'Design → Themes (or similar) applies a style to all slides.',
    },
    quiz: {
      questions: [
        { id: 'q1', type: 'mcq', question: 'PowerPoint is mainly used for:', options: ['Only databases', 'Slide presentations', 'Only spreadsheets', 'Antivirus'], correctIndex: 1, explanation: 'PowerPoint builds presentations.' },
        { id: 'q2', type: 'mcq', question: 'A good content slide usually has:', options: ['A full essay', 'A clear title and short bullets', 'No title ever', 'Only one pixel image'], correctIndex: 1, explanation: 'Short bullets keep slides readable.' },
        { id: 'q3', type: 'mcq', question: 'Themes help you:', options: ['Delete slides', 'Keep colours and fonts consistent', 'Turn off the projector', 'Format Excel only'], correctIndex: 1, explanation: 'Themes unify the deck design.' },
      ],
    },
  },
  'l3-7': {
    id: 'l3-7',
    levelId: 3,
    title: 'MS PowerPoint – Animation & Transitions',
    duration: '12 min',
    xp: 30,
    explanation: [
      'Transitions are effects between slides. Animations move objects on a single slide.',
      'Use simple effects (Fade, Appear). Too many animations distract the audience.',
      'Practice Slide Show mode (F5) before presenting.',
    ],
    examples: [
      { title: 'Fade transition', text: 'Select a slide → Transitions → Fade for a clean change.' },
      { title: 'Appear animation', text: 'Select a bullet list → Animations → Appear so points show one by one if needed.' },
    ],
    keyPoints: [
      'Transition = between slides; animation = on a slide',
      'Less is more — keep effects subtle',
      'Same transition on all slides looks professional',
      'Rehearse with Slide Show view',
      'Have a PDF backup when possible',
    ],
    tryIt: {
      title: 'Try it – Subtle motion',
      instruction: 'Apply one transition to all slides and one simple animation to a bullet list. Run the slide show.',
      hint: 'Transitions tab affects slide changes; Animations tab affects selected objects.',
    },
    quiz: {
      questions: [
        { id: 'q1', type: 'mcq', question: 'A transition happens:', options: ['Only inside Excel', 'Between slides', 'In Task Manager', 'When saving only'], correctIndex: 1, explanation: 'Transitions are effects between slides.' },
        { id: 'q2', type: 'mcq', question: 'Best practice for animations is:', options: ['Use every effect available', 'Keep them simple and purposeful', 'Never use titles', 'Animate the OS'], correctIndex: 1, explanation: 'Simple animations support the message.' },
        { id: 'q3', type: 'mcq', question: 'F5 in PowerPoint commonly:', options: ['Deletes the deck', 'Starts the slide show from the beginning', 'Inserts Excel', 'Closes Word'], correctIndex: 1, explanation: 'F5 starts the show from the first slide on many setups.' },
      ],
    },
  },
}

export function getLevel3Lesson(id) {
  return LEVEL3_LESSONS[id] || null
}

export function getAllLevel3LessonIds() {
  return Object.keys(LEVEL3_LESSONS)
}
