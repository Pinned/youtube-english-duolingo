export type CourseId = string;

export type SegmentStatus = "not_started" | "in_progress" | "done";

export type CardBase = {
  id: string;
  type: "listen_read" | "mcq";
};

export type ListenReadCard = CardBase & {
  type: "listen_read";
  text: string;
  audioUrl?: string; // mock; not used in MVP
};

export type McqCard = CardBase & {
  type: "mcq";
  question: string;
  choices: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
};

export type Card = ListenReadCard | McqCard;

export type Segment = {
  idx: number;
  title: string;
  status: SegmentStatus;
  cards: Card[];
  startSec?: number;
  endSec?: number;
};

export type Course = {
  id: CourseId;
  sourceUrl: string;
  title: string;
  createdAt: number;
  segments: Segment[];
};
