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
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-3 text-slate-950">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
            <Music2 size={21} />
          </span>
          <span className="text-sm font-extrabold tracking-[0.16em]">MUSIBANDA</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-violet-700">
          Back to home <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="mx-auto mt-8 grid max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 lg:mt-12 lg:min-h-[650px] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#101827] p-10 text-white lg:flex xl:p-14">
          <div className="absolute -right-28 -top-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-36 -left-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-violet-200">
              <Sparkles size={14} /> Your next great sound starts here
            </span>
            <h1 className="mt-8 max-w-md text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Find the music that makes the moment.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">
              Discover local talent, connect with performers, and bring your celebration to life.
            </p>
          </div>
          <p className="relative text-xs font-medium tracking-wide text-slate-400">A better stage for every kind of talent.</p>
        </section>
        <section className="flex items-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-slate-400">© {new Date().getFullYear()} Musibanda</p>
    </main>
  )
}
