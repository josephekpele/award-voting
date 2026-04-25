import React from 'react'
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import Header from './Header'
import VotePage from './VotePage'
import PaymentPage from './PaymentPage'
import Galerie from './Galerie'
import Inscription from './Inscription'
import Contact from './Contact'
import { fetchCandidates } from './api'
import './styles.css'

const podium = [
  {
    rank: 2,
    name: "Jean-Paul Kamga",
    role: "Designer d'Espace",
    votes: '42,109 votes',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6jCsdCNl7TW_pPZFQOk-diqZejBoEXhrRv-qjfZWRjMiwkkJJGFzT_HWFlxT1_w7pb-180MyGozMoEDvV6_8U_orkmHFBMxSOAQuZBs4mmEP9QiGE1ZsKCYvE66wAYeNsB_DY98VClhenWr_GgYBXJfm60tUEu4nsN-rdK91t-4fyHE36Xe9YwB7ZmOy6KFKfkKh6qermKQKsfbLHih3sZb_8mLkGmE2WvSztKoHiWQQkPK3MGd88AXqtjYMkkBtjhPbIXxdD2je'
  },
  {
    rank: 1,
    name: "Grace Moudio",
    role: "Artiste Textile",
    votes: '58,230 votes',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgAviyVAd3pqx0pAoNQRFxc6Vtlh75t46mJtdMfoL91rWYD1PxJ1mTHYyWXq0X0H7glx49tJiGEtCm8BVIXNmIHmAg_lx4Hp7FSi_-6LVy1vEjr6owIdqaCe6nQCC2sGlTaNNAzXlvEhJIeJTjBz4J7BV3gFpy5srjfG8ylQcZdm3ym1p53VBHcZlF5zF2FlagM-s3RfNdPdJOuAjPJAHIoWocMrOzoXcGdkO99-3ce2z1QNnywG-wG_M8cJIS2KEhz-d-a5mF0x0w'
  },
  {
    rank: 3,
    name: "Emmanuel Tchuinte",
    role: "Photographe",
    votes: '28,153 votes',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgAviyVAd3pqx0pAoNQRFxc6Vtlh75t46mJtdMfoL91rWYD1PxJ1mTHYyWXq0X0H7glx49tJiGEtCm8BVIXNmIHmAg_lx4Hp7FSi_-6LVy1vEjr6owIdqaCe6nQCC2sGlTaNNAzXlvEhJIeJTjBz4J7BV3gFpy5srjfG8ylQcZdm3ym1p53VBHcZlF5zF2FlagM-s3RfNdPdJOuAjPJAHIoWocMrOzoXcGdkO99-3ce2z1QNnywG-wG_M8cJIS2KEhz-d-a5mF0x0w'
  }
]

const highlights = [
  { icon: 'payments', title: 'Soutien Premium', description: 'Chaque vote est à 25F CFA. Votre contribution finance directement les prix d\'impact pour les gagnants.' },
  { icon: 'star', title: 'Option Gratuite', description: 'Certaines fenêtres de temps permettent un vote gratuit par jour et par catégorie. Restez connectés aux annonces.' }
]

const features = [
  { icon: 'verified_user', title: 'Sécurisé', subtitle: 'Audit Blockchain' },
  { icon: 'speed', title: 'Instantané', subtitle: 'Mobile Money' }
]

const candidates = [
  { slug: 'sarah-ndem', name: 'Sarah Ndem', label: 'Styliste', votes: '24,902 votes', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAigCw3JJpeFExRrJdjcKLY22f8Pg0vpIyaG5i002Hmu0dmKGhw2cWM1J1g0bY0ss0AznoOvwI1to1yg7_brzt3NkVW8Oq_tqHwfNIn9z12fn8MaWgh3JNGTXFCIqlorFTzDE-j75FgFVYbsRgf_jaY4mKIZms7sqHnJqq2rM49Slno_508bMz2Cm-S2Jp8pZ53MAhsSRXGJzcmS2SM2mxUsbGHbFt-s6eNgIfnE_j0jNJDXUj5NZWzcj5LWkJ-rLbxnwyMkI7GxudH' },
  { slug: 'michel-etoo', name: 'Michel Eto\'o', label: 'Cinéaste', votes: '19,455 votes', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAynZstf_9KuU9rGkuZn-vtoBlh65RbvFnqtQpG0MDJhRlbRKi6sLbdyZFvQZ3u7k0FArCpgIfrOdlmKb0zZObepVULwimO2DX_DlpHltF1e50_eCS63OMHdSbOaz8M6F56BaVtMnIsQXBKXKHb4EqWAwlQSrbHlL9ZeakK74vfDoMu_hZrmgc-FeR_yt-M6kPn3gFN8aapyT8WwT4nAEJpzqZft4yLJXC_AeTqi9bEvhqZCrQ0ZF6_YqyB7o3YtXfC0-uCVmNJFW3j' },
  { slug: 'anne-marie', name: 'Anne Marie', label: 'Leadership', votes: '15,221 votes', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9E5aGDzTuHoKa6qPz8kfCxeWK4Qor9G-9FKdm9NccawvU2fUCNBNHBGfj0YUT4hOqINdjQ13XMDZYaZuqBWMGhoQcrH4RKwjiJY-o7ykjsNu7AZ1doEWZNjhdW7UHRr_mf6uBVSS8mjHzXbLXKXAxAGwvRpUJflRqlnHDohyuOtZZi28QDIZuWgvpqYY04f6J7prPz6_DQLkNn59Mu74QKABalyV858hbk-nXQfNjI0MVOPeU5IF0tnOLyu4TaDN-rb2rJhLoyMQ9' },
  { slug: 'cedric-ngando', name: 'Michel Eklou', label: 'Musique', votes: '12,880 votes', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXJSwdqOT8hESwNkXM809qVjeXw_1qr9lf3u7MjHvIUJH7aWB7A1oR4pozWfw7F8tUXjiOK8C1CKBzHjcic5BpmCNO0z1ENI-_3dpZFDhvoFWXHdLSgBWseEtG_7ZrPHpW8h6RKyYhq49Aa_x0mVpSI7h4s1ZPXkOZ611dnIbIdL60qMCBmTbCjQDwqNUE9moxylcmqa0LmI9c7J-grJbSnY9Q9S9DMol-D8LDhGzhJ02458BenTTfAJpRtq24JNEXVBDIpTYMNZ2' }
]

function Home() {
  const { section } = useParams()

  const [candidateList, setCandidateList] = React.useState(candidates)

  React.useEffect(() => {
    if (!section) return
    const target = document.getElementById(section)
    if (!target) return

    const y = target.getBoundingClientRect().top + window.pageYOffset - 90
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, [section])

  React.useEffect(() => {
    let active = true
    fetchCandidates()
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

  return (
    <div className="landing-page">
      <main>
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="hero-tag">The 2024 Digital Gala</span>
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
                <strong>128,492</strong>
              </div>
              <div>
                <span>Clôture dans</span>
                <strong>14:02:45</strong>
              </div>
            </div>
          </div>

          <div className="podium-grid">
            {podium.map((item) => (
              <div key={item.rank} className={`podium-card rank-${item.rank}`}>
                <div className="podium-image">
                  <img src={item.image} alt={item.name} />
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
                    <img src={candidate.photo_url || candidate.image} alt={candidate.name} />
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
