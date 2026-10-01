import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Search,
  Users,
} from 'lucide-react';
import { allLessons, units } from '../shared/course.mjs';
import { api, message, patch } from './api';
import { Empty, Notice, Pill, ProgressBar, Spinner } from './components';
import { useLab } from './learning';
import type { AdminData, Application, Session, Submission } from './types';

type Tab = 'applications' | 'lessons' | 'reviews' | 'cohort' | 'session';
export function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<Tab>('applications');
  const [error, setError] = useState('');
  const { reload: reloadLab } = useLab();
  const load = useCallback(async () => {
    try {
      setData(await api<AdminData>('/admin'));
      setError('');
    } catch (e) {
      setError(message(e));
      throw e;
    }
  }, []);
  useEffect(() => {
    load().catch(() => {});
  }, [load]);
  const refresh = async () => {
    await load();
    await reloadLab();
  };
  if (!data) return error ? <Notice error>{error}</Notice> : <Spinner />;
  const pending = data.applications.filter((a) => a.status === 'pending').length;
  const approved = data.applications.filter((a) => a.status === 'approved').length;
  const reviews = data.submissions.filter((s) => s.status === 'submitted').length;
  const tabs: { id: Tab; label: string; icon: typeof Users; count?: number }[] = [
    { id: 'applications', label: 'Applications', icon: ClipboardList, count: pending },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'reviews', label: 'Project reviews', icon: FileCheck2, count: reviews },
    { id: 'cohort', label: 'Cohort', icon: Users },
    { id: 'session', label: 'Build room', icon: CalendarDays },
  ];
  return (
    <>
      <div className="page-title">
        <span className="eyebrow">THE WORK BEHIND THE GOOD STUFF</span>
        <h1>Make room for curiosity.</h1>
        <p>Review applications, shape the learning path, and help your cohort keep moving.</p>
      </div>
      <div className="admin-stats">
        <div>
          <span>Waiting for review</span>
          <strong>{pending}</strong>
        </div>
        <div>
          <span>Approved learners</span>
          <strong>
            {approved}
            <small>/15</small>
          </strong>
        </div>
        <div>
          <span>Projects to review</span>
          <strong>{reviews}</strong>
        </div>
        <div>
          <span>Published lessons</span>
          <strong>
            {data.lessons.filter((l) => l.published).length}
            <small>/12</small>
          </strong>
        </div>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        {tabs.map((t) => (
          <button
            role="tab"
            aria-selected={tab === t.id}
            key={t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'active' : ''}
          >
            <t.icon size={17} />
            {t.label}
            {!!t.count && <span>{t.count}</span>}
          </button>
        ))}
      </div>
      {error && <Notice error>{error}</Notice>}
      <div role="tabpanel">
        {tab === 'applications' && (
          <Applications applications={data.applications} refresh={refresh} />
        )}{' '}
        {tab === 'lessons' && <LessonEditor lessons={data.lessons} refresh={refresh} />}{' '}
        {tab === 'reviews' && <Reviews submissions={data.submissions} refresh={refresh} />}{' '}
        {tab === 'cohort' && <Cohort learners={data.learnerProgress} />}{' '}
        {tab === 'session' && <SessionEditor session={data.session} refresh={refresh} />}
      </div>
    </>
  );
}
function Applications({
  applications,
  refresh,
}: {
  applications: Application[];
  refresh: () => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const filtered = applications.filter(
    (a) =>
      (status === 'all' || a.status === status) &&
      `${a.name} ${a.email} ${a.goal}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="admin-section-heading">
        <div>
          <h2>Meet your next builders.</h2>
          <p>
            Approved applicants can sign in with their application email. Let them know when their
            place is ready.
          </p>
        </div>
      </div>
      <div className="admin-filters">
        <div className="search-input">
          <Search size={17} />
          <input
            aria-label="Search applications"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or project idea"
          />
        </div>
        <select
          aria-label="Filter application status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All applications</option>
          {['pending', 'approved', 'waitlisted', 'declined'].map((s) => (
            <option value={s} key={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {filtered.length ? (
        <div className="application-list">
          {filtered.map((a) => (
            <ApplicationCard key={a.id} application={a} refresh={refresh} />
          ))}
        </div>
      ) : (
        <Empty
          title={
            applications.length ? 'No applications match' : 'Your first applicants will appear here'
          }
        >
          <p>
            {applications.length
              ? 'Try another search or status.'
              : 'Share the homepage application when you’re ready to recruit your beta.'}
          </p>
        </Empty>
      )}
    </>
  );
}
function ApplicationCard({
  application: a,
  refresh,
}: {
  application: Application;
  refresh: () => Promise<void>;
}) {
  const [status, setStatus] = useState(a.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await patch(`/admin/applications/${a.id}`, { status });
      await refresh();
      setSaved(true);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <details className="admin-application">
      <summary>
        <span className="user-avatar">{a.name.charAt(0).toUpperCase()}</span>
        <div>
          <strong>{a.name}</strong>
          <span>
            {a.email} · {a.timezone}
          </span>
        </div>
        <Pill tone={a.status === 'approved' ? 'success' : ''}>{a.status}</Pill>
      </summary>
      <div className="application-detail">
        <div className="review-field">
          <span>PROJECT GOAL</span>
          <p>{a.goal}</p>
        </div>
        <div className="review-field">
          <span>PYTHON READINESS · {a.python_level.toUpperCase()}</span>
          <p>{a.readiness}</p>
        </div>
        <div className="review-field">
          <span>AVAILABILITY</span>
          <p>{a.availability}</p>
        </div>
        <small className="muted">Applied {new Date(a.created_at).toLocaleString()}</small>
        <form className="approval-form" onSubmit={save}>
          <label>
            Application status
            <select
              aria-label="Application status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setSaved(false);
              }}
            >
              {['pending', 'approved', 'waitlisted', 'declined'].map((s) => (
                <option value={s} key={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <button disabled={busy || status === a.status} className="button small">
            {busy ? 'Saving…' : 'Save status'}
            <Check size={15} />
          </button>
        </form>
        {error && <Notice error>{error}</Notice>}
        {saved && <Notice>Application status saved. Access now matches this status.</Notice>}
      </div>
    </details>
  );
}
function LessonEditor({
  lessons,
  refresh,
}: {
  lessons: AdminData['lessons'];
  refresh: () => Promise<void>;
}) {
  const [selected, setSelected] = useState(lessons[0]?.id || '1-1');
  return (
    <div className="lesson-editor">
      <div className="admin-section-heading">
        <div>
          <h2>Make the next lesson a good one.</h2>
          <p>Add your recording, edit the written guide, and choose when learners can access it.</p>
        </div>
      </div>
      <label className="lesson-select">
        Choose a lesson
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {allLessons.map((l) => (
            <option value={l.id} key={l.id}>
              Week {l.unitId} · {l.title}
            </option>
          ))}
        </select>
      </label>
      <LessonEditForm
        key={selected}
        lesson={lessons.find((l) => l.id === selected)!}
        refresh={refresh}
      />
    </div>
  );
}
function LessonEditForm({
  lesson,
  refresh,
}: {
  lesson: AdminData['lessons'][number];
  refresh: () => Promise<void>;
}) {
  const [body, setBody] = useState(lesson.body);
  const [video, setVideo] = useState(lesson.video_url);
  const [published, setPublished] = useState(!!lesson.published);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await patch(`/admin/lessons/${lesson.id}`, { body, videoUrl: video, published });
      await refresh();
      setSaved(true);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={save} className="panel admin-editor-form" onChange={() => setSaved(false)}>
      <label>
        Video embed URL{' '}
        <span className="field-help">
          Optional. Use a YouTube privacy-enhanced embed or Vimeo player link. Set viewing
          permissions with your video host.
        </span>
        <input
          type="url"
          maxLength={2048}
          value={video}
          onChange={(e) => setVideo(e.target.value)}
          placeholder="https://www.youtube-nocookie.com/embed/VIDEO_ID"
        />
      </label>
      <label>
        Written lesson
        <span className="field-help">
          Separate paragraphs with a blank line. Keep a written explanation alongside the video.
        </span>
        <textarea
          rows={16}
          required
          minLength={40}
          maxLength={30000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span>Publish this lesson for approved learners</span>
      </label>
      {error && <Notice error>{error}</Notice>}
      {saved && <Notice>Lesson saved.</Notice>}
      <button className="button" disabled={busy}>
        {busy ? 'Saving…' : 'Save lesson'}
        <Check size={17} />
      </button>
    </form>
  );
}
function Reviews({
  submissions,
  refresh,
}: {
  submissions: Submission[];
  refresh: () => Promise<void>;
}) {
  const [pendingOnly, setPendingOnly] = useState(true);
  const visible = submissions.filter((s) => !pendingOnly || s.status === 'submitted');
  return (
    <>
      <div className="admin-section-heading">
        <div>
          <h2>A little feedback goes a long way.</h2>
          <p>One thing that works. One thing to fix. One useful next step.</p>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(e) => setPendingOnly(e.target.checked)}
          />
          <span>Needs review only</span>
        </label>
      </div>
      {visible.length ? (
        <div className="review-list">
          {visible.map((s) => (
            <ReviewForm key={`${s.id}-${s.updated_at}`} submission={s} refresh={refresh} />
          ))}
        </div>
      ) : (
        <Empty title="Nothing waiting for feedback">
          <p>
            Submitted milestones will appear here. You can also turn off the filter to revisit
            previous reviews.
          </p>
        </Empty>
      )}
    </>
  );
}
function ReviewForm({
  submission: s,
  refresh,
}: {
  submission: Submission;
  refresh: () => Promise<void>;
}) {
  const [feedback, setFeedback] = useState(s.feedback);
  const [status, setStatus] = useState<string>(s.status === 'submitted' ? 'reviewed' : s.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await patch(`/admin/submissions/${s.id}`, { feedback, status });
      await refresh();
      setSaved(true);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel review-card">
      <div className="row spread">
        <div>
          <span className="tiny-label">
            WEEK {s.week} · {units[s.week - 1].milestone}
          </span>
          <h3>{s.name || s.email}</h3>
        </div>
        <Pill>{s.status.replaceAll('_', ' ')}</Pill>
      </div>
      <p className="submission-notes">{s.notes}</p>
      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-link">
        Open project
        <ArrowUpRight size={16} />
      </a>
      <form onSubmit={save}>
        <label>
          Your feedback
          <textarea
            required
            minLength={10}
            maxLength={3000}
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What’s working? What needs a change? What should they try next?"
          />
        </label>
        <div className="row">
          <label>
            Review result
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="reviewed">Reviewed</option>
              <option value="revision_requested">Revision requested</option>
            </select>
          </label>
          <button className="button small" disabled={busy}>
            {busy ? 'Saving…' : 'Save feedback'}
            <Check size={15} />
          </button>
        </div>
        {error && <Notice error>{error}</Notice>}
        {saved && <Notice>Feedback saved.</Notice>}
      </form>
    </section>
  );
}
function Cohort({ learners }: { learners: AdminData['learnerProgress'] }) {
  return (
    <>
      <div className="admin-section-heading">
        <div>
          <h2>Your founding learners.</h2>
          <p>Approved participants appear here after their first verified sign-in.</p>
        </div>
      </div>
      {learners.length ? (
        <div className="cohort-list">
          {learners.map((l) => (
            <div className="cohort-row" key={l.id}>
              <span className="user-avatar">{l.name?.charAt(0).toUpperCase() || 'L'}</span>
              <div>
                <strong>{l.name}</strong>
                <span>{l.email}</span>
              </div>
              <div className="cohort-progress">
                <span>{l.completed} / 12 lessons</span>
                <ProgressBar value={Math.round((l.completed / 12) * 100)} />
              </div>
              {l.completed === 12 && <CheckCircle2 size={21} />}
            </div>
          ))}
        </div>
      ) : (
        <Empty title="A good group starts here">
          <p>
            Approve applications, then invite those learners to sign in with the email they applied
            with.
          </p>
        </Empty>
      )}
    </>
  );
}
function localDate(iso: string) {
  if (!iso) return '';
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function SessionEditor({ session, refresh }: { session: Session; refresh: () => Promise<void> }) {
  const [title, setTitle] = useState(session.title);
  const [description, setDescription] = useState(session.description);
  const [date, setDate] = useState(localDate(session.date));
  const [url, setUrl] = useState(session.url);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await patch('/admin/session', {
        title,
        description,
        date: date ? new Date(date).toISOString() : '',
        url,
      });
      await refresh();
      setSaved(true);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="admin-section-heading">
        <div>
          <h2>Bring the group together.</h2>
          <p>Set the next build room. Learners see the time in their own time zone.</p>
        </div>
      </div>
      <form className="panel session-editor" onSubmit={save} onChange={() => setSaved(false)}>
        <label>
          Session title
          <input
            required
            minLength={3}
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          What are we working on?
          <textarea
            required
            minLength={10}
            maxLength={1000}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Start time{' '}
          <span className="field-help">
            Your time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}. Leave blank while
            scheduling.
          </span>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Meeting link{' '}
          <span className="field-help">
            Visible only to approved learners. Leave blank until ready.
          </span>
          <input
            type="url"
            maxLength={2048}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
        {error && <Notice error>{error}</Notice>}
        {saved && <Notice>Build room updated.</Notice>}
        <button className="button" disabled={busy}>
          {busy ? 'Saving…' : 'Save build room'}
          <Check size={17} />
        </button>
      </form>
    </>
  );
}
