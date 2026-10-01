import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/dm-serif-display/400-italic.css';
import './styles.css';
import { AuthProvider, Gate } from './auth';
import { PublicLayout } from './components';
import {
  About,
  ApplicationStatus,
  Home,
  NotFound,
  Privacy,
  Program,
  Resources,
  Sample,
  SignIn,
} from './public-pages';
import { CourseLibrary, Dashboard, LabLayout, LessonPage, Projects, Sessions } from './learning';
import { Admin } from './admin';

function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const names: Record<string, string> = {
      '/': 'Learn it. Build it. Make it yours.',
      '/program': 'The program',
      '/resources': 'Resources',
      '/about': 'Meet the lab',
      '/signin': 'Sign in',
      '/application': 'Application status',
      '/learn': 'My learning',
      '/learn/course': 'Course library',
      '/learn/projects': 'My project',
      '/learn/sessions': 'Build room',
      '/admin': 'Manage the lab',
    };
    document.title = `${names[pathname] || 'Your learning space'} · Lerabyte Lab`;
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    let tries = 0;
    const scroll = () => {
      const element = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (element) {
        element.scrollIntoView({ behavior: 'instant', block: 'start' });
        return true;
      }
      return false;
    };
    if (scroll()) return;
    const timer = window.setInterval(() => {
      if (scroll() || ++tries > 30) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);
  return null;
}
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteEffects />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="program" element={<Program />} />
            <Route path="resources" element={<Resources />} />
            <Route path="about" element={<About />} />
            <Route path="sample" element={<Sample />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="signin" element={<SignIn />} />
            <Route
              path="application"
              element={
                <Gate approved={false}>
                  <ApplicationStatus />
                </Gate>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            element={
              <Gate>
                <LabLayout />
              </Gate>
            }
          >
            <Route path="learn" element={<Dashboard />} />
            <Route path="learn/course" element={<CourseLibrary />} />
            <Route path="learn/lesson/:id" element={<LessonPage />} />
            <Route path="learn/projects" element={<Projects />} />
            <Route path="learn/sessions" element={<Sessions />} />
            <Route path="learn/resources" element={<Resources embedded />} />
            <Route
              path="admin"
              element={
                <Gate admin>
                  <Admin />
                </Gate>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
