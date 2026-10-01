// Public curriculum metadata only. Lesson bodies, answer keys and video URLs stay on the server.
export const course = {
  slug: 'machine-learning-foundations',
  title: 'Machine Learning Foundations',
  subtitle: 'Your first idea. Your first model. A project that is actually yours.',
  weeks: 4,
  hours: '4–6 hours a week',
  prerequisite: 'Basic Python',
};

export const units = [
  {
    id: 1,
    title: 'Teach a machine to see patterns',
    short: 'Find the patterns',
    color: 'sage',
    description:
      'Turn a question into a prediction problem. Meet your data and train your first digit classifier.',
    milestone: 'Your project brief',
    assignment:
      'Choose a prediction problem you care about. Describe who it helps, the inputs, the target, a public dataset you can use, and one limitation. Ask one potential user whether the result would be useful.',
    lessons: [
      { id: '1-1', title: 'How a machine learns from examples', kind: 'Concept', minutes: 8 },
      { id: '1-2', title: 'Read your data before training', kind: 'Practice', minutes: 11 },
      {
        id: '1-3',
        title: 'Build a handwritten digit classifier',
        kind: 'Project walkthrough',
        minutes: 25,
      },
    ],
    readings: [
      {
        title: 'Frame an ML problem',
        source: 'Google',
        url: 'https://developers.google.com/machine-learning/problem-framing/ml-framing',
      },
      {
        title: 'Read a table with pandas',
        source: 'pandas',
        url: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/02_read_write.html',
      },
    ],
  },
  {
    id: 2,
    title: 'Give your first model something to beat',
    short: 'Build your first model',
    color: 'peach',
    description:
      'Make a baseline, train a model, and learn what a useful experiment actually looks like.',
    milestone: 'Your first working model',
    assignment:
      'Submit a runnable notebook with a simple baseline, a fixed train/validation/test split, one model, and an experiment log. Explain the metric you chose and what a useful prediction means to a potential user.',
    lessons: [
      { id: '2-1', title: 'What a prediction gets wrong', kind: 'Concept', minutes: 9 },
      { id: '2-2', title: 'Run an experiment you can interpret', kind: 'Practice', minutes: 12 },
      {
        id: '2-3',
        title: 'Predict heating demand from building design',
        kind: 'Project walkthrough',
        minutes: 28,
      },
    ],
    readings: [
      {
        title: 'Linear regression',
        source: 'Google',
        url: 'https://developers.google.com/machine-learning/crash-course/linear-regression',
      },
      {
        title: 'Getting started with scikit-learn',
        source: 'scikit-learn',
        url: 'https://scikit-learn.org/stable/getting_started.html',
      },
    ],
  },
  {
    id: 3,
    title: 'A good score is only the beginning',
    short: 'Learn from the mistakes',
    color: 'lavender',
    description: 'Catch data leakage, investigate errors, and make an improvement you can explain.',
    milestone: 'Your model audit',
    assignment:
      'Explain your evaluation metric, investigate three incorrect predictions, and compare one controlled change with the baseline. Document two limitations. Ask a peer to suggest a failure case.',
    lessons: [
      { id: '3-1', title: 'Why a great score can be misleading', kind: 'Concept', minutes: 10 },
      {
        id: '3-2',
        title: 'Fix the experiment before fixing the model',
        kind: 'Practice',
        minutes: 12,
      },
      {
        id: '3-3',
        title: 'Audit and repair a misleading classifier',
        kind: 'Project walkthrough',
        minutes: 27,
      },
    ],
    readings: [
      {
        title: 'Accuracy, precision, and recall',
        source: 'Google',
        url: 'https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall',
      },
      {
        title: 'Common pitfalls and recommended practices',
        source: 'scikit-learn',
        url: 'https://scikit-learn.org/stable/common_pitfalls.html',
      },
    ],
  },
  {
    id: 4,
    title: 'Make something you can share',
    short: 'Make it yours',
    color: 'yellow',
    description:
      'Clean up your notebook, tell the story behind your decisions, and demo what you built.',
    milestone: 'Your final project and demo',
    assignment:
      'Submit your runnable notebook or repository, a README with data attribution and instructions, baseline and final evaluation, error analysis, and a two-to-three-minute demo or equivalent written walkthrough. Have two people try the instructions and revise one problem.',
    lessons: [
      { id: '4-1', title: 'What makes a project finished', kind: 'Concept', minutes: 8 },
      { id: '4-2', title: 'Explain your work in three minutes', kind: 'Practice', minutes: 10 },
      {
        id: '4-3',
        title: 'From notebook to a real project handoff',
        kind: 'Project walkthrough',
        minutes: 26,
      },
    ],
    readings: [
      {
        title: 'Writing a useful project README',
        source: 'GitHub Docs',
        url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes',
      },
    ],
  },
];

export const allLessons = units.flatMap((unit) =>
  unit.lessons.map((lesson) => ({ ...lesson, unitId: unit.id })),
);
