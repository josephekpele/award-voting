import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/galerie', label: 'Galerie' },
  { to: '/laureats', label: 'Laureats 2025' },
  { to: '/inscription', label: 'Inscription' }
]

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { pathname } = useLocation()

  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#080c14]/95 backdrop-blur-xl shadow-black/30">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#f2ca50] transition hover:text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f2ca50]/10 text-[#f2ca50]">E</span>
          Ekklesia Impact Award
        </Link>

        <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.18em] text-slate-300 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition ${pathname === link.to ? 'text-white' : 'text-slate-300 hover:text-white'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/candidates"
            className="hidden rounded-full bg-[#f2ca50] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#241a00] transition hover:shadow-[0_20px_60px_rgba(242,202,80,0.22)] md:inline-flex"
          >
            Voter
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111821]/95 text-white transition hover:bg-[#111821] md:hidden"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-x-4 top-20 z-50 rounded-[2rem] border border-white/10 bg-[#0f1720]/95 p-6 shadow-2xl shadow-black/50">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-3xl border border-white/10 bg-[#111821]/95 px-4 py-4 text-sm uppercase tracking-[0.18em] text-slate-200 transition hover:border-[#f2ca50]/30 hover:bg-[#111821] hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/candidates"
                className="rounded-3xl bg-[#f2ca50] px-4 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#241a00] transition hover:brightness-105"
              >
                Voter
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
