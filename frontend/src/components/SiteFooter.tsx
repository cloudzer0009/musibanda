import { Link } from 'react-router-dom'
import { ArrowUpRight, Music2 } from 'lucide-react'

const footerLinks = [
  { label: 'Browse musicians', href: '/#featured' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'About Musibanda', href: '/#about' },
]

function SiteFooter() {
  return (
    <footer className="bg-[#111820] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_0.8fr_1fr] lg:px-10 lg:py-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950">
              <Music2 size={21} strokeWidth={2.5} />
            </span>
            <span className="text-lg font-extrabold tracking-[0.16em]">MUSIBANDA</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
            Bringing live music closer to every celebration. Discover local talent and find a sound
            that feels like your event.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">Explore</h2>
          <ul className="mt-5 space-y-3">
            {footerLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">Say hello</h2>
          <p className="mt-5 text-sm leading-6 text-white/60">
            Contact details and social channels will be added in a future phase.
          </p>
          <Link
            to="/register"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-amber-300"
          >
            Be part of the music <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>© {new Date().getFullYear()} Musibanda. All rights reserved.</p>
          <p>Made for the moments that deserve a soundtrack.</p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
