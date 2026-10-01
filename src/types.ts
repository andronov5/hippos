export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'learner';
  approved: boolean;
  applicationStatus: string;
};
export type Progress = { lesson_id: string; score: number; completed_at: string };
export type Submission = {
  id: string;
  user_id: string;
  week: number;
  url: string;
  notes: string;
  feedback: string;
  status: 'submitted' | 'revision_requested' | 'reviewed';
  updated_at: string;
  name?: string;
  email?: string;
};
export type Session = { title: string; date: string; url: string; description: string };
export type Learning = {
  lessons: { id: string; published: number; hasVideo: number }[];
  progress: Progress[];
  submissions: Submission[];
  session: Session;
};
export type Lesson = {
  id: string;
  title: string;
  kind: string;
  minutes: number;
  unitId: number;
  body: string;
  video_url: string;
  takeaways: string[];
  exercise: string;
  quiz: { prompt: string; options: string[] }[];
};
export type QuizResult = {
  score: number;
  passed: boolean;
  feedback: { correct: boolean; answer: number; explanation: string }[];
};
export type Application = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  python_level: string;
  readiness: string;
  goal: string;
  availability: string;
  status: string;
  created_at: string;
};
export type AdminData = {
  applications: Application[];
  submissions: Submission[];
  lessons: { id: string; body: string; video_url: string; published: number }[];
  learnerProgress: { id: string; name: string; email: string; completed: number }[];
  session: Session;
};
