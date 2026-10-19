import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Layers3,
  Menu,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from './auth';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="logo" aria-label="Lerabyte Lab home">
      <span className="logo-mark">
        <span />
        <i />
      </span>
      {!compact && (
        <span>
          lerabyte<span className="logo-lab">lab</span>
        </span>
      )}
    </Link>
  );
}
export function ArrowLink({
  to,
  children,
  className = '',
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} className={`text-link ${className}`}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
export function Pill({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <div className={`notice ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
export function Empty({
  title,
  children,
  icon = <Layers3 size={27} />,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
export function Spinner() {
  return (
    <div className="page-loading" role="status">
      <span className="spinner" />
      Getting everything ready…
    </div>
  );
}
export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Course progress"
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className={open ? 'public-nav open' : 'public-nav'} aria-label="Main navigation">
            <NavLink to="/program">Program</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            <Link to={user ? '/learn' : '/signin'} className="mobile-signin">
              {user ? 'My learning' : 'Sign in'}
            </Link>
          </nav>
          <div className="header-actions">
            <Link to={user ? '/learn' : '/signin'} className="signin-link">
              {user ? 'My learning' : 'Sign in'}
              <ArrowUpRight size={15} />
            </Link>
            <Link to="/#apply" className="button small">
              Apply
              <ArrowRight size={15} />
            </Link>
            <button
              className="icon-button mobile-toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-main">
          <div>
            <Logo />
            <p>Learn machine learning by building.</p>
          </div>
          <div className="footer-links">
            <Link to="/about">About Lera & the lab</Link>
            <Link to="/program">Program</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/signin">Sign in</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Lerabyte Lab</span>
          <span>Free beta · 15 places</span>
        </div>
      </footer>
    </>
  );
}
export function PatternArt({ small = false }: { small?: boolean }) {
  return (
    <div className={`pattern-art ${small ? 'small' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 250" fill="none">
        <defs>
          <pattern
            id={small ? 'dots-small' : 'dots'}
            x="0"
            y="0"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".2" />
          </pattern>
        </defs>
        <rect width="400" height="250" fill={`url(#${small ? 'dots-small' : 'dots'})`} />
        <path
          d="M105 68L200 52L294 112L225 197L93 173L105 68Z M105 68L225 197 M93 173L294 112 M200 52L225 197"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity=".3"
        />
        <circle cx="105" cy="68" r="29" fill="#e4eacb" stroke="#244b3d" />
        <circle cx="200" cy="52" r="15" fill="#b5d28c" stroke="#244b3d" />
        <circle cx="294" cy="112" r="36" fill="#dced9e" stroke="#244b3d" />
        <circle cx="225" cy="197" r="23" fill="#f2c5a9" stroke="#244b3d" />
        <circle cx="93" cy="173" r="18" fill="#d8d0ef" stroke="#244b3d" />
        <path
          d="M91 68h28m-14-14v28 M281 111l9 9 17-20"
          stroke="#244b3d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M218 197h14m-7-7v14" stroke="#244b3d" strokeWidth="2" />
        <circle cx="93" cy="173" r="5" stroke="#244b3d" strokeWidth="2" />
        <circle cx="200" cy="52" r="4" fill="#244b3d" />
      </svg>
      <div className="art-note">
        <Code2 size={14} />
        <span>small steps → real things</span>
      </div>
    </div>
  );
}
export function LessonTypeIcon({ kind, size = 18 }: { kind: string; size?: number }) {
  return kind === 'Project walkthrough' ? (
    <Code2 size={size} />
  ) : kind === 'Practice' ? (
    <Layers3 size={size} />
  ) : (
    <BookOpen size={size} />
  );
}
export function StepRow({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="step-row">
      <span className="step-number">{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
      <ChevronRight size={18} />
    </div>
  );
}
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>
          <Check size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
