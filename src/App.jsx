import { Routes, Route, useLocation } from 'react-router-dom'
import { LocaleProvider, localeFromPath, DEFAULT_LOCALE, PREFIXED } from './i18n/index.js'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import LocaleRedirect from './components/LocaleRedirect.jsx'
import Work from './pages/Work.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import Lab from './pages/Lab.jsx'
import About from './pages/About.jsx'
import CV from './pages/CV.jsx'
import NotFound from './pages/NotFound.jsx'

/** One route table, mounted at "/" and again under each prefixed locale. */
const pages = (
  <>
    <Route index element={<Work />} />
    <Route path="projects/:slug" element={<ProjectPage />} />
    <Route path="lab" element={<Lab />} />
    <Route path="about" element={<About />} />
    <Route path="cv" element={<CV />} />
    <Route path="*" element={<NotFound />} />
  </>
)

export default function App() {
  const { pathname } = useLocation()

  // The rendered locale is a pure function of the URL. Anything else — stored
  // preference, navigator language — would make the prerendered HTML and the
  // hydrated tree disagree. Preference is applied by LocaleRedirect instead.
  const locale = localeFromPath(pathname) ?? DEFAULT_LOCALE

  return (
    <LocaleProvider locale={locale}>
      <ScrollToTop />
      <LocaleRedirect />
      <Nav />
      <Routes>
        {PREFIXED.map((l) => (
          <Route key={l} path={`/${l}`}>
            {pages}
          </Route>
        ))}
        <Route path="/">{pages}</Route>
      </Routes>
      <Footer />
    </LocaleProvider>
  )
}
