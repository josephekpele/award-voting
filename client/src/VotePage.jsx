import React from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchCandidates, fetchCandidate, wsConnect } from './api'

const pageFade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

export default function VotePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [all, setAll] = React.useState([])
  const [c, setC] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [voting, setVoting] = React.useState(false)
  const [error, setError] = React.useState('')
  const [voteCount, setVoteCount] = React.useState(1)

  const unitPrice = 25
  const total = unitPrice * Math.max(1, voteCount)

  const load = async () => {
    try {
      setLoading(true)
      const [list, one] = await Promise.all([
        fetchCandidates(),
        fetchCandidate(slug)
      ])
      setAll(list)
      setC(one)
      setError('')
    } catch (e) {
      setError(e.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [slug])
  React.useEffect(() => {
    const ws = wsConnect((msg) => {
      if (msg?.type === 'scoreboard') setAll(msg.payload)
    })
    const ping = setInterval(() => { try { ws.send('ping') } catch{} }, 25000)
    return () => { clearInterval(ping); try { ws.close() } catch{} }
  }, [])

  const onVote = () => {
    setVoting(true)
    navigate('/payment', { state: { slug, total, candidate: c, voteCount } })
  }

  if (loading) return (
    <div className="min-h-screen bg-[#05080f] text-white flex items-center justify-center px-6">
      <div className="rounded-3xl border border-white/10 bg-[#0b1018]/80 p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-lg font-semibold">Chargement…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#05080f] text-white flex items-center justify-center px-6">
      <div className="rounded-3xl border border-rose-500/20 bg-[#0b1018]/90 p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-lg font-semibold text-rose-300">{error}</p>
        <Link className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#121821] px-5 py-3 text-sm text-slate-300 shadow-lg shadow-black/20" to="/candidates">
          <span className="material-symbols-outlined">arrow_back</span>
          Retour aux candidats
        </Link>
      </div>
    </div>
  )

  if (!c) return (
    <div className="min-h-screen bg-[#05080f] text-white flex items-center justify-center px-6">
      <div className="rounded-3xl border border-white/10 bg-[#0b1018]/80 p-8 shadow-2xl shadow-black/30">
        <p className="text-lg font-semibold">Candidat introuvable.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#05080f] text-white">
      <main className="mx-auto flex max-w-screen-2xl gap-6 px-4 py-6 lg:px-8 lg:py-10">
        {/* <aside className="hidden w-72 flex-col gap-4 rounded-[2rem] border border-white/10 bg-[#0a101a]/80 p-6 shadow-2xl shadow-black/40 lg:flex">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.25em] text-[#f2ca50]/90">Menu</span>
            <span className="text-[#f2ca50]">•</span>
          </div>
          <Link to="/" className="flex items-center gap-3 rounded-3xl border border-transparent bg-[#111821] px-4 py-4 text-sm text-slate-100 transition hover:border-[#f2ca50]/30 hover:bg-[#111821]/95">
            <span className="material-symbols-outlined text-[#f2ca50]">home</span>
            Home
          </Link>
          <button className="flex items-center gap-3 rounded-3xl border border-white/5 bg-[#111821] px-4 py-4 text-left text-sm text-slate-200 transition hover:border-[#f2ca50]/30 hover:bg-[#111821]/95">
            <span className="material-symbols-outlined text-[#f2ca50]">emoji_events</span>
            Categories
          </button>
          <button className="flex items-center gap-3 rounded-3xl border border-white/5 bg-[#111821] px-4 py-4 text-left text-sm text-slate-200 transition hover:border-[#f2ca50]/30 hover:bg-[#111821]/95">
            <span className="material-symbols-outlined text-[#f2ca50]">leaderboard</span>
            Leaderboard
          </button>
          <button className="flex items-center gap-3 rounded-3xl border border-white/5 bg-[#111821] px-4 py-4 text-left text-sm text-slate-200 transition hover:border-[#f2ca50]/30 hover:bg-[#111821]/95">
            <span className="material-symbols-outlined text-[#f2ca50]">person</span>
            Profile
          </button>
        </aside> */}

        <motion.div initial="hidden" animate="visible" variants={pageFade} className="flex-1 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <section className="rounded-[2rem] border border-white/10 bg-[#0f1720]/90 p-6 shadow-2xl shadow-black/40">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-[2rem] bg-[#0c1118]">
                  <img
                    className="h-full w-full object-cover"
                    src={c.photo_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'}
                    alt={c.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05080f]/90 via-transparent to-transparent" />
                </div>

                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-[#f2ca50]/90">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f2ca50]/10 text-[#f2ca50]">•</span>
                    Award Finalist
                  </div>
                  <h1 className="text-4xl font-semibold text-white xl:text-5xl">{c.name}</h1>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="rounded-full border border-[#f2ca50]/20 bg-[#f2ca50]/10 px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-[#f2ca50]">Category: Social Impact</span>
                    <span className="rounded-full border border-[#f2ca50]/20 bg-[#f2ca50]/10 px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-[#f2ca50]">Dept: Human Rights</span>
                  </div>

                  <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-[#0d121b]/90 p-6 shadow-inner shadow-black/20">
                    <div className="mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-[#f2ca50]/90">
                      <span className="material-symbols-outlined text-[#f2ca50]">format_quote</span>
                      Professional Biography
                    </div>
                    <p className="text-sm leading-7 text-slate-300">
                      {c.description || c.bio || `A pioneer in community-driven sustainable development, ${c.name} has led transformative initiatives across West Africa. Their leadership has helped deliver impact at scale, combining technical innovation with human-centered advocacy.`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="rounded-[2rem] border border-white/10 bg-[#0f1720]/95 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-[#f2ca50]/80">Cast Your Vote</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">{unitPrice}F / Vote</h2>
                </div>
                <div className="rounded-3xl border border-[#f2ca50]/15 bg-[#111722]/90 px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#f2ca50]">
                  25F / Vote
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="rounded-[1.75rem] border border-white/10 bg-[#0c1118]/90 p-5">
                  <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Number of Votes</label>
                  <input
                    id="voteCount"
                    type="number"
                    min="1"
                    value={voteCount}
                    onChange={(event) => setVoteCount(Math.max(1, parseInt(event.target.value, 10) || 1))}
                    className="mt-4 w-full rounded-3xl border border-white/10 bg-[#081014]/90 px-5 py-4 text-3xl font-semibold text-white outline-none transition focus:border-[#f2ca50]/60"
                  />
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-[#0c1118]/90 p-5">
                  <div className="flex items-center justify-between text-sm uppercase tracking-[0.25em] text-slate-500">Total Contribution</div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-4xl font-semibold text-white">{total}F</p>
                      <p className="text-sm text-slate-500">CFA Francs</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onVote}
                  disabled={voting}
                  className="w-full rounded-3xl bg-gradient-to-r from-[#f2ca50] to-[#d4af37] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#241a00] shadow-[0_20px_60px_rgba(242,202,80,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="material-symbols-outlined mr-2 align-middle">security</span>
                  {voting ? 'Chargement…' : 'Voter maintenant (25F/vote)'}
                </button>

                <div className="rounded-[1.75rem] border border-white/10 bg-[#0c1118]/90 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2ca50]/10 text-[#f2ca50]">
                      <span className="material-symbols-outlined">verified_user</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Secure & Anonymous</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">Each transaction is encrypted. Your personal identity is never shared with candidates or third parties.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-[#081014]/95 px-5 py-4 text-xs uppercase tracking-[0.25em] text-slate-400">
                  <span>Session ID: EX-9402-TRX</span>
                  <span className="material-symbols-outlined text-slate-400">content_copy</span>
                </div>
              </div>
            </aside>
          </div>

          <footer className="rounded-[2rem] border border-white/5 bg-[#0b1118]/95 px-6 py-5 text-center text-xs uppercase tracking-[0.3em] text-slate-500 shadow-inner shadow-black/20">
            High Stakes Secure Voting System v2.4
          </footer>
        </motion.div>
      </main>
    </div>
  )
}
