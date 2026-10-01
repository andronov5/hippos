import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
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
            <span className="live-dot" />A small beta. A big first step.
          </div>
          <h1>
            Less watching.
            <br />
            More <em>building.</em>
          </h1>
          <p className="hero-description">
            You have the curiosity. Let’s turn it into something real. Learn machine learning, build
            your own project, and find your people along the way.
          </p>
          <div className="hero-buttons">
            <Link className="button" to="/#apply">
              Apply for the free beta
              <ArrowRight size={18} />
            </Link>
            <ArrowLink to="/program">Explore the program</ArrowLink>
          </div>
          <div className="hero-proof">
            <span>
              <Users size={17} />
              15 curious builders
            </span>
            <span>
              <Clock3 size={17} />4 weeks, together
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="tiny-label">YOUR NEXT CHAPTER</span>
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
      <div className="belief-strip">
        <div className="container">
          <span>
            <BookOpen size={19} />A clear path to follow
          </span>
          <span>
            <Code2 size={19} />A project that’s yours
          </span>
          <span>
            <Users size={19} />
            People to build with
          </span>
          <span>
            <Leaf size={19} />
            Free for the beta
          </span>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE FIRST LEARNING PATH</span>
            <h2>Start small. Go somewhere.</h2>
          </div>
          <ArrowLink to="/program">See the full curriculum</ArrowLink>
        </div>
        <Link to="/program" className="featured-course">
          <div className="course-art">
            <div className="mini-window">
              <div className="window-dots">
                <i />
                <i />
                <i />
                <span>your_first_model.py</span>
              </div>
              <code>
                <span>from</span> curiosity <span>import</span> ideas
                <br />
                <br />
                model.fit(your_data)
                <br />
                <span className="code-comment"># this is where it starts.</span>
              </code>
              <div className="window-result">
                <CheckCircle2 size={16} />
                One idea closer.
              </div>
            </div>
            <div className="art-circle" />
          </div>
          <div className="featured-course-copy">
            <div className="row">
              <Pill>FREE BETA</Pill>
              <span className="muted small-text">Basic Python → your first ML project</span>
            </div>
            <h3>{course.title}</h3>
            <p>
              Understand the ideas behind the models. Work through real examples. Build, test, and
              explain a project you care about.
            </p>
            <div className="course-facts">
              <span>
                <LayersIcon />4 units
              </span>
              <span>
                <BookOpen size={15} />
                12 lessons
              </span>
              <span>
                <Clock3 size={15} />
                4–6 hrs / week
              </span>
            </div>
            <span className="text-link">
              Take a look inside
              <ArrowRight size={17} />
            </span>
          </div>
        </Link>
      </section>
      <section className="section how-section container">
        <div>
          <span className="eyebrow">A LITTLE STRUCTURE. ROOM TO EXPLORE.</span>
          <h2>
            You don’t have to
            <br />
            figure it all out alone.
          </h2>
          <p className="section-description">
            A weekly rhythm that takes you from understanding an idea to actually using it.
          </p>
          <ArrowLink to="/about">Meet the person behind the lab</ArrowLink>
        </div>
        <div className="steps">
          <StepRow number="01" title="Understand the idea">
            Short lessons, useful readings, and room for questions.
          </StepRow>
          <StepRow number="02" title="Try it for yourself">
            A full project walkthrough, then an experiment of your own.
          </StepRow>
          <StepRow number="03" title="Build it with people">
            Weekly build rooms, project feedback, and a small group moving with you.
          </StepRow>
        </div>
      </section>
      <section id="apply" className="application-section">
        <div className="container application-grid">
          <div className="application-copy">
            <Pill tone="outline">THE FOUNDING COHORT</Pill>
            <h2>
              Your next project
              <br />
              starts <em>here.</em>
            </h2>
            <p>
              I’m bringing together 15 curious people for the first Lerabyte Lab beta. If you know a
              little Python and want to put it to work, I’d love to hear what you want to build.
            </p>
            <CheckList
              items={[
                'Four weeks of guided, hands-on learning',
                'Three core lessons and one project milestone each week',
                'A weekly group session and individual project feedback',
                'Completely free for this beta cohort',
              ]}
            />
            <div className="personal-signoff">
              <span className="lera-avatar">L</span>
              <div>
                <strong>Lera</strong>
                <span>Your guide & fellow builder</span>
              </div>
            </div>
          </div>
          <ApplicationForm />
        </div>
      </section>
      <section className="section container faq-section">
        <div>
          <span className="eyebrow">GOOD QUESTIONS</span>
          <h2>A few things to know.</h2>
        </div>
        <div className="faq-list">
          {[
            [
              'Do I need to know machine learning?',
              'No. You should be comfortable with basic Python: variables, lists, loops, and functions. We will build the machine learning foundations together.',
            ],
            [
              'How much time should I set aside?',
              'Plan for four to six hours each week, including lessons, your project work, and a group session. You can study the lessons on your own schedule.',
            ],
            [
              'When does the beta start?',
              'The start date and group session times will be confirmed with the selected participants. Tell us your time zone and availability in the application.',
            ],
            [
              'Is this really free?',
              'Yes. This first four-week beta is free. In return, come ready to participate and give honest feedback about what helps you learn.',
            ],
            [
              'Does everyone build the same project?',
              'We use shared examples to learn the tools, but you choose your own small prediction problem and dataset. Your final project should reflect your interests.',
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
      <div className="application-card success-card">
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
    <div className="application-card">
      <div className="row spread">
        <span className="tiny-label">BETA APPLICATION</span>
        <span className="small-text muted">About 3 minutes</span>
      </div>
      <h3 ref={heading} tabIndex={-1}>
        {step === 1 ? 'Let’s meet you.' : 'Tell us what sparks your curiosity.'}
      </h3>
      <p className="muted">
        {step === 1
          ? 'No perfect portfolio needed. Just a place to start.'
          : 'A little context helps us put the group together.'}
      </p>
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
              <p className="field-help">
                New to Python? Start with the free resources and join a future cohort.
              </p>
            </>
          ) : (
            <>
              <label>
                What would you love to build?
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
                When could you join a weekly group session?
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
          <Pill>THE FIRST LEARNING PATH</Pill>
          <h1>
            Machine learning,
            <br />
            <em>made by you.</em>
          </h1>
          <p className="lead">
            Four weeks to turn basic Python into a project you can build, test, and explain. A clear
            path, with room for your own ideas.
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
          <span className="tiny-label">YOUR PLACE TO START</span>
          <h2>
            A little Python.
            <br />A lot of curiosity.
          </h2>
          <p>
            Comfortable with variables, loops, lists, and functions? You’re ready to start here.
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
        <h2>The path ahead</h2>
        <span className="muted">4 units · 12 lessons · 1 project of your own</span>
      </div>
      <div className="curriculum-list">
        {units.map((unit) => (
          <article className="curriculum-unit" key={unit.id}>
            <div className={`unit-number ${unit.color}`}>
              0{unit.id}
              <span>WEEK</span>
            </div>
            <div className="curriculum-detail">
              <h3>{unit.title}</h3>
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
                <strong>You’ll make:</strong> {unit.milestone}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="wide-cta">
        <div>
          <span className="eyebrow">YOU BRING THE IDEA</span>
          <h2>Let’s build the rest, together.</h2>
        </div>
        <Link to="/#apply" className="button">
          Join the first cohort
          <ArrowRight size={17} />
        </Link>
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
        <span className="eyebrow">THE GOOD STUFF, IN ONE PLACE</span>
        <h1>Your curiosity shelf.</h1>
        <p>
          Useful readings from the people who make the tools. Pick a topic, take your time, and try
          something.
        </p>
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
      <div className="resource-note">
        <Leaf size={21} />
        <p>
          You don’t need to read everything at once. Start with the readings for your current week,
          then put one idea into practice.
        </p>
      </div>
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
            That’s the idea behind Lerabyte Lab: a place for curious people to turn what they’re
            learning into things they can actually build.
          </p>
        </div>
        <div className="about-art">
          <FlaskConical size={72} strokeWidth={1} />
          <span>curiosity, in progress.</span>
        </div>
      </div>
      <div className="about-body">
        <h2>Let’s start with a small, good group.</h2>
        <p>
          The first version is a free, four-week machine learning beta. I’m putting together a
          structured path of lessons, readings, assignments, and weekly group sessions for 15
          participants.
        </p>
        <p>
          We’ll work through examples together, but everyone will build a project of their own. I
          want you to finish with something you understand well enough to change, question, and
          explain.
        </p>
        <p>
          This is the founding cohort. Your feedback will help shape what the lab becomes. Come
          ready to ask questions, try things that might not work, and help make the group a place
          where people can learn.
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
          Find your place in the lab
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
        <span>/</span>A small taste
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
        <span className="eyebrow">YOUR CURIOSITY LIVES HERE</span>
        <h1>{sent ? 'Check your inbox.' : 'Welcome to the lab.'}</h1>
        <p>
          {sent
            ? `We’ll verify it’s you with a code sent to ${email}.`
            : 'Sign in to your learning space or check the status of your beta application.'}
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
