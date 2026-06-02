import React from 'react'
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import Header from './Header'
import VotePage from './VotePage'
import PaymentPage from './PaymentPage'
import Galerie from './Galerie'
import Inscription from './Inscription'
import Contact from './Contact'

// API base (doit matcher api.js)
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

import './styles.css'

const highlights = [
  { icon: 'payments', title: 'Soutien Premium', description: 'Chaque vote est à 25F CFA. Votre contribution finance directement les prix d\'impact pour les gagnants.' },
  { icon: 'star', title: 'Option Gratuite', description: 'Certaines fenêtres de temps permettent un vote gratuit par jour et par catégorie. Restez connectés aux annonces.' }
]

const features = [
  { icon: 'verified_user', title: 'Sécurisé', subtitle: 'Audit Blockchain' },
  { icon: 'speed', title: 'Instantané', subtitle: 'Mobile Money' }
]

function Home() {
  const { section } = useParams()

  const [candidateList, setCandidateList] = React.useState([])
  const [awardStats, setAwardStats] = React.useState({ total_votes: 0, vote_end_at: null })
  const [timeRemaining, setTimeRemaining] = React.useState('')

  React.useEffect(() => {
    if (!section) return

    const target = document.getElementById(section)
    if (!target) return

    const y = target.getBoundingClientRect().top + window.pageYOffset - 90
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, [section])

  React.useEffect(() => {
    let active = true

    const currentYear = new Date().getFullYear()
    const pageSize = 15
    
    // Page d'accueil : on affiche uniquement les candidats de l'année en cours.
    fetch(`${API_BASE}/api/candidates?year=${currentYear}&page=1&page_size=${pageSize}`)

      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch candidates')
        return res.json()
      })
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setCandidateList(data)
        }
      })
      .catch(() => {
        // keep default placeholder candidates if the API is unavailable
      })

    return () => { active = false }
  }, [])

  React.useEffect(() => {
    let active = true
    const currentYear = new Date().getFullYear()

    // Charger les stats du vote
    fetch(`${API_BASE}/api/award-stats?year=${currentYear}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch award stats')
        return res.json()
      })
      .then((data) => {
        if (active) {
          setAwardStats(data)
        }
      })
      .catch(() => {
        // keep default stats if the API is unavailable
      })

    return () => { active = false }
  }, [])

  React.useEffect(() => {
    if (!awardStats.vote_end_at) return

    const updateCountdown = () => {
      const endTime = new Date(awardStats.vote_end_at).getTime()
      const now = new Date().getTime()
      const diff = endTime - now

      if (diff <= 0) {
        setTimeRemaining('Clôturé')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      // Format: Xj HH:MM:SS when days > 0, otherwise HH:MM:SS
      const hh = String(hours).padStart(2, '0')
      const mm = String(minutes).padStart(2, '0')
      const ss = String(seconds).padStart(2, '0')

      setTimeRemaining(
        days > 0 ? `${days}j ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`
      )
    }

    updateCountdown() // Initial call
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [awardStats.vote_end_at])


  return (
    <div className="landing-page">
      <main>
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="hero-tag">The 2026 Style Award</span>
            <h1>Glorifier Dieu par <span>l'Excellence</span></h1>
            <p>"Honorer le talent. Inspirer une génération. Glorifier Dieu."</p>
            <Link className="hero-button" to="/candidates">
              Découvrir les Candidats <span className="material-symbols-outlined">arrow_downward</span>
            </Link>
          </div>
        </section>

        <section className="scoreboard">
          <div className="section-header">
            <div>
              <h2>Tableau d'Honneur</h2>
              <p>Mise à jour en temps réel</p>
            </div>
            <div className="score-cards">
              <div>
                <span>Total des Votes</span>
                <strong>{awardStats.total_votes.toLocaleString('fr-FR')}</strong>
              </div>
              <div>
                <span>Clôture dans</span>
                <strong>{timeRemaining || '—'}</strong>
              </div>
            </div>
          </div>

          <div className="podium-grid">
            {candidateList.slice(0, 3).map((item) => (
              <div key={item.rank} className={`podium-card rank-${item.rank}`}>
                <div className="podium-image">
                  <img src={`${API_BASE}${item.photo_url}`} alt={item.name} />
                  <div className="rank-badge">{item.rank}</div>
                  {item.rank === 1 && <div className="leader-badge">Leader</div>}
                </div>
                <h3>{item.name}</h3>
                <p>{item.role}</p>
                <div className={item.rank === 1 ? 'top-votes' : 'votes'}>{item.votes}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="how-it-works" id="how-it-works">
          <div className="how-panel">
            <div>
              <h2>Comment ça marche ?</h2>
              {highlights.map((item) => (
                <div key={item.title} className="feature-row">
                  <div className="feature-icon"><span className="material-symbols-outlined">{item.icon}</span></div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="feature-grid">
              {features.map((item) => (
                <div key={item.title} className="feature-card">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="candidates-section" id="candidates">
          <div className="candidates-header">
            <h2>Tous les Candidats</h2>
            {/* <div className="candidate-tabs">
              <span className="active">Tous</span>
              <span>Musique</span>
              <span>Art</span>
              <span>Leadership</span>
            </div> */}
            <div className="candidate-grid">
              {candidateList.map((candidate) => (
                <div key={candidate.slug || candidate.name} className="candidate-card">
                  <div className="candidate-image">
                    <img src={`${API_BASE}${candidate.photo_url}`} alt={candidate.name} />
                    <div className="candidate-label">{candidate.label || candidate.role || 'Candidat N°'} {candidate.number}</div>
                  </div>
                  <div className="candidate-body">
                    <h4>{candidate.name}</h4>
                    <div className="candidate-votes">
                      <span className="material-symbols-outlined">analytics</span>
                      {candidate.votes || candidate.votes?.toString() || '0 votes'}
                    </div>
                    <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-wider text-sm bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-lg hover:scale-[1.02] transition-all hover:opacity-95 no-underline" to={`/vote/${candidate.slug}`}>
                      Profil <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-[#d4af37]/10 bg-[#111417]">
        <div className="mx-auto flex flex-col gap-6 px-8 py-12 max-w-screen-2xl md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <div className="text-lg font-semibold text-[#f2ca50]">Ekklesia Impact Award</div>
            <div className="text-[0.75rem] uppercase tracking-[0.05em] text-[#d0c5af]">© 2025 Ekklesia Impact Award — Développé par JEA</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#05080f] text-white">
      <Header />
      <div className="pt-24">{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/:section" element={<Layout><Home /></Layout>} />
        <Route path="/galerie" element={<Layout><Galerie /></Layout>} />
        <Route path="/laureats" element={<Layout><Home /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/inscription" element={<Layout><Inscription /></Layout>} />
        <Route path="/vote/:slug" element={<Layout><VotePage /></Layout>} />
        <Route path="/payment" element={<Layout><PaymentPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
