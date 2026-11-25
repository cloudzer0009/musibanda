import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Music2, Sparkles } from 'lucide-react'

export default function AuthLayout({ children, eyebrow, title, description }: {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-[#f7f8fc] px-3 py-2 max-[375px]:py-1 sm:px-6 sm:py-3 lg:px-8">
      <div className="mx-auto flex min-h-9 max-[375px]:min-h-8 w-full max-w-6xl items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-3 text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20">
            <Music2 size={21} />
          </span>
          <span className="text-sm font-extrabold tracking-[0.16em]">MUSIBANDA</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-amber-700">
          Back to home <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="mx-auto mt-2 max-[375px]:mt-1 grid w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 sm:rounded-[2rem] lg:min-h-0 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#101820] p-8 text-white lg:flex xl:p-12">
          <div className="absolute -right-28 -top-20 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-36 -left-20 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-200/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
              <Sparkles size={14} /> Your next great sound starts here
            </span>
            <h1 className="mt-6 max-w-md font-serif text-4xl leading-tight tracking-tight xl:text-5xl">
              Find the music that makes the moment.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">
              Discover local talent, connect with performers, and bring your celebration to life.
            </p>
          </div>
          <p className="relative text-xs font-medium tracking-wide text-amber-200/70">A better stage for every kind of talent.</p>
        </section>
        <section className="flex items-center px-4 py-3 max-[375px]:px-3 max-[375px]:py-1 sm:px-8 sm:py-6 lg:px-10 lg:py-5 xl:px-12">
          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">{eyebrow}</p>
            <h2 className="mt-1.5 max-[375px]:mt-0.5 font-serif text-3xl max-[375px]:text-2xl tracking-tight text-slate-950">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
            <div className="mt-5 max-[375px]:mt-2">{children}</div>
          </div>
        </section>
      </div>
      <p className="mx-auto mt-1 max-[375px]:hidden max-w-6xl text-center text-[11px] text-slate-400">© {new Date().getFullYear()} Musibanda</p>
    </main>
  )
}
