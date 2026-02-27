import type { Card, Course, Segment } from "./types";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function makeMockCourse(inputUrl: string): Course {
  const courseId = id("course");
  const baseSentences = [
    "I used to think learning English was hard.",
    "Then I built a tiny daily habit.",
    "Focus on comprehension, not perfection.",
    "Repeat the basics until they feel automatic.",
    "Tiny wins compound over time.",
  ];

  const segments: Segment[] = Array.from({ length: 5 }).map((_, i) => {
    const sentence = baseSentences[i % baseSentences.length];
    const cards: Card[] = [
      {
        id: id("card"),
        type: "listen_read",
        text: sentence,
      },
      {
        id: id("card"),
        type: "listen_read",
        text: "Tap words to see mock definitions and examples.",
      },
      {
        id: id("card"),
        type: "mcq",
        question: "What does ‘compound’ mean here?",
        choices: [
          { id: id("c"), text: "to combine and grow", isCorrect: true },
          { id: id("c"), text: "to stop completely", isCorrect: false },
          { id: id("c"), text: "to explain once", isCorrect: false },
        ],
        explanation: "In learning, small improvements add up and grow over time.",
      },
    ];

    return {
      idx: i,
      title: `Segment ${i + 1}: ${sentence.slice(0, 28)}…`,
      status: i === 0 ? "in_progress" : "not_started",
      cards,
    };
  });

  return {
    id: courseId,
    sourceUrl: inputUrl,
    title: `Mock Course: ${new URL(inputUrl).hostname}`,
    createdAt: Date.now(),
    segments: segments.map((s) => ({ ...s })),
  };
}
