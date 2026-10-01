// Seed content. Admin edits are stored in SQLite; private content never enters the browser bundle.
const q = (prompt, options, answer, explanation) => ({ prompt, options, answer, explanation });
export const lessonContent = {
  '1-1': {
    body: `A model learns a pattern from examples. Imagine a table of handwritten digits: each row describes one picture, and its label tells us which number a person wrote. Training lets a model find relationships between the pixels and those labels. Prediction applies the learned pattern to another picture.

A sample is one example. Features are the pieces of information available when making a prediction. A target is the answer you want to predict. For a digit classifier, the sample is an image, its pixel values are features, and its digit label is the target.

Learning a pattern does not guarantee understanding or accuracy. An unusual handwriting style can confuse a model. We need examples it has never trained on to see how well its pattern generalizes.

Try it: write down three prediction tasks from your interests. For each, name the sample, features, and target. Could the information you propose actually be known at prediction time?`,
    takeaways: [
      'Samples are examples; features are inputs; targets are answers.',
      'Classification predicts a category. Regression predicts a number.',
      'An unseen example is a better check than a memorized training example.',
    ],
    exercise:
      'Choose one of your three ideas. Explain its inputs and target to a friend without using the words “AI” or “algorithm.”',
    quiz: [
      q(
        'In a digit classifier, what is the target?',
        ['The image width', 'The number written in the image', 'The number of training examples'],
        1,
        'The target is the answer we want to predict: the digit label.',
      ),
    ],
  },
  '1-2': {
    body: `Before training, inspect the table. How many rows and columns does it have? What does one row represent? Which values are missing? Are some columns measured after the answer is already known?

Divide data by purpose. The training set teaches the model. The validation set helps you compare choices. The test set gives a final estimate after those choices are fixed. Looking at the test score repeatedly and tuning for it turns the test set into another validation set.

A random split is not always appropriate. If the same person appears in multiple rows, keep that person's rows together. If you are predicting the future, respect time order. The split should resemble how your model will actually be used.

Try it: inspect your chosen dataset's source and license. Write a short data dictionary and identify one column that would be suspiciously informative about the target.`,
    takeaways: [
      'Read the data documentation before trusting column names.',
      'Keep the final test set separate from model selection.',
      'Match your split to the real prediction situation.',
    ],
    exercise:
      'List your dataset source, its license, the meaning of one row, the target, and any columns you would exclude.',
    quiz: [
      q(
        'Which set should guide your choice between two model settings?',
        ['The validation set', 'The final test set', 'The combined training and test sets'],
        0,
        'Use validation data for choices. Save the test set for a final evaluation.',
      ),
    ],
  },
  '1-3': {
    body: `The scikit-learn digits dataset contains small 8 by 8 grayscale images. Each image becomes 64 numerical features. The labels are the digits zero through nine. This compact dataset runs on a normal laptop CPU.

Start with a fixed split into training, validation, and test data. Fit a DummyClassifier as a simple baseline using only training data. Then fit a small DecisionTreeClassifier. Compare both models on the same validation examples. A better score is evidence of a useful pattern on this split, not a promise about every handwritten digit.

Look at three mistakes. Display the image, the true label, and the model prediction. Change one setting, such as the tree's maximum depth, and record what happened. Leave the test set untouched while making these choices.

Your own project can use a different dataset. The reusable process is the same: inspect, split, build a baseline, train, evaluate, and investigate.`,
    takeaways: [
      'Build a baseline before celebrating a model score.',
      'Compare models on the same held-out examples.',
      'Inspect actual mistakes as well as a summary metric.',
    ],
    exercise:
      'Use load_digits, train_test_split, DummyClassifier, and DecisionTreeClassifier to reproduce this workflow. Record one deliberate change and inspect three errors.',
    quiz: [
      q(
        'Why build a baseline?',
        [
          'It guarantees the final model is correct',
          'It gives the model a simple reference to beat',
          'It replaces validation data',
        ],
        1,
        'A baseline makes a score meaningful by providing a simple comparison.',
      ),
      q(
        'How many pixel features does an 8 by 8 image have?',
        ['16', '64', '80'],
        1,
        'Eight rows times eight columns gives 64 pixel values.',
      ),
      q(
        'After changing tree depth, what should you compare?',
        [
          'Validation results on the same split',
          'Only the training score',
          'The final test score after every change',
        ],
        0,
        'Use the same validation split for a controlled comparison.',
      ),
    ],
  },
  '2-1': {
    body: `A regression model predicts a number. A simple linear model combines input values with learned weights and an intercept. Training changes those parameters to reduce a chosen loss on training examples.

Suppose a model predicts 10, 16, and 20 while the actual values are 12, 15, and 25. Its absolute errors are 2, 1, and 5. Mean absolute error, or MAE, is their average: 8 divided by 3, approximately 2.67. It uses the same units as the target.

A metric becomes useful when connected to a decision. An average error of three might be acceptable for one application and unacceptable for another. Ask what happens when the model is wrong and whether large individual errors matter more than average errors.`,
    takeaways: [
      'Regression predicts a numerical quantity.',
      'MAE averages the absolute size of prediction errors.',
      'A useful metric connects to what the prediction is for.',
    ],
    exercise:
      'Calculate MAE by hand for actual values [4, 8, 12] and predictions [5, 5, 14]. Explain what its units would be.',
    quiz: [
      q(
        'What is the MAE for actual values [4, 8, 12] and predictions [5, 5, 14]?',
        ['2', '6', '−2'],
        0,
        'The absolute errors are 1, 3, and 2. Their average is 2.',
      ),
    ],
  },
  '2-2': {
    body: `An experiment starts with a question. For example: does a deeper tree reduce validation error? Keep the data split and evaluation metric fixed, change one planned setting, and record the result.

Include a baseline, such as a DummyRegressor. Record what data you used, the model settings, the metric, and the observed result. A failed idea is useful evidence when you can explain what you tested.

Preprocessing is part of the model. Learn imputation values, scaling statistics, or category mappings from training data. Apply the fitted transformation to validation data. A scikit-learn Pipeline helps keep these steps together.`,
    takeaways: [
      'Write the experiment question before changing the model.',
      'Keep a short log of settings and outcomes.',
      'Fit preprocessing only on training data.',
    ],
    exercise:
      'Create a three-row experiment log: baseline, first model, and one planned change. Write a prediction before running the third row.',
    quiz: [
      q(
        'Where should a scaler learn its mean and variance?',
        ['All available data', 'Only the test set', 'Only the training set'],
        2,
        'Fitting a scaler on validation or test data leaks information from evaluation into training.',
      ),
    ],
  },
  '2-3': {
    body: `The UCI Energy Efficiency dataset describes simulated building designs. It has eight design inputs and two targets: heating load and cooling load. For this project, choose heating load as the target. Keep both target columns out of the input features.

Read the documentation before modeling. Some numerical codes represent categories, such as orientation. Choose preprocessing that matches what a column means. Use a pipeline so transformations are fitted only on the training partition.

Compare a mean-prediction baseline with a regression model using the same validation data and MAE. Inspect large errors and record one controlled experiment. Keep your final test partition reserved.

This dataset is simulated. A good result here does not prove the model can estimate energy bills for real homes. Credit the dataset authors and its CC BY 4.0 license in your project.`,
    takeaways: [
      'Exclude both heating and cooling targets from the features.',
      'Numbers can encode categories rather than continuous quantities.',
      'State that the data is simulated when explaining results.',
    ],
    exercise:
      'Download the dataset from the UCI source, document the input columns, fit a baseline and a regressor, and compare validation MAE.',
    quiz: [
      q(
        'Which columns should be excluded from the model inputs?',
        ['Only heating load', 'Both heating and cooling load', 'All building dimensions'],
        1,
        'Both are outcome columns. Use the eight design inputs for this task.',
      ),
      q(
        'A lower validation MAE generally indicates what?',
        [
          'Smaller average absolute errors on that validation set',
          'A guarantee of better predictions for all real buildings',
          'More accurate category labels',
        ],
        0,
        'MAE describes average absolute error on the examples evaluated.',
      ),
      q(
        'What should your project description disclose?',
        [
          'That the data is simulated',
          'That the model was tested on every building',
          'That any positive score proves usefulness',
        ],
        0,
        'Simulation is a material limitation when considering real-world use.',
      ),
    ],
  },
  '3-1': {
    body: `Imagine 99 out of 100 messages are harmless. A classifier that always predicts “harmless” is 99 percent accurate and still misses every harmful message. Accuracy alone hides the failure we care about.

For a chosen positive class, precision asks: of the examples predicted positive, how many actually were positive? Recall asks: of the actual positives, how many did we find? False positives and false negatives can have very different costs.

Choose a metric for the problem, then inspect examples. For a multi-class task like digits, review the confusion matrix and per-class results. For a regression task, inspect the distribution and size of numerical errors instead.`,
    takeaways: [
      'Class imbalance can make a weak model look accurate.',
      'Precision and recall answer different questions.',
      'Match the metric to the cost of mistakes.',
    ],
    exercise:
      'Describe one project where false positives matter more and one where false negatives matter more. Explain why.',
    quiz: [
      q(
        'A model predicts every rare positive example as negative. What is its positive-class recall?',
        ['100 percent', 'Zero', 'The same as overall accuracy'],
        1,
        'It finds none of the actual positives, so recall is zero.',
      ),
    ],
  },
  '3-2': {
    body: `Data leakage happens when training uses information that would not be available for a real prediction. An obvious example is including the answer as an input. A subtler example is learning preprocessing statistics from the whole dataset before splitting.

Audit the experiment before changing algorithms. Check for duplicated examples across partitions, target-derived columns, time order, and preprocessing fitted on evaluation data. A pipeline fixes some preprocessing mistakes, but it cannot decide whether a feature belongs in the problem.

Overfitting means a model matches its training examples better than it generalizes to new ones. Compare training and validation behavior, simplify the model where appropriate, and judge changes with the same fair evaluation.`,
    takeaways: [
      'Unexpectedly strong results deserve investigation.',
      'A pipeline does not automatically prevent every form of leakage.',
      'A fair experiment matters more than an impressive number.',
    ],
    exercise:
      'Audit your feature list and splitting code. Write down when each feature becomes available and where preprocessing is fitted.',
    quiz: [
      q(
        'Which is a target leakage example?',
        ['A digit image pixel', 'A column copied from the answer label', 'A fixed random seed'],
        1,
        'A copy of the answer gives the model information that is unavailable for a new prediction.',
      ),
    ],
  },
  '3-3': {
    body: `Create a clearly labeled flawed experiment in a separate scratch notebook: add a copy of the digit target to the features. Observe the misleading validation score. Do not present this score as a legitimate result.

Repair the experiment by removing the leaked column and checking the split. Refit the baseline and classifier with only legitimate features. Compare both on the same validation examples. A lower score after repair is a more honest result.

Inspect three mistakes. Is an image ambiguous? Are some digits confused repeatedly? Try one justified change and record what it improves or worsens. Your report should describe the flaw, the repair, and the limits of the repaired model.`,
    takeaways: [
      'Label deliberately flawed examples clearly.',
      'Removing leakage can lower a score while improving the experiment.',
      'A useful audit explains both errors and limitations.',
    ],
    exercise:
      'Write an audit note with four parts: flaw, evidence, repair, and remaining limitation. Apply the same checklist to your own project.',
    quiz: [
      q(
        'Your score falls after removing a leaked feature. What does that suggest?',
        [
          'The repaired evaluation may be more honest',
          'You should restore the leaked feature',
          'The baseline is no longer needed',
        ],
        0,
        'The earlier score benefited from unavailable information.',
      ),
      q(
        'What makes the before-and-after comparison interpretable?',
        [
          'Changing the split each time',
          'Using the same validation examples and metric',
          'Comparing only training scores',
        ],
        1,
        'A fixed evaluation isolates the effect of the repair.',
      ),
      q(
        'What belongs in your audit?',
        [
          'Only the best score',
          'The flaw, the repair, and remaining limitations',
          'A claim that errors are impossible',
        ],
        1,
        'An audit should make the reasoning and limits visible.',
      ),
    ],
  },
  '4-1': {
    body: `A finished project should be understandable to someone who did not watch you build it. Give it a clear question, a runnable notebook or script, and a README that explains how to reproduce the result.

Include the dataset source and license, environment or dependencies, run instructions, baseline and evaluation metric, and known limitations. Remove private information and secrets before sharing. Do not publish a dataset unless its license permits it.

Start from a fresh environment or restart your notebook kernel and run every cell in order. This catches hidden state, missing imports, and undocumented files. Another person's attempt to run it is an even better check.`,
    takeaways: [
      'A README is part of the project.',
      'Data attribution and limitations belong next to the results.',
      'Test a clean run before handing over the work.',
    ],
    exercise:
      'Ask someone to follow your instructions without helping them. Record where they get stuck and fix one issue.',
    quiz: [
      q(
        'Which check best reveals hidden notebook state?',
        [
          'Reading only the output cells',
          'Restarting the kernel and running all cells in order',
          'Renaming the file',
        ],
        1,
        'A fresh sequential run shows whether the notebook depends on earlier hidden execution.',
      ),
    ],
  },
  '4-2': {
    body: `A short demo has a simple arc: the problem, the data, a prediction, the evidence, and a limitation. Show the actual project. Explain one decision you made and one thing you changed after investigating a mistake.

Avoid reading every line of code. Explain why a baseline was useful, why you chose the metric, and what the model still gets wrong. A failed experiment can be an excellent part of the story if it changed your understanding.

Credit help and tools honestly. If you used an AI assistant, describe where it helped and how you checked its output. You should be able to explain the work and make a purposeful change yourself. A captioned or written walkthrough is welcome.`,
    takeaways: [
      'Explain decisions rather than narrating every line.',
      'Show one real failure alongside the result.',
      'Disclose assistance and describe your verification.',
    ],
    exercise:
      'Draft five sentences: problem, approach, result, mistake, next step. Use them as the outline for a two-to-three-minute demo.',
    quiz: [
      q(
        'What belongs in a credible demo?',
        [
          'Only the strongest result',
          'A decision, evidence, and a limitation',
          'A guarantee the model always works',
        ],
        1,
        'Evidence and limitations help an audience judge what the result actually means.',
      ),
    ],
  },
  '4-3': {
    body: `Once your model choices are fixed, evaluate on the reserved test set. Record the result without tuning again to make that number better. If the result exposes a problem, explain it honestly; a new development cycle needs a new independent evaluation strategy.

Package the project with clear run instructions, data attribution, the baseline, the final metric, and examples of errors. Include a demonstration that someone can understand without running code. Ask two people to try the handoff and revise one issue.

Submit your project link and short reflection. Completion is about a valid evaluation, clear reasoning, reproducibility, and thoughtful limitations. A finished project can still have unanswered questions. Those questions give you your next experiment.`,
    takeaways: [
      'Use the final test set after model choices are fixed.',
      'Make your result reproducible and your limits explicit.',
      'A thoughtful next experiment is a strong ending.',
    ],
    exercise:
      'Submit your final project and demo. Write what changed after peer feedback and the one experiment you would try next.',
    quiz: [
      q(
        'When should you use the reserved final test set?',
        [
          'After model choices are fixed',
          'After every setting change',
          'Before inspecting the training data',
        ],
        0,
        'It provides an independent final evaluation after development choices.',
      ),
      q(
        'What should a project handoff contain?',
        [
          'Only a screenshot of the score',
          'Run instructions, attribution, evaluation, and limitations',
          'Only the model name',
        ],
        1,
        'These let someone reproduce and assess the work.',
      ),
      q(
        'Does completing the lessons automatically mean your project passed review?',
        ['Yes', 'No, project feedback is a separate review'],
        1,
        'Learning progress and project review measure different things.',
      ),
    ],
  },
};
