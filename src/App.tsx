import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { GitHubProvider } from './hooks/useGitHub'
import { Navbar, BackToTop } from './components/Navbar/Navbar'
import { Hero } from './components/Hero/Hero'
import { Rows } from './components/Rows/Rows'
import { About } from './components/About/About'
import { Experience } from './components/Experience/Experience'
import { Journey } from './components/Journey/Journey'
import { Lab } from './components/Lab/Lab'
import { Projects } from './components/Projects/Projects'
import { GitHubSection } from './components/GitHub/GitHubSection'
import { Education } from './components/Education/Education'
import { Contact } from './components/Contact/Contact'
import { Footer } from './components/Footer/Footer'
import { ChatWidget } from './components/Chat/ChatWidget'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

const AdminApp = lazy(() => import('./components/Admin/AdminApp'))

function Loader() {
  return (
    <div role="status" aria-label="Loading portfolio" className="fixed inset-0 z-[200] grid place-items-center bg-void">
      <div className="text-center font-mono">
        <p className="text-2xl text-matrix cursor-blink">initializing rohith.dev</p>
        <div className="mx-auto mt-5 h-0.5 w-48 overflow-hidden rounded bg-matrix/15"><div className="h-full w-full origin-left animate-[load_1.1s_ease-in-out_forwards] bg-matrix" /></div>
      </div>
    </div>
  )
}

function Portfolio() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => setLoading(false), reduce ? 150 : 1300)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <GitHubProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <AnimatePresence>{loading && <Loader key="loader" />}</AnimatePresence>
      <Navbar />
      <main id="main">
        <Hero ready={!loading} />
        <ErrorBoundary label="Browse My Work"><Rows /></ErrorBoundary>
        <About />
        <Experience />
        <Journey />
        <Lab />
        <ErrorBoundary label="Projects"><Projects /></ErrorBoundary>
        <ErrorBoundary label="GitHub"><GitHubSection /></ErrorBoundary>
        <Education />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <ChatWidget />
    </GitHubProvider>
  )
}

export default function App() {
  const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin'
  return (
    <MotionConfig reducedMotion="user">
      {isAdmin ? <Suspense fallback={<p className="p-8 font-mono text-sm text-mute">Loading…</p>}><AdminApp /></Suspense> : <Portfolio />}
    </MotionConfig>
  )
}
