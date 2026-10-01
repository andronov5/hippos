import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  ExternalLink,
  FileCheck2,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { allLessons, units } from '../shared/course.mjs';
import { api, message, post } from './api';
import { useAuth } from './auth';
import { Empty, LessonTypeIcon, Logo, Notice, Pill, ProgressBar, Spinner } from './components';
import type { Learning, Lesson, QuizResult, Submission } from './types';

type LabContext = { data: Learning; reload: () => Promise<void> };
export const useLab = () => useOutletContext<LabContext>();
export function LabLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<Learning | null>(null);
  const [error, setError] = useState('');
  const [menu, setMenu] = useState(false);
  const reload = useCallback(async () => {
    try {
      setData(await api<Learning>('/learning'));
      setError('');
    } catch (e) {
      setError(message(e));
      throw e;
    }
  }, []);
  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);
  useEffect(() => setMenu(false), [location.pathname]);
  return (
    <div className="lab-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className={`sidebar ${menu ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Logo />
          <button
            className="icon-button mobile-toggle"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          >
            <X />
          </button>
        </div>
        <div className="workspace-badge">
          <span className="workspace-icon">
            <Leaf size={19} />
          </span>
          <div>
            <strong>The founding cohort</strong>
            <span>ML FOUNDATIONS · BETA 01</span>
          </div>
        </div>
        <span className="nav-label">YOUR LEARNING SPACE</span>
        <nav aria-label="Learning navigation">
          <NavLink to="/learn" end>
            <LayoutDashboard size={18} />
            My learning
          </NavLink>
          <NavLink to="/learn/course">
            <BookOpen size={18} />
            Course library<span className="nav-count">4</span>
          </NavLink>
          <NavLink to="/learn/projects">
            <FolderOpen size={18} />
            My project
          </NavLink>
          <NavLink to="/learn/sessions">
            <CalendarDays size={18} />
            Build room
          </NavLink>
          <NavLink to="/learn/resources">
            <Search size={18} />
            Resources
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin">
              <Settings2 size={18} />
              Manage the lab
            </NavLink>
          )}
        </nav>
        <div className="sidebar-note">
          <Sparkles size={21} />
          <strong>A little progress counts.</strong>
          <p>
            One idea, one experiment,
            <br />
            one step at a time.
          </p>
          <Link to="/sample">
            Revisit the starting point
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <span className="user-avatar">{user?.name.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.role === 'admin' ? 'Lab admin' : 'Founding learner'}</span>
          </div>
          <button
            className="icon-button"
            aria-label="Sign out"
            onClick={() =>
              logout()
                .then(() => navigate('/'))
                .catch((e) => setError(message(e)))
            }
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      {menu && (
        <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMenu(false)} />
      )}
      <div className="lab-main">
        <header className="lab-header">
          <div className="row">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open learning navigation"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <span>Lerabyte Lab</span>
            <ChevronRight size={14} />
            <span className="muted">
              {location.pathname === '/admin' ? 'Admin workspace' : 'Your learning space'}
            </span>
          </div>
          <Link to="/" className="text-link">
            Visit the website
            <ArrowUpRight size={15} />
          </Link>
        </header>
        <main id="main" className="lab-content">
          {error ? (
            <div>
              <Notice error>{error}</Notice>
              <button className="button secondary" onClick={() => reload().catch(() => {})}>
                Try again
              </button>
            </div>
          ) : data ? (
            <Outlet context={{ data, reload } satisfies LabContext} />
          ) : (
            <Spinner />
          )}
        </main>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { data } = useLab();
  const completed = new Set(data.progress.map((p) => p.lesson_id));
  const published = new Set(data.lessons.filter((l) => l.published).map((l) => l.id));
  const next = allLessons.find((l) => published.has(l.id) && !completed.has(l.id));
  const percentage = Math.round((completed.size / allLessons.length) * 100);
  const currentWeek = next?.unitId || 4;
  return (
    <>
      <div className="dashboard-greeting">
        <div>
          <span className="eyebrow">YOUR CURIOSITY, IN PROGRESS</span>
          <h1>
            Hey {user?.name.split(' ')[0]}, let’s build.<span className="greeting-star">✳</span>
          </h1>
          <p>You don’t need to know everything. Just take the next step.</p>
        </div>
        <Pill tone="outline">COHORT 01</Pill>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <section className="continue-card">
            <div className="row spread">
              <Pill tone="white">
                {completed.size ? 'PICK UP WHERE YOU LEFT OFF' : 'YOUR FIRST STEP'}
              </Pill>
              <span className="small-text">WEEK 0{currentWeek} / 04</span>
            </div>
            <div className="continue-body">
              <div>
                <span className="tiny-label">MACHINE LEARNING FOUNDATIONS</span>
                <h2>{next?.title || 'Look at how far you’ve come.'}</h2>
                <p>
                  {next
                    ? 'A small idea today. Something you can build on tomorrow.'
                    : 'You’ve completed the lesson checks. Keep refining your project and review your feedback.'}
                </p>
                <Link
                  className="button dark"
                  to={next ? `/learn/lesson/${next.id}` : '/learn/projects'}
                >
                  {next
                    ? completed.size
                      ? 'Continue learning'
                      : 'Start your first lesson'
                    : 'Open my project'}
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="continue-art" aria-hidden="true">
                <div className="art-ring" />
                <div className="art-tile">
                  <Code2 size={44} strokeWidth={1.3} />
                </div>
                <span className="art-plus">+</span>
                <span className="art-asterisk">✳</span>
              </div>
            </div>
            <div className="continue-progress">
              <div className="row spread">
                <span>{completed.size} of 12 lessons completed</span>
                <strong>{percentage}%</strong>
              </div>
              <ProgressBar value={percentage} />
            </div>
          </section>
          <div className="section-heading compact">
            <h2>Your learning path</h2>
            <Link to="/learn/course" className="text-link">
              View all
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="unit-grid">
            {units.map((unit) => {
              const count = unit.lessons.filter((l) => completed.has(l.id)).length;
              return (
                <Link to={`/learn/course#week-${unit.id}`} className="unit-card" key={unit.id}>
                  <div className="row spread">
                    <span className={`unit-tile ${unit.color}`}>
                      {String(unit.id).padStart(2, '0')}
                    </span>
                    {count === 3 ? (
                      <CheckCircle2 size={20} className="green" />
                    ) : (
                      <span className="tiny-label">WEEK {unit.id}</span>
                    )}
                  </div>
                  <h3>{unit.short}</h3>
                  <p>{unit.lessons.length} lessons · 1 project milestone</p>
                  <div className="unit-progress">
                    <ProgressBar value={Math.round((count / 3) * 100)} />
                    <span>{count}/3</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="project-nudge">
            <span className="project-nudge-icon">
              <FolderOpen size={23} />
            </span>
            <div>
              <span className="tiny-label">MAKE IT YOURS</span>
              <h3>Your idea has a home here.</h3>
              <p>Build your project one weekly milestone at a time.</p>
            </div>
            <Link to="/learn/projects" className="icon-button" aria-label="Open my project">
              <ArrowUpRight size={22} />
            </Link>
          </div>
        </div>
        <aside className="dashboard-secondary">
          <section className="panel weekly-focus">
            <div className="row spread">
              <span className="eyebrow">THIS WEEK’S FOCUS</span>
              <Target size={19} />
            </div>
            <h2>{units[currentWeek - 1].milestone}</h2>
            <p>
              {currentWeek === 1
                ? 'Find a question you care about. Decide what you want to predict and where your data could come from.'
                : units[currentWeek - 1].description}
            </p>
            <ul className="focus-checklist">
              <li>
                <span className={completed.has(`${currentWeek}-1`) ? 'checked' : ''}>
                  {completed.has(`${currentWeek}-1`) ? <Check size={12} /> : null}
                </span>
                Understand the core idea
              </li>
              <li>
                <span className={completed.has(`${currentWeek}-2`) ? 'checked' : ''}>
                  {completed.has(`${currentWeek}-2`) ? <Check size={12} /> : null}
                </span>
                Try a small experiment
              </li>
              <li>
                <span
                  className={data.submissions.some((s) => s.week === currentWeek) ? 'checked' : ''}
                >
                  {data.submissions.some((s) => s.week === currentWeek) ? (
                    <Check size={12} />
                  ) : null}
                </span>
                Submit your milestone
              </li>
            </ul>
            <Link to={`/learn/projects#week-${currentWeek}`} className="text-link">
              Open the assignment
              <ArrowRight size={16} />
            </Link>
          </section>
          <section className="session-card">
            <span className="session-icon">
              <UsersIcon />
            </span>
            <span className="eyebrow">BETTER, TOGETHER</span>
            <h2>{data.session.title}</h2>
            <p>
              {data.session.date
                ? formatDate(data.session.date)
                : 'The first session time is coming soon. Bring a question and something you’re working on.'}
            </p>
            <Link to="/learn/sessions" className="text-link">
              Visit the build room
              <ArrowRight size={16} />
            </Link>
          </section>
          <div className="help-note">
            <HelpCircle size={18} />
            <p>
              Stuck? Save the error and what you tried. We’ll work through it in the build room.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
function UsersIcon() {
  return <MessageCircle size={22} />;
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));
}

export function CourseLibrary() {
  const { data } = useLab();
  const completed = new Set(data.progress.map((p) => p.lesson_id));
  return (
    <>
      <div className="page-title">
        <span className="eyebrow">ONE STEP BUILDS ON THE NEXT</span>
        <h1>Your learning path.</h1>
        <p>Machine Learning Foundations · Four weeks from an idea to a project of your own.</p>
      </div>
      <div className="learning-overview">
        <span className="overview-icon">
          <BookOpen size={25} />
        </span>
        <div>
          <strong>
            {completed.size} of {allLessons.length} lessons completed
          </strong>
          <p>Lesson checks and project reviews are tracked separately.</p>
        </div>
        <Pill>{Math.round((completed.size / 12) * 100)}% COMPLETE</Pill>
      </div>
      <div className="learner-units">
        {units.map((unit) => (
          <section id={`week-${unit.id}`} className="learner-unit" key={unit.id}>
            <div className="learner-unit-heading">
              <span className={`unit-tile ${unit.color}`}>0{unit.id}</span>
              <div>
                <span className="tiny-label">WEEK {unit.id}</span>
                <h2>{unit.title}</h2>
                <p>{unit.description}</p>
              </div>
            </div>
            <div className="lesson-list">
              {unit.lessons.map((lesson, i) => {
                const unlocked = data.lessons.some((l) => l.id === lesson.id && l.published);
                return unlocked ? (
                  <Link to={`/learn/lesson/${lesson.id}`} className="lesson-row" key={lesson.id}>
                    <span
                      className={
                        completed.has(lesson.id) ? 'lesson-status complete' : 'lesson-status'
                      }
                    >
                      {completed.has(lesson.id) ? (
                        <Check size={15} />
                      ) : (
                        String(i + 1).padStart(2, '0')
                      )}
                    </span>
                    <div>
                      <strong>{lesson.title}</strong>
                      <span>
                        <LessonTypeIcon kind={lesson.kind} size={12} />
                        {lesson.kind} · ~{lesson.minutes} min with practice
                      </span>
                    </div>
                    <ChevronRight size={18} />
                  </Link>
                ) : (
                  <div className="lesson-row unavailable" key={lesson.id}>
                    <LockKeyhole size={18} />
                    <div>
                      <strong>{lesson.title}</strong>
                      <span>Not published yet</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to={`/learn/projects#week-${unit.id}`} className="unit-assignment">
              <FileCheck2 size={17} />
              <span>
                Weekly milestone: <strong>{unit.milestone}</strong>
              </span>
              <ArrowUpRight size={17} />
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}

export function LessonPage() {
  const { id } = useParams();
  return <LessonView key={id} id={id || ''} />;
}
function LessonView({ id }: { id: string }) {
  const { data, reload } = useLab();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api<Lesson>(`/lessons/${id}`)
      .then((d) => {
        if (active) setLesson(d);
      })
      .catch((e) => {
        if (active) setError(message(e));
      });
    return () => {
      active = false;
    };
  }, [id]);
  const check = async (e: FormEvent) => {
    e.preventDefault();
    if (!lesson) return;
    setBusy(true);
    setError('');
    try {
      const response = await post<QuizResult>(`/lessons/${id}/quiz`, {
        answers: lesson.quiz.map((_, i) => answers[i]),
      });
      setResult(response);
      if (response.passed) await reload();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  if (!lesson)
    return error ? (
      <>
        <Notice error>{error}</Notice>
        <Link to="/learn/course" className="text-link">
          Back to the course
          <ArrowRight size={16} />
        </Link>
      </>
    ) : (
      <Spinner />
    );
  const unit = units[lesson.unitId - 1];
  const position = allLessons.findIndex((l) => l.id === id);
  const next = allLessons[position + 1];
  const nextAvailable = next && data.lessons.some((l) => l.id === next.id && l.published);
  const done = data.progress.some((p) => p.lesson_id === id);
  return (
    <>
      <div className="breadcrumb">
        <Link to="/learn/course">Course library</Link>
        <span>/</span>Week {lesson.unitId}
        <span>/</span>
        {lesson.kind}
      </div>
      <div className="lesson-page-grid">
        <article className="lesson-article">
          <div className="row spread">
            <Pill>
              WEEK {lesson.unitId} · {lesson.kind.toUpperCase()}
            </Pill>
            {done && (
              <span className="complete-label">
                <CheckCircle2 size={16} />
                Completed
              </span>
            )}
          </div>
          <h1>{lesson.title}</h1>
          <div className="lesson-meta">
            <Clock3 size={15} />
            <span>~{lesson.minutes} min with practice</span>
            <span>·</span>
            <span>With Lera</span>
          </div>
          {lesson.video_url ? (
            <div className="video-frame">
              <iframe
                title={lesson.title}
                src={lesson.video_url}
                allow="fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <div className="written-lesson-note">
              <BookOpen size={21} />
              <div>
                <strong>Start with the written lesson</strong>
                <p>
                  The video walkthrough hasn’t been added yet. The explanation and practice below
                  are ready to explore.
                </p>
              </div>
            </div>
          )}
          <div className="lesson-prose">
            {lesson.body.split(/\n\s*\n/).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <section className="takeaway-card">
            <div className="row">
              <Sparkles size={20} />
              <h2>Keep these ideas with you</h2>
            </div>
            <ul>
              {lesson.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
          <section className="practice-card">
            <span className="eyebrow">YOUR TURN</span>
            <h2>Put the idea to work.</h2>
            <p>{lesson.exercise}</p>
          </section>
          <form className="quiz-card" onSubmit={check}>
            <div className="row spread">
              <span className="eyebrow">A QUICK KNOWLEDGE CHECK</span>
              <Pill>
                {lesson.quiz.length} {lesson.quiz.length === 1 ? 'QUESTION' : 'QUESTIONS'}
              </Pill>
            </div>
            <h2>Did the idea click?</h2>
            <p className="muted">Check your understanding. You can retry as often as you need.</p>
            {lesson.quiz.map((q, index) => (
              <fieldset className="quiz-question" key={index}>
                <legend>
                  {lesson.quiz.length > 1 ? `${index + 1}. ` : ''}
                  {q.prompt}
                </legend>
                {q.options.map((option, optionIndex) => (
                  <label
                    key={option}
                    className={`quiz-radio ${answers[index] === optionIndex ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      required
                      checked={answers[index] === optionIndex}
                      onChange={() => {
                        setAnswers({ ...answers, [index]: optionIndex });
                        setResult(null);
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
                {result && (
                  <Notice error={!result.feedback[index].correct}>
                    {result.feedback[index].explanation}
                  </Notice>
                )}
              </fieldset>
            ))}
            {error && <Notice error>{error}</Notice>}
            {result?.passed ? (
              <Notice>
                <strong>Nice work. This lesson is complete.</strong> Your progress is saved.
              </Notice>
            ) : result ? (
              <Notice error>
                You scored {result.score}%. Review the feedback, update your answers, and try again.
              </Notice>
            ) : null}
            <button disabled={busy} className="button">
              {busy ? 'Checking…' : result?.passed ? 'Check again' : 'Check my understanding'}
              <Check size={17} />
            </button>
          </form>
          <div className="lesson-navigation">
            <Link to="/learn/course" className="text-link">
              <ArrowLeft size={16} />
              Course overview
            </Link>
            <Link
              to={nextAvailable ? `/learn/lesson/${next.id}` : `/learn/projects#week-${unit.id}`}
              className="button secondary"
            >
              {nextAvailable ? 'Next lesson' : 'Open my milestone'}
              <ArrowRight size={17} />
            </Link>
          </div>
        </article>
        <aside className="lesson-sidebar">
          <span className="tiny-label">IN THIS UNIT</span>
          <h2>{unit.short}</h2>
          <div className="mini-lesson-list">
            {unit.lessons.map((l) => (
              <Link className={l.id === id ? 'active' : ''} key={l.id} to={`/learn/lesson/${l.id}`}>
                {data.progress.some((p) => p.lesson_id === l.id) ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <LessonTypeIcon kind={l.kind} size={16} />
                )}
                <span>{l.title}</span>
              </Link>
            ))}
          </div>
          <div className="reading-sidebar">
            <span className="tiny-label">GO A LITTLE DEEPER</span>
            {unit.readings.map((r) => (
              <a href={r.url} target="_blank" rel="noopener noreferrer" key={r.url}>
                <BookOpen size={15} />
                <span>
                  {r.title}
                  <small>{r.source}</small>
                </span>
                <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

export function Projects() {
  const { data, reload } = useLab();
  return (
    <>
      <div className="page-title">
        <span className="eyebrow">SOMETHING ONLY YOU WOULD MAKE</span>
        <h1>Your idea. Your project.</h1>
        <p>
          One small project, four milestones. Submit your work, get feedback, and keep making it
          better.
        </p>
      </div>
      <div className="project-principle">
        <Target size={23} />
        <p>
          <strong>A clear question beats a complicated project.</strong> Pick one prediction
          problem, use a public dataset you can work with, and leave room to investigate mistakes.
        </p>
      </div>
      <div className="project-milestones">
        {units.map((unit) => (
          <ProjectMilestone
            key={unit.id}
            unit={unit}
            submission={data.submissions.find((s) => s.week === unit.id)}
            reload={reload}
          />
        ))}
      </div>
      <div className="project-rubric">
        <h2>What thoughtful work looks like</h2>
        <div>
          {[
            'A clear problem and appropriate data',
            'A baseline and fair evaluation',
            'Decisions you can explain',
            'Errors and limitations investigated',
            'Instructions someone else can follow',
          ].map((text, i) => (
            <span key={text}>
              <span>0{i + 1}</span>
              {text}
            </span>
          ))}
        </div>
        <p>
          Completing lesson checks does not automatically pass your project. Feedback and revisions
          are part of the process.
        </p>
      </div>
    </>
  );
}
function ProjectMilestone({
  unit,
  submission,
  reload,
}: {
  unit: (typeof units)[number];
  submission?: Submission;
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(!submission);
  const [url, setUrl] = useState(submission?.url || '');
  const [notes, setNotes] = useState(submission?.notes || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await post('/submissions', { week: unit.id, url, notes });
      await reload();
      setEditing(false);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  const status = submission?.status;
  const label =
    status === 'reviewed'
      ? 'Reviewed'
      : status === 'revision_requested'
        ? 'Revision requested'
        : status === 'submitted'
          ? 'Submitted'
          : 'Ready when you are';
  return (
    <section className="milestone-card" id={`week-${unit.id}`}>
      <div className="milestone-heading">
        <span className={`unit-tile ${unit.color}`}>0{unit.id}</span>
        <div>
          <span className="tiny-label">WEEK {unit.id} MILESTONE</span>
          <h2>{unit.milestone}</h2>
        </div>
        <Pill
          tone={
            status === 'reviewed' ? 'success' : status === 'revision_requested' ? 'warning' : ''
          }
        >
          {label}
        </Pill>
      </div>
      <p>{unit.assignment}</p>
      {submission?.feedback && (
        <div className="feedback-card">
          <MessageCircle size={20} />
          <div>
            <strong>Feedback from Lera</strong>
            <p>{submission.feedback}</p>
            {status === 'submitted' && (
              <small>
                From your previous review. Your latest revision is waiting for feedback.
              </small>
            )}
          </div>
        </div>
      )}
      {editing ? (
        <form onSubmit={submit}>
          <label>
            Link to your project or notebook
            <input
              type="url"
              required
              maxLength={2048}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/you/your-project"
            />
            <span className="field-help">Use an HTTPS link. Make sure Lera can open it.</span>
          </label>
          <label>
            Your reflection
            <textarea
              rows={3}
              required
              minLength={20}
              maxLength={3000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you try? What changed? Where would feedback help?"
            />
          </label>
          {error && <Notice error>{error}</Notice>}
          <div className="row">
            <button className="button small" disabled={busy}>
              {busy ? 'Saving…' : submission ? 'Submit revision' : 'Submit milestone'}
              <ArrowRight size={16} />
            </button>
            {submission && (
              <button
                type="button"
                className="button ghost small"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="submitted-work">
          <div>
            <a
              href={submission?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Open submitted work
              <ExternalLink size={14} />
            </a>
            <p>{submission?.notes}</p>
            <small className="muted">
              Last submitted{' '}
              {submission ? new Date(submission.updated_at).toLocaleDateString() : ''}
            </small>
          </div>
          <button className="button secondary small" onClick={() => setEditing(true)}>
            <Plus size={15} />
            Revise
          </button>
        </div>
      )}
    </section>
  );
}

export function Sessions() {
  const { data } = useLab();
  const session = data.session;
  const isPast = session.date && new Date(session.date).getTime() < Date.now();
  return (
    <>
      <div className="page-title">
        <span className="eyebrow">BRING YOUR QUESTIONS. BRING YOURSELF.</span>
        <h1>The build room.</h1>
        <p>
          A weekly space to talk through ideas, untangle problems, and see what everyone is making.
        </p>
      </div>
      <div className="build-room-grid">
        <section className="build-room-card">
          <div className="row spread">
            <Pill tone="white">
              {session.date
                ? isPast
                  ? 'MOST RECENT SESSION'
                  : 'GROUP SESSION'
                : 'SCHEDULE COMING SOON'}
            </Pill>
            <MessageCircle size={24} />
          </div>
          <h2>{session.title}</h2>
          <p>{session.description}</p>
          <div className="session-details">
            <span>
              <CalendarDays size={19} />
              {session.date ? formatDate(session.date) : 'Time to be confirmed with the cohort'}
            </span>
            <span>
              <Clock3 size={19} />
              About 60 minutes
            </span>
            <span>
              <BookOpen size={19} />
              Your notebook, your questions, your next step
            </span>
          </div>
          {session.url ? (
            <a href={session.url} target="_blank" rel="noopener noreferrer" className="button dark">
              Open the session link
              <ArrowUpRight size={18} />
            </a>
          ) : (
            <div className="session-pending">
              <LockKeyhole size={16} />
              The meeting link will appear here when it’s ready.
            </div>
          )}
        </section>
        <section className="panel session-prep">
          <span className="eyebrow">A LITTLE PREPARATION HELPS</span>
          <h2>Make the most of it.</h2>
          <ol>
            <li>
              <strong>Bring one specific question.</strong>
              <p>Include the error, what you expected, and what you already tried.</p>
            </li>
            <li>
              <strong>Show something unfinished.</strong>
              <p>A small experiment or a stubborn problem is enough.</p>
            </li>
            <li>
              <strong>Give someone a useful thought.</strong>
              <p>Ask a kind question. Share an observation. Be a good peer.</p>
            </li>
          </ol>
        </section>
      </div>
      <div className="community-values">
        <Leaf size={23} />
        <div>
          <h2>Different starting points. Shared curiosity.</h2>
          <p>
            Be patient with each other. Explain jargon, make room for different accents and time
            zones, and ask before sharing someone else’s work.
          </p>
        </div>
      </div>
    </>
  );
}
