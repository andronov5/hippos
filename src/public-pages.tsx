import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Compass,
  ExternalLink,
  FlaskConical,
  Leaf,
  LockKeyhole,
  Mail,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { allLessons, course, units } from '../shared/course.mjs';
import { api, message, post } from './api';
import { useAuth } from './auth';
import {
  ArrowLink,
  CheckList,
  LessonTypeIcon,
  Notice,
  PatternArt,
  Pill,
  Spinner,
  StepRow,
} from './components';

export function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" />
            MACHINE LEARNING · FREE BETA
          </div>
          <h1>
            Less watching.
            <br />
            More <em>building.</em>
          </h1>
          <p className="hero-description">
            Build your first machine learning project in four weeks, with guided lessons, feedback
            from Lera, and a small group alongside you.
          </p>
          <div className="hero-buttons">
            <Link className="button" to="/#apply">
              Apply for the free beta
              <ArrowRight size={18} />
            </Link>
            <ArrowLink to="/program">See the curriculum</ArrowLink>
          </div>
          <div className="hero-proof">
            <span>
              <Users size={17} />
              15 places
            </span>
            <span>
              <Clock3 size={17} />
              4–6 hours / week
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="tiny-label">YOUR FIRST ML PROJECT</span>
              <span className="round-icon">
                <Sparkles size={17} />
              </span>
            </div>
            <PatternArt />
            <div className="hero-card-bottom">
              <Pill tone="white">COHORT 01</Pill>
              <h2>
                From “I wonder”
                <br />
                to “I built this.”
              </h2>
              <div className="hero-card-meta">
                <span>Machine Learning Foundations</span>
                <ArrowUpRight size={22} />
              </div>
            </div>
          </div>
          <div className="floating-note">
            <span className="note-icon">
              <Check size={18} />
            </span>
            <div>
              <strong>Learn by making.</strong>
              <span>That’s the whole idea.</span>
            </div>
          </div>
          <span className="orbit-spark" aria-hidden="true">
            ✳
          </span>
        </div>
      </section>
      <section className="container path-preview" aria-labelledby="path-heading">
        <div className="path-preview-heading">
          <h2 id="path-heading">Your four-week path</h2>
          <ArrowLink to="/program">View curriculum</ArrowLink>
        </div>
        <ol>
          {units.map((unit) => (
            <li key={unit.id}>
              <span className={`unit-tile ${unit.color}`}>0{unit.id}</span>
              <span>{unit.short}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="application-section">
        <div className="container application-grid">
          <div className="application-copy">
            <Pill tone="outline">JOIN THE BETA</Pill>
            <h2>
              Your next project
              <br />
              starts <em>here.</em>
            </h2>
            <p>
              Know basic Python? Tell me what you’d like to build. I’m inviting 15 learners to help
              shape this first cohort.
            </p>
            <CheckList
              items={[
                'Short lessons and a project walkthrough each week',
                'Weekly group session and project feedback',
                'Free for all four weeks',
              ]}
            />
            <div className="personal-signoff">
              <span className="lera-avatar">L</span>
              <div>
                <strong>Lera</strong>
                <span>Your guide</span>
              </div>
            </div>
          </div>
          <ApplicationForm />
        </div>
      </section>
      <section className="section container faq-section">
        <div>
          <h2>A few questions</h2>
        </div>
        <div className="faq-list">
          {[
            [
              'Am I ready for this?',
              'You’ll need basic Python: variables, lists, loops, and functions. No machine learning experience is required. Plan for 4–6 hours each week.',
            ],
            [
              'When does it start?',
              'We’ll confirm the start date and session times with the selected group. Lessons can be completed on your own schedule.',
            ],
            [
              'What will I build?',
              'Your own small machine learning project, using a public dataset. We’ll work through shared examples, then you’ll apply the ideas to a question you choose.',
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
function LayersIcon() {
  return <FlaskConical size={15} />;
}

export function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState<boolean | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    pythonLevel: 'basics',
    readiness: '',
    goal: '',
    availability: '',
    commitment: false,
    privacyConsent: false,
  });
  useEffect(() => {
    api<{ applicationsOpen: boolean }>('/config')
      .then((d) => setOpen(d.applicationsOpen))
      .catch(() => setError('Applications could not be loaded. Please refresh and try again.'));
  }, []);
  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (step === 1) {
      setStep(2);
      setTimeout(() => heading.current?.focus(), 0);
      return;
    }
    setBusy(true);
    try {
      await post('/applications', form);
      setDone(true);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  if (done)
    return (
      <div id="apply" className="application-card success-card">
        <span className="success-icon">
          <CheckCircle2 size={34} />
        </span>
        <Pill>FIRST STEP, DONE</Pill>
        <h3>
          Your curiosity is
          <br />
          in good company.
        </h3>
        <p>
          Your application has been received. Sign in with <strong>{form.email}</strong> to check
          its status. Applying does not automatically reserve a place.
        </p>
        <Link to="/signin" className="button">
          Check application status
          <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <div id="apply" className="application-card">
      <div className="row spread">
        <span className="tiny-label">BETA APPLICATION</span>
        <span className="small-text muted">About 3 minutes</span>
      </div>
      <h3 ref={heading} tabIndex={-1}>
        {step === 1 ? 'About you' : 'Your idea & availability'}
      </h3>
      <div className="form-progress" aria-label={`Step ${step} of 2`}>
        <span className="active" />
        <span className={step === 2 ? 'active' : ''} />
        <small>{step} / 2</small>
      </div>
      {open === false ? (
        <Notice>Applications are closed for now. Check back for the next cohort.</Notice>
      ) : (
        <form onSubmit={submit}>
          {step === 1 ? (
            <>
              <label>
                Your name
                <input
                  autoComplete="given-name"
                  name="name"
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="What should we call you?"
                />
              </label>
              <label>
                Email address
                <input
                  autoComplete="email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <div className="form-two">
                <label>
                  Python experience
                  <select
                    value={form.pythonLevel}
                    onChange={(e) => set('pythonLevel', e.target.value)}
                  >
                    <option value="basics">I know the basics</option>
                    <option value="comfortable">I’ve built a few things</option>
                    <option value="experienced">I use it regularly</option>
                  </select>
                </label>
                <label>
                  Your time zone
                  <input
                    value={form.timezone}
                    required
                    maxLength={80}
                    onChange={(e) => set('timezone', e.target.value)}
                    list="timezones"
                  />
                  <datalist id="timezones">
                    {[
                      'America/Denver',
                      'America/New_York',
                      'America/Los_Angeles',
                      'America/Chicago',
                      'America/Sao_Paulo',
                      'Europe/London',
                      'Europe/Berlin',
                      'Africa/Lagos',
                      'Africa/Nairobi',
                      'Asia/Kolkata',
                      'Asia/Dhaka',
                      'Asia/Karachi',
                      'Asia/Manila',
                      'Asia/Singapore',
                      'Australia/Sydney',
                      'UTC',
                    ].map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </label>
              </div>
              <p className="field-help">Basic Python required. No ML experience needed.</p>
            </>
          ) : (
            <>
              <label>
                What would you like to build?
                <textarea
                  required
                  minLength={20}
                  maxLength={1500}
                  rows={3}
                  value={form.goal}
                  onChange={(e) => set('goal', e.target.value)}
                  placeholder="A question you’re curious about, or a project you’d like to try…"
                />
              </label>
              <label>
                A quick Python check
                <span className="field-help">
                  What does <code>[n * 2 for n in [1, 2, 3]]</code> produce, and why?
                </span>
                <textarea
                  required
                  minLength={10}
                  maxLength={800}
                  rows={2}
                  value={form.readiness}
                  onChange={(e) => set('readiness', e.target.value)}
                  placeholder="Explain it in your own words."
                />
              </label>
              <label>
                Weekly session availability
                <input
                  required
                  minLength={3}
                  maxLength={200}
                  value={form.availability}
                  onChange={(e) => set('availability', e.target.value)}
                  placeholder="e.g. weekday evenings or Saturday mornings"
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  required
                  checked={form.commitment}
                  onChange={(e) => set('commitment', e.target.checked)}
                />
                <span>I can make time for 4–6 hours a week for four weeks.</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  required
                  checked={form.privacyConsent}
                  onChange={(e) => set('privacyConsent', e.target.checked)}
                />
                <span>
                  I’ve read the{' '}
                  <Link to="/privacy" target="_blank">
                    privacy notice
                  </Link>{' '}
                  and agree to share these details for the beta.
                </span>
              </label>
            </>
          )}
          {error && <Notice error>{error}</Notice>}
          <div className="form-actions">
            {step === 2 && (
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
              >
                Back
              </button>
            )}
            <button type="submit" disabled={busy || open === null} className="button full">
              {busy ? 'Sending your application…' : step === 1 ? 'Continue' : 'Send my application'}
              <ArrowRight size={17} />
            </button>
          </div>
          <p className="form-footnote">
            <LockKeyhole size={12} />
            {step === 1
              ? 'Free to apply. No account needed.'
              : 'Your application is only visible to the program admin.'}
          </p>
        </form>
      )}
    </div>
  );
}

export function Program() {
  return (
    <div className="container page-section">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>The program
      </div>
      <div className="program-heading">
        <div>
          <Pill>4-WEEK FREE BETA</Pill>
          <h1>
            Machine learning,
            <br />
            <em>made by you.</em>
          </h1>
          <p className="lead">
            Build, test, and explain your own ML project. Three lessons and one project milestone
            each week.
          </p>
          <div className="course-facts">
            <span>
              <Clock3 size={17} />
              4–6 hours / week
            </span>
            <span>
              <BookOpen size={17} />
              12 core lessons
            </span>
            <span>
              <Users size={17} />
              15 beta places
            </span>
          </div>
        </div>
        <aside className="program-summary">
          <span className="tiny-label">BEFORE YOU START</span>
          <h2>Know the Python basics?</h2>
          <p>
            You’ll use variables, lists, loops, and functions. We’ll cover the machine learning
            together.
          </p>
          <Link to="/#apply" className="button full">
            Apply for the free beta
            <ArrowRight size={17} />
          </Link>
          <Link to="/sample" className="text-link">
            Try a sample lesson
            <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
      <div className="curriculum-header">
        <h2>Curriculum</h2>
        <span className="muted">4 units · 12 lessons · 1 project of your own</span>
      </div>
      <div className="curriculum-list">
        {units.map((unit) => (
          <details className="curriculum-accordion" key={unit.id} open={unit.id === 1}>
            <summary>
              <span className={`unit-tile ${unit.color}`}>0{unit.id}</span>
              <div>
                <span className="tiny-label">WEEK {unit.id}</span>
                <h3>{unit.title}</h3>
              </div>
              <span className="accordion-meta">3 lessons</span>
              <ChevronDown className="accordion-chevron" size={20} />
            </summary>
            <div className="curriculum-detail">
              <p>{unit.description}</p>
              <div className="curriculum-lessons">
                {unit.lessons.map((lesson) => (
                  <div className="curriculum-lesson" key={lesson.id}>
                    <LessonTypeIcon kind={lesson.kind} />
                    <span>{lesson.title}</span>
                    <Pill>{lesson.kind}</Pill>
                  </div>
                ))}
              </div>
              <div className="milestone">
                <Compass size={17} />
                <span>
                  <strong>You’ll make:</strong> {unit.milestone}
                </span>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export function Resources({ embedded = false }: { embedded?: boolean }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(0);
  const resources = units.flatMap((unit) =>
    unit.readings.map((r) => ({ ...r, week: unit.id, color: unit.color })),
  );
  const results = resources.filter(
    (r) =>
      (!filter || r.week === filter) &&
      `${r.title} ${r.source}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className={embedded ? '' : 'container page-section'}>
      <div className="page-title">
        <h1>Resources</h1>
        <p>Readings and tools for each week of the program.</p>
      </div>
      <div className="resource-toolbar">
        <div className="search-input">
          <Search size={18} />
          <input
            aria-label="Search resources"
            placeholder="Find a reading or a tool…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="filter-tabs" role="group" aria-label="Filter resources by week">
          {[0, 1, 2, 3, 4].map((w) => (
            <button
              aria-pressed={filter === w}
              className={filter === w ? 'active' : ''}
              key={w}
              onClick={() => setFilter(w)}
            >
              {w ? `Week ${w}` : 'All readings'}
            </button>
          ))}
        </div>
      </div>
      <div className="resource-grid">
        {results.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="row spread">
              <span className={`resource-icon ${r.color}`}>
                <BookOpen size={23} />
              </span>
              <ArrowUpRight size={20} />
            </div>
            <span className="tiny-label">
              WEEK {r.week} · {r.source}
            </span>
            <h2>{r.title}</h2>
            <span className="text-link">
              Open reading
              <ExternalLink size={14} />
            </span>
          </a>
        ))}
      </div>
      {!results.length && (
        <div className="empty-state">
          <Search size={25} />
          <h2>No readings found</h2>
          <p>Try a different phrase or choose another week.</p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery('');
              setFilter(0);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

export function About() {
  return (
    <div className="container page-section about-page">
      <div className="about-hero">
        <div>
          <span className="eyebrow">HI, I’M LERA.</span>
          <h1>
            Learning feels different
            <br />
            when you <em>make something.</em>
          </h1>
          <p className="lead">
            I’m building a small community where you learn by making things, with guidance and
            feedback along the way.
          </p>
        </div>
        <div className="about-art">
          <FlaskConical size={72} strokeWidth={1} />
          <span>curiosity, in progress.</span>
        </div>
      </div>
      <div className="about-body">
        <h2>Start small. Build something real.</h2>
        <p>
          The first cohort is a free, four-week machine learning beta for 15 learners. I’ll guide
          the lessons and group sessions. You’ll build your own project and help shape the program
          with your feedback.
        </p>
        <div className="about-values">
          <div>
            <Code2 />
            <h3>Make it real</h3>
            <p>Use the idea. Run the experiment. Build something you care about.</p>
          </div>
          <div>
            <Users />
            <h3>Be a good peer</h3>
            <p>Be kind, explain your thinking, and respect different starting points.</p>
          </div>
          <div>
            <Compass />
            <h3>Stay curious</h3>
            <p>A mistake is something to investigate, not something to hide.</p>
          </div>
        </div>
        <Link to="/#apply" className="button">
          Apply for the beta
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}

export function Sample() {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <div className="container page-section sample-page">
      <div className="breadcrumb">
        <Link to="/program">The program</Link>
        <span>/</span>Sample lesson
      </div>
      <Pill>SAMPLE LESSON · WEEK 01</Pill>
      <h1>
        What are we asking
        <br />
        the machine to learn?
      </h1>
      <p className="lead">
        Before there is a model, there is a question. Let’s make yours precise.
      </p>
      <div className="sample-example">
        <span className="example-digit" aria-label="Handwritten digit example">
          7
        </span>
        <ArrowRight />
        <div>
          <span className="tiny-label">THE MODEL’S JOB</span>
          <h2>Which digit is this?</h2>
          <p>Pick a category from 0 to 9.</p>
        </div>
      </div>
      <div className="prose">
        <h2>One example. Three useful words.</h2>
        <p>
          A <strong>sample</strong> is one example: a single picture of a handwritten digit.{' '}
          <strong>Features</strong> are its inputs: the brightness of each pixel. The{' '}
          <strong>target</strong> is the answer we want to predict: the digit a person wrote.
        </p>
        <p>
          Training shows a model examples with known answers. Evaluation asks it to make predictions
          for examples it hasn’t learned from. That difference matters: memorizing the practice
          questions is not the same as understanding the test.
        </p>
      </div>
      <div className="quiz-card">
        <span className="eyebrow">TRY THE IDEA</span>
        <h2>You want to predict a bike rental’s duration. What is your target?</h2>
        <div className="quiz-options">
          {['The pickup station', 'The rental duration in minutes', 'The day of the week'].map(
            (label, index) => (
              <button
                key={label}
                onClick={() => setChoice(index)}
                className={choice === index ? 'selected' : ''}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {label}
                {choice === index && <Check size={18} />}
              </button>
            ),
          )}
        </div>
        {choice !== null && (
          <Notice error={choice !== 1}>
            {choice === 1
              ? 'Exactly. Duration is the numerical answer you want to predict, so this is a regression problem.'
              : 'That could be a feature known at pickup. The target is the rental duration: the answer you want to predict.'}
          </Notice>
        )}
      </div>
      <div className="sample-finish">
        <Sparkles />
        <h2>Now make it your question.</h2>
        <p>
          Think of one prediction that would be useful in your life. What information would be
          available before you know the answer?
        </p>
        <Link className="button" to="/#apply">
          Keep building with us
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}

export function SignIn() {
  const { user, refresh, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const send = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await post('/auth/request-code', { email });
      setSent(true);
      setNotice('Check your email for a six-digit code. It expires in 10 minutes.');
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sent) {
      await send();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await post('/auth/verify', { email, code });
      const current = await refresh();
      const destination = (location.state as { from?: string } | null)?.from;
      navigate(
        current?.approved
          ? destination?.startsWith('/learn') || destination === '/admin'
            ? destination
            : '/learn'
          : '/application',
        { replace: true },
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };
  if (!loading && user)
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <CheckCircle2 size={35} />
          <h1>You’re signed in.</h1>
          <p>{user.email}</p>
          <Link to={user.approved ? '/learn' : '/application'} className="button">
            {user.approved ? 'Open my learning' : 'View application status'}
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="auth-icon">
          <Mail size={25} />
        </span>
        <h1>{sent ? 'Check your inbox.' : 'Sign in'}</h1>
        <p>
          {sent
            ? `We’ll verify it’s you with a code sent to ${email}.`
            : 'Use the email you applied with.'}
        </p>
        <form onSubmit={submit}>
          {!sent ? (
            <label>
              Email address
              <input
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="The email you applied with"
              />
            </label>
          ) : (
            <label>
              Six-digit code
              <input
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                minLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="code-input"
                placeholder="000000"
              />
            </label>
          )}
          {error && <Notice error>{error}</Notice>}
          {notice && <Notice>{notice}</Notice>}
          <button disabled={busy} className="button full">
            {busy ? 'One moment…' : sent ? 'Open my lab' : 'Email me a sign-in code'}
            <ArrowRight size={17} />
          </button>
        </form>
        {sent ? (
          <div className="signin-options">
            <button
              onClick={() => {
                setSent(false);
                setCode('');
                setNotice('');
                setError('');
              }}
              className="link-button"
              disabled={busy}
            >
              Use another email
            </button>
            <button onClick={send} className="link-button" disabled={busy}>
              Send a new code
            </button>
          </div>
        ) : (
          <p className="auth-bottom">
            New here? <Link to="/#apply">Apply for the free beta.</Link>
          </p>
        )}
        <div className="privacy-hint">
          <LockKeyhole size={13} />
          No password to remember. Just you and your inbox.
        </div>
      </div>
    </div>
  );
}

export function ApplicationStatus() {
  const { user, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<
    { name: string; status: string } | null | undefined
  >();
  const [error, setError] = useState('');
  const load = () =>
    api<{ application: { name: string; status: string } | null }>('/application')
      .then(async (d) => {
        setApplication(d.application);
        setError('');
        await refresh();
      })
      .catch((e) => setError(message(e)));
  useEffect(() => {
    load();
  }, []);
  const titles: Record<string, string> = {
    pending: 'Your application is in.',
    approved: 'You’re part of the lab.',
    waitlisted: 'You’re on the waitlist.',
    declined: 'An update on your application.',
  };
  const bodies: Record<string, string> = {
    pending:
      'Lera will review your goals, experience, and availability. Your application is still being considered.',
    approved: 'Your beta access is ready. Open your learning space and start exploring.',
    waitlisted:
      'The first group is small. Your application is on the waitlist while places and schedules are finalized.',
    declined:
      'You weren’t selected for this cohort. You can still explore the public readings and sample lesson.',
  };
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="auth-icon">
          <Compass size={28} />
        </span>
        {application === undefined && !error ? (
          <Spinner />
        ) : (
          <>
            <Pill>APPLICATION STATUS</Pill>
            <h1>{application ? titles[application.status] : 'Your next chapter awaits.'}</h1>
            <p>
              {application
                ? bodies[application.status]
                : 'We don’t have an application for this email yet. Tell us a little about yourself to get started.'}
            </p>
            <p className="small-text muted">Signed in as {user?.email}</p>
            {error && <Notice error>{error}</Notice>}
            {application?.status === 'approved' ? (
              <Link className="button full" to="/learn">
                Go to my learning
                <ArrowRight size={17} />
              </Link>
            ) : !application ? (
              <Link className="button full" to="/#apply">
                Apply for the beta
                <ArrowRight size={17} />
              </Link>
            ) : (
              <button className="button secondary full" onClick={load}>
                Refresh status
              </button>
            )}
            <button
              className="link-button"
              onClick={() =>
                logout()
                  .then(() => navigate('/'))
                  .catch((e) => setError(message(e)))
              }
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="container page-section prose privacy-page">
      <span className="eyebrow">THE PRACTICAL DETAILS</span>
      <h1>
        Your information
        <br />
        in the lab.
      </h1>
      <p>
        The beta application asks for your name, email, time zone, Python experience, goals, and
        availability so Lera can review applications and organize the group. Please don’t include
        sensitive personal information.
      </p>
      <h2>Who can see what</h2>
      <p>
        Application details are visible to the program admin. Your learning progress, project
        submissions, and feedback are visible to you and the admin. They are not public, and other
        learners cannot see them through the platform. Public project sharing is a separate
        decision.
      </p>
      <h2>Signing in</h2>
      <p>
        The platform emails a one-time code to verify your address. A secure session cookie keeps
        you signed in for up to seven days. Signing out removes that session. No advertising
        trackers are included in this first version.
      </p>
      <h2>External resources</h2>
      <p>
        Readings link to external websites. Embedded videos, when added, are hosted by YouTube or
        Vimeo; visiting or playing content may be subject to those services’ privacy practices.
        Don’t put private information in a publicly shared project link.
      </p>
      <h2>Questions and removal</h2>
      <p>
        You can ask Lera, through the channel where you joined the beta, to correct or remove your
        application and learning records. The admin is responsible for handling those requests and
        reviewing stored data after the beta ends.
      </p>
      <Link to="/#apply" className="text-link">
        Back to the application
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
export function NotFound() {
  return (
    <div className="container empty-state">
      <Compass size={40} />
      <span className="eyebrow">A SMALL DETOUR</span>
      <h1>This page wandered off.</h1>
      <p>Let’s get you back to something worth building.</p>
      <Link className="button" to="/">
        Back to the lab
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
