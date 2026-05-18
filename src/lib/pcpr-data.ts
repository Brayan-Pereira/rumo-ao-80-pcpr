export type Topic = {
  id: number;
  name: string;
  answered: number;
  correct: number;
};

export type Subject = {
  key: string;
  name: string;
  short: string;
  topics: Topic[];
};

// Dados servidos pelo backend FastAPI via GET /api/topicos
export const initialSubjects: Subject[] = [];

export function accuracy(t: { answered: number; correct: number }) {
  if (!t.answered) return 0;
  return (t.correct / t.answered) * 100;
}

export function subjectStats(s: Subject) {
  const answered = s.topics.reduce((a, t) => a + t.answered, 0);
  const correct = s.topics.reduce((a, t) => a + t.correct, 0);
  const acc = answered ? (correct / answered) * 100 : 0;
  const startedTopics = s.topics.filter((t) => t.answered > 0).length;
  return { answered, correct, acc, startedTopics, totalTopics: s.topics.length };
}
