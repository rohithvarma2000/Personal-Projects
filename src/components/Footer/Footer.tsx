import { site } from '../../config/site'

export function Footer() {
  return (
    <footer className="border-t border-matrix/15 px-5 py-10 font-mono text-xs text-mute sm:px-8 lg:px-14">
      <div className="container-x flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>{site.location} · React · TypeScript · Tailwind · Framer Motion · GSAP</p>
      </div>
    </footer>
  )
}
