import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Music2, X } from 'lucide-react'

const sectionLinks = [
  { label: 'Browse musicians', href: '/#featured' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'About us', href: '/#about' },
]

function SiteNavigation() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111820] text-white">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10"
      >
        <Link to="/" onClick={closeMenu} className="group inline-flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950 transition group-hover:rotate-[-6deg]">
            <Music2 size={21} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-extrabold tracking-[0.16em]">MUSIBANDA</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {sectionLinks.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-sm font-medium text-white/70 transition hover:text-amber-300"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Join Musibanda
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-white transition hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-white/10 bg-[#111820] px-5 pb-5 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {sectionLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-amber-300"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-full border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="rounded-full bg-amber-400 px-4 py-3 text-center text-sm font-bold text-slate-950"
              >
                Join Musibanda
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default SiteNavigation
