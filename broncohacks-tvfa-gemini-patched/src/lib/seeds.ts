import type { Lecture } from "@/types";

const now = new Date().toISOString();

export const seedLectures: Lecture[] = [
  {
    id: "sample-machine-learning-lecture",
    title: "Sample Lecture: Intro to Machine Learning",
    sourceType: "library",
    createdAt: now,
    updatedAt: now,
    content: `Introduction to Machine Learning

Today we are covering the basic idea behind machine learning, the major categories of learning, and the difference between training and evaluation.

Machine learning is a branch of artificial intelligence where systems learn patterns from data instead of relying only on hand-written rules. We feed the system examples, and the model adjusts internal parameters so it can make better predictions in the future.

There are three main categories of machine learning. The first is supervised learning. In supervised learning, each example already has a correct answer. If we train a model on housing data with sale prices, the model learns how input features like size, neighborhood, and age relate to price.

The second category is unsupervised learning. In unsupervised learning, the data is not labeled. The goal is to discover structure, like grouping similar customers into clusters or reducing many dimensions into a smaller representation.

The third category is reinforcement learning. In reinforcement learning, an agent interacts with an environment, takes actions, and receives rewards or penalties. Over time, it learns a policy that maximizes long-term reward.

A core part of machine learning is separating training data from testing data. The training set is used to fit the model. The test set is used to estimate how well the model performs on data it has never seen before.

One major problem is overfitting. Overfitting happens when the model memorizes the training data too closely, including noise, and then performs poorly on new examples. We reduce overfitting with strategies like regularization, cross-validation, simpler models, or more representative data.

To evaluate a model, we use metrics such as accuracy, precision, recall, and F1 score. The right metric depends on the problem. In medical diagnosis, for example, recall may matter more than raw accuracy because missing a positive case can be costly.

The main takeaway is that machine learning is about learning useful patterns from data, while staying careful about generalization, bias, and evaluation.`,
  },
];
