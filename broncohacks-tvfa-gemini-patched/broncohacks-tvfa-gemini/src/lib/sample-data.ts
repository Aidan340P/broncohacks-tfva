import type { Lecture, Note } from "@/types";

const now = new Date().toISOString();

export const DEFAULT_NOTES: Note[] = [
  {
    id: "sample-note-1",
    title: "bio lecture style sample",
    content:
      "cell resp = how cells turn glucose -> ATP. happens mainly in mitochondria.\n\nmain stages:\n- glycolysis: cytoplasm, makes a little ATP fast\n- krebs cycle: finishes breaking stuff down\n- ETC: most ATP here bc proton gradient powers ATP synthase\n\nremember: oxygen = final e- acceptor.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sample-note-2",
    title: "history class style sample",
    content:
      "Industrial Rev.\n1) starts in Britain first\n2) steam power + factories = bigger output\n3) upside: cheaper goods, more jobs in cities\n4) downside: rough labor conds, child labor, pollution\n\nbig theme = tech growth was not equal to social progress.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sample-note-3",
    title: "psych lecture style sample",
    content:
      "classical conditioning = assoc learning\nUCS naturally causes response\nCS starts neutral but eventually triggers it too\nex: bell + food -> salivation\n\nimportant terms: acquisition, extinction, spontaneous recovery",
    createdAt: now,
    updatedAt: now,
  },
];

export const DEFAULT_LECTURES: Lecture[] = [
  {
    id: "sample-lecture-1",
    title: "Introduction to Machine Learning",
    course: "CS 1300",
    instructor: "Prof. Demo",
    sourceType: "text",
    content:
      "Today we are covering the basics of machine learning. Machine learning is a branch of artificial intelligence where systems learn patterns from data instead of following only hand-written rules. In supervised learning, the data comes with labels, and the goal is to learn a mapping from inputs to outputs. In unsupervised learning, there are no labels, so the model searches for patterns or structure on its own. Reinforcement learning is different because an agent interacts with an environment, receives rewards or penalties, and improves by trying to maximize reward over time. We also distinguish between training data, which is used to fit the model, and testing data, which is used to estimate performance on unseen examples. A major risk is overfitting, which happens when the model memorizes the training data too closely and performs poorly on new data. Common ways to reduce overfitting include regularization, cross-validation, and using a simpler model. Finally, to evaluate models we use metrics such as accuracy, precision, recall, and the F1 score.",
    createdAt: now,
    updatedAt: now,
  },
];
