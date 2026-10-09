/**
 * Level 6 — Design & Creative Tools
 * Full interactive lessons (same structure as Levels 1–5)
 */

export const LEVEL6_LESSONS = {
  'l6-1': {
    id: 'l6-1',
    levelId: 6,
    title: 'Canva Basics',
    duration: '12 min',
    xp: 30,
    explanation: [
      'Canva is an online design tool for posters, presentations, social posts, certificates and more — you work in a browser without installing heavy software.',
      'You usually start from a template sized for your goal (A4 poster, Instagram post, presentation slide) or from a blank canvas. Then you add text, images, shapes and icons.',
      'Drag elements to move them. Use layers so text sits above the background. When finished, download as PNG or PDF for school, print, or social media.',
      'Free accounts cover many school needs. Always use your own photos or assets you are allowed to use — do not steal others’ designs.',
    ],
    examples: [
      {
        title: 'School event poster',
        text: 'Choose a poster template, change the title to your event name, swap the image, and export as PDF to print.',
      },
      {
        title: 'Presentation',
        text: 'Pick a presentation template instead of designing every slide from scratch — keep fonts consistent across slides.',
      },
    ],
    keyPoints: [
      'Templates save time and set the right size',
      'Text, images and shapes are editable elements',
      'Download PNG for screens; PDF often for print',
      'Use only assets you have rights to use',
    ],
    tryIt: {
      title: 'Try it – Choose a starting point',
      instruction:
        'You need a one-page notice for a science fair. Better start: (A) random photo only with no size plan (B) a poster template close to A4 or your notice size?',
      hint: 'B is better — the template already matches a useful size and layout.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Canva is mainly used to:',
          options: [
            'Install antivirus only',
            'Create visual designs like posters and posts online',
            'Replace the computer’s operating system',
            'Send OTPs for banking',
          ],
          correctIndex: 1,
          explanation: 'Canva is a browser-based design tool for graphics, posters, slides and similar creatives.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A good reason to start from a template is:',
          options: [
            'Templates always delete your work',
            'They give a ready size and layout you can edit',
            'Templates ban all text',
            'You cannot change colours in templates',
          ],
          correctIndex: 1,
          explanation: 'Templates provide dimensions and structure so you edit instead of building everything from zero.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'When your design is ready you typically:',
          options: [
            'Never save it',
            'Download or export it (for example PNG or PDF)',
            'Only print from a broken USB',
            'Email your password to Canva support',
          ],
          correctIndex: 1,
          explanation: 'Export/download lets you use the design offline, in print, or on social platforms.',
        },
      ],
    },
  },

  'l6-2': {
    id: 'l6-2',
    levelId: 6,
    title: 'Photoshop Basics',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Adobe Photoshop is professional software for editing photos and creating layered graphics. It is more powerful (and often more complex) than simple phone editors.',
      'Layers are central: each layer can hold an image, text or effect. You can hide, reorder or edit one layer without permanently destroying the others.',
      'Common tools include Move, Crop, Brush, Eraser, Text (for colour fixes) and selection tools to work on part of an image only.',
      'Save a working file as PSD to keep layers. Export a flat PNG or JPEG when you need a final image for the web or print. Free alternatives (GIMP, Photopea) teach similar ideas.',
    ],
    examples: [
      {
        title: 'School ID photo',
        text: 'Crop to the required size, adjust brightness, and save a JPEG — keep a layered PSD if you may need to edit again.',
      },
      {
        title: 'Poster text on a photo',
        text: 'Put the photo on one layer and the headline on another so you can move text without cutting the picture.',
      },
    ],
    keyPoints: [
      'Layers let you edit parts separately',
      'Crop, adjust and retouch are everyday tasks',
      'PSD keeps layers; PNG/JPEG are common exports',
      'Non-destructive edits are safer than overwriting originals',
    ],
    tryIt: {
      title: 'Try it – Layer thinking',
      instruction:
        'You add a title on top of a photo. Safer approach: (A) paint the title permanently into the photo pixels only (B) put the title on its own layer?',
      hint: 'B is safer — you can move or restyle the title without damaging the photo.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'In Photoshop, layers mainly help you:',
          options: [
            'Delete the internet connection',
            'Stack and edit parts of a design separately',
            'Turn off the monitor automatically',
            'Install fonts into the BIOS',
          ],
          correctIndex: 1,
          explanation: 'Layers stack images, text and effects so each part can be changed independently.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A common tool for removing unwanted edges of a photo is:',
          options: ['Spell check only', 'Crop', 'Task Manager', 'Recycle Bin'],
          correctIndex: 1,
          explanation: 'Crop trims the image to the area you want to keep.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Saving as PSD is useful because:',
          options: [
            'It always makes the file unreadable',
            'It can keep layers for future editing',
            'It only works offline forever with no export',
            'It replaces the need for any backup',
          ],
          correctIndex: 1,
          explanation: 'PSD is Photoshop’s working format that preserves layers and editability.',
        },
      ],
    },
  },

  'l6-3': {
    id: 'l6-3',
    levelId: 6,
    title: 'Photo & Video Editing',
    duration: '15 min',
    xp: 35,
    explanation: [
      'Photo editing improves crop, lighting, colour and small retouches so images look clearer and fit their purpose (ID, project, social post).',
      'Video editing places clips on a timeline. You trim start and end, arrange order, and may add titles, music or voice. Keep audio levels comfortable.',
      'Phone apps (Photos, CapCut, InShot) and desktop tools (Premiere, DaVinci Resolve, iMovie) share the same ideas: select, cut, arrange, export.',
      'Always keep originals. Export a compressed copy for sharing. Avoid loud copyrighted music if you will post publicly without a licence.',
    ],
    examples: [
      {
        title: 'Project photo set',
        text: 'Crop and brighten three photos, then export medium-size JPEGs for a report instead of huge unedited files.',
      },
      {
        title: 'Short school video',
        text: 'Trim silence at the start, add a title card, and export in a common size such as 1080p.',
      },
    ],
    keyPoints: [
      'Photos: crop, light, colour, export',
      'Video: timeline, trim, order, optional titles/audio',
      'Keep originals; share compressed exports',
      'Respect music and image copyright',
    ],
    tryIt: {
      title: 'Try it – Timeline idea',
      instruction:
        'Your clip has 10 seconds of blank staring at the start. What should you do before exporting?',
      hint: 'Trim or cut the unused start so viewers see the useful part sooner.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'A timeline in video editing is used to:',
          options: [
            'Only change the computer clock',
            'Arrange and trim clips in order over time',
            'Format the hard disk',
            'Create email passwords',
          ],
          correctIndex: 1,
          explanation: 'The timeline is where clips are sequenced and trimmed for the final video.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'A basic photo edit often includes:',
          options: [
            'Deleting the operating system',
            'Cropping and adjusting brightness or colour',
            'Turning off all backups forever',
            'Sharing your banking OTP',
          ],
          correctIndex: 1,
          explanation: 'Crop and light/colour adjustments are everyday photo improvements.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Before posting a video publicly you should consider:',
          options: [
            'Using any song with no thought of rights',
            'Copyright of music and whether you may use it',
            'Never exporting at all',
            'Hiding the export in system32 only',
          ],
          correctIndex: 1,
          explanation: 'Public posts need permission or licence for music and other protected content.',
        },
      ],
    },
  },

  'l6-4': {
    id: 'l6-4',
    levelId: 6,
    title: 'Graphic & Thumbnail Design',
    duration: '12 min',
    xp: 30,
    explanation: [
      'Thumbnails and small graphics must stay readable when tiny. Use bold text, strong contrast and one clear focal point.',
      'Good design limits fonts (often one or two), aligns elements, and avoids clutter. White space helps the eye rest.',
      'For video or course thumbnails, faces and high contrast often attract attention — still stay honest about the content.',
      'Check the design at actual display size (phone screen or platform preview) before you publish.',
    ],
    examples: [
      {
        title: 'YouTube-style thumbnail',
        text: 'Large three-word title, high-contrast background, one clear subject — readable even as a small preview.',
      },
      {
        title: 'Event banner',
        text: 'Date and title in the largest type; details in smaller text; logo in a consistent corner.',
      },
    ],
    keyPoints: [
      'Readable at small size beats tiny detail',
      'Contrast and limited fonts help clarity',
      'One main idea per thumbnail',
      'Preview at real size before publishing',
    ],
    tryIt: {
      title: 'Try it – Thumbnail check',
      instruction:
        'Shrink your design to the size of a large postage stamp. Can you still read the main words? If not, what should change?',
      hint: 'Increase text size, simplify words, or boost contrast until the main message is clear.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'A strong thumbnail usually has:',
          options: [
            'Unreadably small text and low contrast',
            'Clear focal point, bold text and strong contrast',
            'Ten different fonts fighting each other',
            'No title and a blank grey box only',
          ],
          correctIndex: 1,
          explanation: 'Clarity at small size comes from contrast, focus and readable type.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Using many decorative fonts in one small graphic often:',
          options: [
            'Always improves professionalism',
            'Makes the design harder to read',
            'Increases battery life',
            'Removes the need for any image',
          ],
          correctIndex: 1,
          explanation: 'Too many fonts create clutter and reduce readability.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Before publishing a thumbnail you should:',
          options: [
            'Never look at it again',
            'Preview it at roughly the size viewers will see',
            'Only open it in Task Manager',
            'Convert it to an .exe installer',
          ],
          correctIndex: 1,
          explanation: 'Real-size preview catches text that is too small or low-contrast.',
        },
      ],
    },
  },

  'l6-5': {
    id: 'l6-5',
    levelId: 6,
    title: 'Social Media Creatives',
    duration: '10 min',
    xp: 25,
    explanation: [
      'Social creatives are posts, stories, reels covers and banners sized for each platform (for example square post vs vertical story).',
      'Keep branding consistent: similar colours, logo placement and tone so people recognise your school club or project.',
      'Write short on-image text. Put longer details in the caption. Use alt text or clear captions where platforms allow for accessibility.',
      'Respect copyright and privacy: your photos, licensed assets, or clearly free resources — and never post classmates’ private data without permission.',
    ],
    examples: [
      {
        title: 'Club announcement',
        text: 'Square post with event name and date; full venue details in the caption; club colours matching earlier posts.',
      },
      {
        title: 'Story vs feed',
        text: 'Story is vertical and short-lived; feed post may be square and stay on the profile — design sizes differ.',
      },
    ],
    keyPoints: [
      'Match canvas size to the platform',
      'Consistent colours and logo build recognition',
      'Short text on image; detail in caption',
      'Copyright and privacy still apply online',
    ],
    tryIt: {
      title: 'Try it – Size choice',
      instruction:
        'You need a 24-hour story-style update and a permanent profile post. Should both use the exact same pixel size without checking?',
      hint: 'No — stories are usually vertical; feed posts often square or landscape. Check each platform’s size.',
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Social media creatives should usually:',
          options: [
            'Ignore platform image sizes',
            'Use sizes that match the target platform',
            'Always be printed on A0 only',
            'Include private passwords in the image',
          ],
          correctIndex: 1,
          explanation: 'Each platform expects certain dimensions for posts and stories.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Consistent brand colours and logo placement help:',
          options: [
            'Hide the account forever',
            'People recognise your posts more easily',
            'Bypass all copyright rules',
            'Increase CPU clock speed',
          ],
          correctIndex: 1,
          explanation: 'Visual consistency makes a club or project recognisable in a busy feed.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Using someone else’s photo on a public post without permission is:',
          options: [
            'Always allowed if the image looks nice',
            'A copyright/privacy risk — get permission or use allowed assets',
            'Required by every platform',
            'Only a problem for printed books, never online',
          ],
          correctIndex: 1,
          explanation: 'Online posts still require respect for copyright and people’s privacy.',
        },
      ],
    },
  },
}

export function getLevel6Lesson(id) {
  return LEVEL6_LESSONS[id] || null
}

export function getAllLevel6LessonIds() {
  return Object.keys(LEVEL6_LESSONS)
}
