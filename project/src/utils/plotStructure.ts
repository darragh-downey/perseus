import { Beat, PlotStructure } from '../contexts/AppContext';

// Save the Cat! beat definitions with detailed descriptions
export const SAVE_THE_CAT_BEATS = [
  {
    name: 'Opening Image',
    percentage: 0,
    description: 'A snapshot of your hero\'s "before" world',
    details: 'Sets the tone and mood of your story. Should contrast with the Final Image.',
    examples: ['Luke Skywalker staring at twin suns', 'Katniss hunting in District 12']
  },
  {
    name: 'Theme Stated',
    percentage: 5,
    description: 'A statement that hints at what your story is about',
    details: 'Usually delivered by a character other than the hero. The moral of the story.',
    examples: ['"With great power comes great responsibility"', '"The needs of the many outweigh the needs of the few"']
  },
  {
    name: 'Setup',
    percentage: 10,
    description: 'Introduce your hero and their ordinary world',
    details: 'Show the hero\'s status quo, their want, need, and the story\'s stakes.',
    examples: ['Harry Potter at the Dursleys', 'Neo in his mundane programmer life']
  },
  {
    name: 'Catalyst',
    percentage: 10,
    description: 'Life-changing event that starts the adventure',
    details: 'The inciting incident that sets the story in motion. Can be physical or emotional.',
    examples: ['Hagrid tells Harry he\'s a wizard', 'Morpheus offers Neo the red pill']
  },
  {
    name: 'Debate',
    percentage: 20,
    description: 'Should the hero accept the challenge?',
    details: 'The hero hesitates. Internal conflict about entering the new world.',
    examples: ['Harry hesitant about Hogwarts', 'Neo questioning reality']
  },
  {
    name: 'Break into Two',
    percentage: 20,
    description: 'Hero commits to the adventure',
    details: 'The point of no return. Hero leaves the familiar world behind.',
    examples: ['Harry boards the Hogwarts Express', 'Neo takes the red pill']
  },
  {
    name: 'B Story',
    percentage: 22,
    description: 'Introduction of love interest or helper',
    details: 'Secondary plot that reinforces the theme. Often romantic or mentor relationship.',
    examples: ['Han Solo and Princess Leia', 'Hermione and Ron for Harry']
  },
  {
    name: 'Fun and Games',
    percentage: 30,
    description: 'The promise of the premise delivered',
    details: 'What the audience came to see. Hero explores the new world.',
    examples: ['Harry learning magic at Hogwarts', 'Neo training in the Matrix']
  },
  {
    name: 'Midpoint',
    percentage: 50,
    description: 'False victory or false defeat',
    details: 'Major plot point that changes everything. Stakes are raised.',
    examples: ['Death Star plans stolen', 'Harry faces Voldemort in graveyard']
  },
  {
    name: 'Bad Guys Close In',
    percentage: 60,
    description: 'Forces of opposition regroup',
    details: 'External and internal pressure mounts. Hero\'s flaws cause problems.',
    examples: ['Empire strikes back', 'Voldemort returns to power']
  },
  {
    name: 'All Is Lost',
    percentage: 75,
    description: 'Hero\'s lowest point',
    details: 'The dark moment. Hero appears defeated. Often involves a death.',
    examples: ['Obi-Wan dies', 'Cedric Diggory killed']
  },
  {
    name: 'Dark Night of the Soul',
    percentage: 80,
    description: 'Hero wallows in hopelessness',
    details: 'Brief moment of despair before the hero finds their strength.',
    examples: ['Luke mourning Obi-Wan', 'Harry grieving Cedric']
  },
  {
    name: 'Break into Three',
    percentage: 80,
    description: 'Hero finds the solution',
    details: 'The "aha!" moment. Hero discovers what they need to succeed.',
    examples: ['Luke trusts the Force', 'Harry understands love\'s power']
  },
  {
    name: 'Finale',
    percentage: 85,
    description: 'Climax and resolution',
    details: 'Final confrontation. Hero uses lessons learned to triumph.',
    examples: ['Death Star destroyed', 'Voldemort temporarily defeated']
  },
  {
    name: 'Final Image',
    percentage: 100,
    description: 'Snapshot of the hero\'s "after" world',
    details: 'Shows how the hero has changed. Should contrast with Opening Image.',
    examples: ['Luke as Jedi hero', 'Harry returning to Hogwarts triumphant']
  }
];

export const generateDefaultBeatSheet = (projectId: string, targetWordCount: number = 80000): PlotStructure => {
  const beats: Beat[] = SAVE_THE_CAT_BEATS.map((beatDef, index) => ({
    id: `beat-${projectId}-${index}`,
    name: beatDef.name,
    percentage: beatDef.percentage,
    description: beatDef.description,
    content: '',
    wordCount: Math.round((targetWordCount * beatDef.percentage) / 100),
    sceneIds: [],
    isCompleted: false
  }));

  return {
    id: `plot-${projectId}`,
    targetWordCount,
    beats,
    themes: [],
    conflicts: [],
    bStories: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Genre-specific beat sheet variations
export const genreTemplates = {
  romance: {
    name: 'Romance',
    beats: [
      { name: 'Meet Cute', percentage: 10, description: 'First meeting between love interests' },
      { name: 'Conflict Introduced', percentage: 25, description: 'What keeps them apart' },
      { name: 'First Kiss', percentage: 50, description: 'Romantic midpoint' },
      { name: 'Black Moment', percentage: 75, description: 'Relationship seems doomed' },
      { name: 'Grand Gesture', percentage: 90, description: 'One proves their love' },
      { name: 'Happily Ever After', percentage: 100, description: 'Couple united' }
    ]
  },
  mystery: {
    name: 'Mystery',
    beats: [
      { name: 'Crime Committed', percentage: 5, description: 'The inciting incident' },
      { name: 'Detective on Case', percentage: 15, description: 'Protagonist takes the case' },
      { name: 'First Clue', percentage: 25, description: 'Investigation begins' },
      { name: 'Red Herring', percentage: 50, description: 'False lead at midpoint' },
      { name: 'Truth Revealed', percentage: 85, description: 'Real culprit exposed' },
      { name: 'Justice Served', percentage: 100, description: 'Resolution and consequences' }
    ]
  },
  thriller: {
    name: 'Thriller',
    beats: [
      { name: 'Ordinary World', percentage: 0, description: 'Hero\'s normal life' },
      { name: 'Inciting Incident', percentage: 10, description: 'Threat introduced' },
      { name: 'First Attack', percentage: 25, description: 'Hero targeted' },
      { name: 'Point of No Return', percentage: 50, description: 'Stakes escalate dramatically' },
      { name: 'Final Confrontation', percentage: 85, description: 'Hero vs. antagonist' },
      { name: 'New Normal', percentage: 100, description: 'Aftermath and resolution' }
    ]
  }
};

export const getGenreTemplate = (genre: keyof typeof genreTemplates, projectId: string, targetWordCount: number = 80000): PlotStructure => {
  const template = genreTemplates[genre];
  if (!template) {
    return generateDefaultBeatSheet(projectId, targetWordCount);
  }

  const beats: Beat[] = template.beats.map((beatDef, index) => ({
    id: `beat-${projectId}-${genre}-${index}`,
    name: beatDef.name,
    percentage: beatDef.percentage,
    description: beatDef.description,
    content: '',
    wordCount: Math.round((targetWordCount * beatDef.percentage) / 100),
    sceneIds: [],
    isCompleted: false
  }));

  return {
    id: `plot-${projectId}-${genre}`,
    targetWordCount,
    beats,
    themes: [],
    conflicts: [],
    bStories: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// AI prompt templates for beat suggestions
export const beatPrompts = {
  'Opening Image': 'Create an opening scene that establishes the tone and shows the protagonist\'s world before change',
  'Theme Stated': 'Write dialogue where a character hints at the story\'s main theme or moral lesson',
  'Setup': 'Describe the protagonist\'s ordinary world, their daily routine, and what they want',
  'Catalyst': 'Create the inciting incident that disrupts the protagonist\'s normal life',
  'Debate': 'Show the protagonist\'s internal struggle about whether to accept the call to adventure',
  'Break into Two': 'Write the moment when the protagonist commits to the journey',
  'B Story': 'Introduce a secondary character who will help the protagonist learn the theme',
  'Fun and Games': 'Show the protagonist exploring their new world and facing initial challenges',
  'Midpoint': 'Create a major revelation or event that raises the stakes significantly',
  'Bad Guys Close In': 'Increase pressure on the protagonist from external and internal forces',
  'All Is Lost': 'Write the darkest moment when the protagonist seems defeated',
  'Dark Night of the Soul': 'Show the protagonist\'s moment of despair and self-reflection',
  'Break into Three': 'Create the moment when the protagonist finds their solution',
  'Finale': 'Write the climactic confrontation and resolution',
  'Final Image': 'Show how the protagonist\'s world has changed since the opening'
};

export const getBeatPrompt = (beatName: string, genre?: string, characterName?: string): string => {
  const basePrompt = beatPrompts[beatName as keyof typeof beatPrompts] || `Create a scene for the ${beatName} beat`;
  
  let prompt = basePrompt;
  if (characterName) {
    prompt = prompt.replace('protagonist', characterName);
  }
  
  if (genre) {
    prompt += ` in a ${genre} story`;
  }
  
  return prompt + `. Keep it concise and focused on the essential story elements.`;
};
