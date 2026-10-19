import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
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
  ChevronDown,
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
      <aside id="learning-sidebar" className={`sidebar ${menu ? 'open' : ''}`}>
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
            <strong>ML Foundations</strong>
            <span>COHORT 01 · FREE BETA</span>
          </div>
        </div>
        <nav aria-label="Learning navigation">
          <NavLink to="/learn" end>
            <LayoutDashboard size={18} />
            Overview
          </NavLink>
          <NavLink
            to="/learn/course"
            className={({ isActive }) =>
              isActive || location.pathname.startsWith('/learn/lesson/') ? 'active' : ''
            }
          >
            <BookOpen size={18} />
            Lessons
          </NavLink>
          <NavLink to="/learn/projects">
            <FolderOpen size={18} />
            My project
          </NavLink>
          <NavLink to="/learn/sessions">
            <CalendarDays size={18} />
            Sessions
          </NavLink>
          <NavLink to="/learn/resources">
            <Search size={18} />
            Resources
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin">
              <Settings2 size={18} />
              Admin
            </NavLink>
          )}
        </nav>
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
              aria-expanded={menu}
              aria-controls="learning-sidebar"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <span>Lerabyte Lab</span>
            <ChevronRight size={14} />
            <span className="muted">
              {location.pathname === '/admin'
                ? 'Admin'
                : location.pathname.includes('/lesson/')
                  ? 'Lessons'
                  : (
                      {
                        '/learn': 'Overview',
                        '/learn/course': 'Lessons',
                        '/learn/projects': 'My project',
                        '/learn/sessions': 'Sessions',
                        '/learn/resources': 'Resources',
                      } as Record<string, string>
                    )[location.pathname] || 'Learning'}
            </span>
          </div>
          <Link to="/" className="text-link">
            Website
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
          <h1>Welcome back, {user?.name.split(' ')[0]}.</h1>
          <p>Here’s your next step.</p>
        </div>
      </div>
      <div className="dashboard-grid simple-dashboard">
        <section className="continue-card">
          <div className="row spread">
            <Pill tone="white">{next ? 'UP NEXT' : 'LESSONS COMPLETE'}</Pill>
            <span className="small-text">WEEK {currentWeek} OF 4</span>
          </div>
          <div className="continue-body">
            <div>
              <h2>{next?.title || 'Ready to share your project?'}</h2>
              <p>
                {next
                  ? `${next.kind} · About ${next.minutes} minutes`
                  : 'Review your feedback and finish your final milestone.'}
              </p>
              <Link
                className="button dark"
                to={next ? `/learn/lesson/${next.id}` : '/learn/projects'}
              >
                {next ? (completed.size ? 'Continue lesson' : 'Start learning') : 'Open my project'}
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="continue-art" aria-hidden="true">
              <div className="art-ring" />
              <div className="art-tile">
                <Code2 size={44} strokeWidth={1.3} />
              </div>
            </div>
          </div>
          <div className="continue-progress">
            <div className="row spread">
              <span>
                {completed.size} of {allLessons.length} lessons complete
              </span>
              <Link to="/learn/course" className="text-link">
                All lessons <ArrowRight size={14} />
              </Link>
            </div>
            <ProgressBar value={percentage} />
          </div>
        </section>
        <section className="panel weekly-focus">
          <span className="eyebrow">THIS WEEK’S PROJECT</span>
          <h2>{units[currentWeek - 1].milestone}</h2>
          <p>{units[currentWeek - 1].description}</p>
          <Link to={`/learn/projects#week-${currentWeek}`} className="text-link">
            View milestone <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <div className="dashboard-shortcuts">
        <Link to="/learn/sessions" className="dashboard-shortcut">
          <CalendarDays size={23} />
          <div>
            <h2>Next group session</h2>
            <p>{data.session.date ? formatDate(data.session.date) : 'Date to be confirmed'}</p>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link to="/learn/resources" className="dashboard-shortcut">
          <BookOpen size={23} />
          <div>
            <h2>Weekly readings</h2>
            <p>Resources for your project</p>
          </div>
          <ArrowRight size={18} />
        </Link>
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

function WeekSection({
  id,
  initialOpen,
  className,
  summary,
  children,
}: {
  id: number;
  initialOpen: boolean;
  className: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  const { hash } = useLocation();
  const [expanded, setExpanded] = useState(hash ? hash === `#week-${id}` : initialOpen);
  useEffect(() => {
    if (hash === `#week-${id}`) setExpanded(true);
  }, [hash, id]);
  return (
    <details
      id={`week-${id}`}
      className={className}
      open={expanded}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary>
        {summary}
        <ChevronDown className="accordion-chevron" size={20} />
      </summary>
      {children}
    </details>
  );
}

export function CourseLibrary() {
  const { data } = useLab();
  const completed = new Set(data.progress.map((p) => p.lesson_id));
  const currentWeek =
    allLessons.find(
      (l) =>
        !completed.has(l.id) && data.lessons.some((item) => item.id === l.id && item.published),
    )?.unitId || 4;
  return (
    <>
      <div className="page-title">
        <h1>Lessons</h1>
        <p>Machine Learning Foundations · 4 weeks</p>
      </div>
      <div className="learning-overview">
        <span className="overview-icon">
          <BookOpen size={25} />
        </span>
        <div>
          <strong>
            {completed.size} of {allLessons.length} lessons completed
          </strong>
        </div>
        <Pill>{Math.round((completed.size / 12) * 100)}% COMPLETE</Pill>
      </div>
      <div className="learner-units">
        {units.map((unit) => (
          <WeekSection
            key={unit.id}
            id={unit.id}
            initialOpen={unit.id === currentWeek}
            className="learner-unit week-accordion"
            summary={
              <>
                <span className={`unit-tile ${unit.color}`}>0{unit.id}</span>
                <div className="week-heading-copy">
                  <span className="tiny-label">WEEK {unit.id}</span>
                  <h2>{unit.title}</h2>
                </div>
                <span className="accordion-meta">
                  {unit.lessons.filter((l) => completed.has(l.id)).length}/3 complete
                </span>
              </>
            }
          >
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
          </WeekSection>
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
        <Link to="/learn/course">Lessons</Link>
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
          <nav className="lesson-jumps" aria-label="Lesson sections">
            <a href="#reading">Lesson</a>
            <a href="#practice">Practice</a>
            <a href="#check">Knowledge check</a>
          </nav>
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
                <p>Video coming soon. The written lesson is ready below.</p>
              </div>
            </div>
          )}
          <div className="lesson-prose" id="reading">
            {lesson.body.split(/\n\s*\n/).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <section className="takeaway-card">
            <div className="row">
              <Sparkles size={20} />
              <h2>Key ideas</h2>
            </div>
            <ul>
              {lesson.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
          <section className="practice-card" id="practice">
            <h2>Practice</h2>
            <p>{lesson.exercise}</p>
          </section>
          <form className="quiz-card" id="check" onSubmit={check}>
            <div className="row spread">
              <span className="eyebrow">KNOWLEDGE CHECK</span>
              <Pill>
                {lesson.quiz.length} {lesson.quiz.length === 1 ? 'QUESTION' : 'QUESTIONS'}
              </Pill>
            </div>
            <h2>Check your understanding</h2>
            <p className="muted">You can retry as often as you need.</p>
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
              {busy ? 'Checking…' : result?.passed ? 'Check again' : 'Check answers'}
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
            <span className="tiny-label">RELATED READINGS</span>
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
  const currentWeek =
    data.submissions.find((s) => s.status === 'revision_requested')?.week ||
    units.find((unit) => !data.submissions.some((s) => s.week === unit.id))?.id ||
    4;
  return (
    <>
      <div className="page-title">
        <h1>My project</h1>
        <p>Build one project in four milestones. Submit each step for feedback.</p>
      </div>
      <div className="project-milestones">
        {units.map((unit) => (
          <ProjectMilestone
            key={unit.id}
            unit={unit}
            initialOpen={unit.id === currentWeek}
            submission={data.submissions.find((s) => s.week === unit.id)}
            reload={reload}
          />
        ))}
      </div>
      <details className="project-rubric rubric-details">
        <summary>
          How your project is reviewed <ChevronDown size={18} />
        </summary>
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
      </details>
    </>
  );
}
function ProjectMilestone({
  unit,
  submission,
  reload,
  initialOpen,
}: {
  unit: (typeof units)[number];
  initialOpen: boolean;
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
          : 'Not submitted';
  return (
    <WeekSection
      id={unit.id}
      initialOpen={initialOpen}
      className="milestone-card week-accordion"
      summary={
        <>
          <span className={`unit-tile ${unit.color}`}>0{unit.id}</span>
          <div>
            <span className="tiny-label">WEEK {unit.id}</span>
            <h2>{unit.milestone}</h2>
          </div>
          <Pill
            tone={
              status === 'reviewed' ? 'success' : status === 'revision_requested' ? 'warning' : ''
            }
          >
            {label}
          </Pill>
        </>
      }
    >
      <div className="milestone-content">
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
      </div>
    </WeekSection>
  );
}

export function Sessions() {
  const { data } = useLab();
  const session = data.session;
  const isPast = session.date && new Date(session.date).getTime() < Date.now();
  return (
    <>
      <div className="page-title">
        <h1>Group sessions</h1>
        <p>A weekly hour to work through questions and share your progress.</p>
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
          <h2>Bring two things</h2>
          <ol>
            <li>
              <strong>Bring one specific question.</strong>
              <p>Include the error, what you expected, and what you already tried.</p>
            </li>
            <li>
              <strong>Show something unfinished.</strong>
              <p>A small experiment or a stubborn problem is enough.</p>
            </li>
          </ol>
        </section>
      </div>
    </>
  );
}
