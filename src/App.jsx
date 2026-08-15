import { Routes, Route, useLocation } from 'react-router-dom'
import { LocaleProvider, resolveLocale, PREFIXED } from './i18n/index.js'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
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

const isBrowser = typeof window !== 'undefined'

export default function App() {
  const { pathname } = useLocation()

  // Guarded so the prerender pass never touches browser-only globals.
  const stored = isBrowser ? window.localStorage.getItem('locale') : null
  const navigatorLangs = isBrowser ? (navigator.languages ?? [navigator.language]) : []
  const locale = resolveLocale({ pathname, stored, navigatorLangs })

  return (
    <LocaleProvider locale={locale}>
      <ScrollToTop />
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
