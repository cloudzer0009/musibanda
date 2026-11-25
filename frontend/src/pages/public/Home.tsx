import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  CalendarDays,
  Check,
  Disc3,
  Guitar,
  Headphones,
  Heart,
  MapPin,
  Mic2,
  Music2,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'

type Musician = {
  id: string
  name: string
  genres: string[]
  location: string
  price: number
  rating: string
  reviews: number
  image: string
  imageAlt: string
  bio: string
}

const musicians: Musician[] = [
  {
    id: 'mara-santos',
    name: 'Mara Santos',
    genres: ['Acoustic', 'OPM'],
    location: 'Makati',
    price: 8500,
    rating: '4.9',
    reviews: 28,
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Singer Mara Santos performing with a microphone',
    bio: 'A warm, soulful voice for intimate celebrations, weddings, and laid-back evenings. Mara’s set blends acoustic favorites with heartfelt OPM.',
  },
  {
    id: 'manila-jazz-collective',
    name: 'Manila Jazz Collective',
    genres: ['Jazz', 'Classical'],
    location: 'Quezon City',
    price: 18000,
    rating: '4.8',
    reviews: 16,
    image:
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Jazz musicians performing together on stage',
    bio: 'A polished ensemble bringing timeless jazz standards and elegant instrumental arrangements to receptions and corporate events.',
  },
  {
    id: 'ella-reyes',
    name: 'Ella Reyes',
    genres: ['R&B', 'Pop'],
    location: 'Cebu City',
    price: 12000,
    rating: '5.0',
    reviews: 21,
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Ella Reyes singing under warm stage lights',
    bio: 'An expressive vocalist with a smooth R&B sound and a setlist made for big sing-alongs, celebrations, and late-night dance floors.',
  },
  {
    id: 'northbound',
    name: 'Northbound',
    genres: ['Rock', 'Pop'],
    location: 'Davao City',
    price: 22000,
    rating: '4.9',
    reviews: 34,
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'A live band playing for an outdoor concert crowd',
    bio: 'A high-energy four-piece band covering rock anthems, modern pop, and crowd favorites for parties that call for a full live sound.',
  },
  {
    id: 'celeste-string-duo',
    name: 'Celeste String Duo',
    genres: ['Classical', 'Acoustic'],
    location: 'Pasig',
    price: 10000,
    rating: '4.9',
    reviews: 12,
    image:
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'A violinist performing on stage',
    bio: 'A graceful violin and cello pairing for ceremonies, cocktail hours, and special moments that deserve a softer soundtrack.',
  },
  {
    id: 'sunday-sessions',
    name: 'Sunday Sessions',
    genres: ['Worship', 'OPM'],
    location: 'Taguig',
    price: 14000,
    rating: '4.8',
    reviews: 19,
    image:
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Guitarist playing an acoustic set',
    bio: 'A close-knit acoustic group with uplifting worship music and familiar Filipino favorites for community gatherings and celebrations.',
  },
]

const genres: { name: string; caption: string; icon: LucideIcon }[] = [
  { name: 'Acoustic', caption: 'Easygoing & intimate', icon: Guitar },
  { name: 'Pop', caption: 'Songs everyone knows', icon: Disc3 },
  { name: 'Rock', caption: 'Turn up the energy', icon: AudioLines },
  { name: 'Jazz', caption: 'Smooth, timeless sets', icon: Music2 },
  { name: 'Classical', caption: 'A graceful touch', icon: Mic2 },
  { name: 'R&B', caption: 'Soulful live vocals', icon: Heart },
  { name: 'OPM', caption: 'Local songs, loved', icon: Headphones },
  { name: 'Worship', caption: 'Music with meaning', icon: Sparkles },
]

const steps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Explore local musicians by genre, location, and the sound you have in mind.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Book',
    description: 'Choose a musician and send a booking request with your event details.',
    icon: CalendarDays,
  },
  {
    number: '03',
    title: 'Enjoy',
    description: 'Coordinate the details together and make your event one to remember.',
    icon: Music2,
  },
]

const benefits = [
  'Find talent that fits your event and your taste',
  'See sample rates clearly before you reach out',
  'Keep booking details organized in one place',
  'Connect directly with musicians about your plans',
]

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

function Home() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const locations = useMemo(
    () => [...new Set(musicians.map((musician) => musician.location))].sort(),
    [],
  )

  const filteredMusicians = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return musicians.filter((musician) => {
      const matchesQuery =
        !normalizedQuery ||
        musician.name.toLowerCase().includes(normalizedQuery) ||
        musician.genres.some((genre) => genre.toLowerCase().includes(normalizedQuery))
      const matchesLocation = !location || musician.location === location

      return matchesQuery && matchesLocation
    })
  }, [location, query])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (selectedMusician && !dialog.open) {
      dialog.showModal()
    } else if (!selectedMusician && dialog.open) {
      dialog.close()
    }
  }, [selectedMusician])

  const searchMusicians = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })
  }

  const filterByGenre = (genre: string) => {
    setQuery(genre)
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })
  }

  const clearFilters = () => {
    setQuery('')
    setLocation('')
  }

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-[#101820] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2200&q=90")',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101820] via-[#101820]/90 to-[#101820]/35"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101820]/80 via-transparent to-[#101820]/25" />

        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 pb-20 pt-20 sm:px-8 sm:pb-24 lg:min-h-[690px] lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.17em] text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Live music, made personal
            </div>
            <h1 className="mt-7 font-serif text-5xl font-medium leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Find the perfect musician{' '}
              <span className="italic text-amber-300">for your event.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              Discover talented local musicians and book the perfect live entertainment for your
              special occasion.
            </p>

            <form
              onSubmit={searchMusicians}
              className="mt-9 grid gap-3 rounded-2xl border border-white/10 bg-white p-3 shadow-2xl shadow-black/20 sm:grid-cols-[1fr_0.72fr_auto] sm:items-center"
            >
              <label className="flex min-w-0 items-center gap-3 px-3 py-2">
                <Search size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
                <span className="sr-only">Search by musician or genre</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Musician or genre"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                />
              </label>
              <label className="flex items-center gap-3 border-t border-slate-100 px-3 py-3 sm:border-l sm:border-t-0 sm:py-2">
                <MapPin size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
                <span className="sr-only">Filter by location</span>
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full cursor-pointer border-0 bg-transparent text-sm text-slate-700 outline-none focus:ring-0"
                >
                  <option value="">Any location</option>
                  {locations.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                Search <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-white/65 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <Check size={16} className="text-amber-300" /> Local talent
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={16} className="text-amber-300" /> Clear sample rates
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={16} className="text-amber-300" /> Made for your moment
              </span>
            </div>
          </div>

          <div className="relative hidden min-h-[420px] items-center justify-center lg:flex">
            <div className="absolute right-4 top-4 h-72 w-72 rounded-full border border-white/15" />
            <div className="absolute right-12 top-12 h-56 w-56 rounded-full border border-amber-300/25" />
            <div className="relative h-[390px] w-[340px] rotate-2 overflow-hidden rounded-[170px_170px_32px_32px] border border-white/20 shadow-2xl shadow-black/40">
              <img
                src="https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1000&q=90"
                alt="Singer performing beneath golden stage lights"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
              <div className="absolute bottom-7 left-7 right-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                  The right sound
                </p>
                <p className="mt-2 font-serif text-2xl text-white">For your kind of occasion.</p>
              </div>
            </div>
          </div>
        </div>

        <a
          href="#genres"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:text-white lg:inline-flex"
        >
          Explore <ArrowDown size={14} />
        </a>
      </section>

      <section id="genres" className="scroll-mt-24 bg-stone-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Find your sound</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                What does your event sound like?
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              From a relaxed acoustic set to a dance-floor favorite, start with the genre that feels
              right.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            {genres.map(({ name, caption, icon: Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => filterByGenre(name)}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-800 transition group-hover:bg-amber-400 group-hover:text-slate-950">
                  <Icon size={21} strokeWidth={1.8} />
                </span>
                <span className="mt-5 block text-base font-bold text-slate-900">{name}</span>
                <span className="mt-1 block text-xs text-slate-500">{caption}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="featured" className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">A first listen</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Meet a few local favorites
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              These sample listings show how musicians can share their sound and starting rates.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-stone-100 px-3 py-1.5 font-semibold text-slate-600">
              Sample listings
            </span>
            <span>All rates and ratings are illustrative demo data.</span>
          </div>

          {filteredMusicians.length > 0 ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMusicians.map((musician) => (
                <article
                  key={musician.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                >
                  <div className="relative aspect-[1.55] overflow-hidden bg-slate-100">
                    <img
                      src={musician.image}
                      alt={musician.imageAlt}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                      {musician.genres.join(' · ')}
                    </span>
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
                      <Star size={13} className="fill-amber-300 text-amber-300" />
                      {musician.rating}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">{musician.name}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin size={15} className="text-slate-400" />
                          {musician.location}
                        </p>
                      </div>
                      <p className="shrink-0 text-right">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Starts at
                        </span>
                        <span className="mt-0.5 block text-sm font-bold text-slate-900">
                          {pesoFormatter.format(musician.price)}
                        </span>
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {musician.rating} sample rating · {musician.reviews} sample reviews
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMusician(musician)}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        View profile
                      </button>
                      <button
                        type="button"
                        disabled
                        title="Booking requests will be available in a future phase."
                        className="cursor-not-allowed rounded-xl bg-amber-100 px-3 py-2.5 text-xs font-bold text-amber-900/60"
                      >
                        Book now
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-stone-50 px-6 py-14 text-center">
              <p className="font-semibold text-slate-900">No sample musicians match those filters.</p>
              <p className="mt-2 text-sm text-slate-500">Try another name, genre, or location.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-[#111820] px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Simple by design</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              From first search to first song
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/60">
              A clearer way to find live entertainment for the moments that matter.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map(({ number, title, description, icon: Icon }, index) => (
              <article key={number} className="relative border-t border-white/15 pt-7">
                {index < steps.length - 1 && (
                  <span className="absolute right-0 top-[-1px] hidden h-px w-8 translate-x-1/2 bg-amber-300 md:block" />
                )}
                <div className="flex items-center justify-between">
                  <span className="font-serif text-4xl text-amber-300/80">{number}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-amber-300">
                    <Icon size={22} />
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-24 bg-stone-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="relative">
            <div className="absolute -left-3 -top-3 h-full w-full rounded-[2rem] border border-amber-300 sm:-left-5 sm:-top-5" />
            <img
              src="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=85"
              alt="A crowd enjoying live music together"
              loading="lazy"
              className="relative aspect-[1.15] w-full rounded-[2rem] object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-slate-950/80 p-5 text-white backdrop-blur sm:bottom-7 sm:left-7 sm:right-7 sm:p-6">
              <p className="font-serif text-xl italic sm:text-2xl">
                “Every gathering deserves a soundtrack that feels like yours.”
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
                The Musibanda idea
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Why Musibanda</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Great music makes a good moment unforgettable.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Finding the right live performer should feel exciting, not overwhelming. Musibanda is
              being built to help people discover local musicians and make event planning feel more
              personal.
            </p>
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-200 text-amber-900">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
              <ShieldCheck size={17} className="text-amber-700" />
              Sample listings are for design preview only
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-amber-300 lg:grid-cols-[1fr_auto]">
          <div className="px-7 py-10 sm:px-12 sm:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-950/70">Let the good times play</p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Ready to find your musician?
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-800/75">
              Explore the sample listings or join Musibanda as a musician when registration opens.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#featured"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Browse musicians <ArrowRight size={16} />
              </a>
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-full border border-slate-950/20 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-white/40"
              >
                Register as a musician
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="relative hidden min-w-[250px] items-center justify-center overflow-hidden lg:flex">
            <div className="absolute h-64 w-64 rounded-full border border-slate-950/15" />
            <div className="absolute h-44 w-44 rounded-full border border-slate-950/15" />
            <Music2 size={88} strokeWidth={0.8} className="relative -rotate-12 text-slate-950/75" />
          </div>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        onClose={() => setSelectedMusician(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedMusician(null)
        }}
        className="m-auto w-[min(92vw,560px)] rounded-3xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/70"
      >
        {selectedMusician && (
          <div>
            <div className="relative h-56 overflow-hidden">
              <img
                src={selectedMusician.image}
                alt={selectedMusician.imageAlt}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedMusician(null)}
                aria-label="Close musician profile"
                className="absolute right-4 top-4 rounded-full bg-slate-950/75 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-slate-950"
              >
                Close
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                Sample musician profile
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-950">
                {selectedMusician.name}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={16} /> {selectedMusician.location}
                <span aria-hidden="true">·</span>
                {selectedMusician.genres.join(' · ')}
              </p>
              <p className="mt-5 text-sm leading-7 text-slate-600">{selectedMusician.bio}</p>
              <div className="mt-6 rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Illustrative starting rate
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {pesoFormatter.format(selectedMusician.price)}
                </p>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-400">
                Sample profile details only. Booking requests are not available in this phase.
              </p>
            </div>
          </div>
        )}
      </dialog>
    </main>
  )
}

export default Home