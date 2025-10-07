import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchCandidates, fetchCandidate, vote, wsConnect } from './api'
import ShareLink from './ShareLink'

export default function VotePage() {
  const { slug } = useParams()
  const [all, setAll] = React.useState([])
  const [c, setC] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [voting, setVoting] = React.useState(false)
  const [error, setError] = React.useState('')

  const votedKey = `voted:${slug}`
  const already = typeof window !== 'undefined' && localStorage.getItem(votedKey)

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

  const onVote = async () => {
    if (already) return
    setVoting(true)
    try {
      await vote(slug)
      localStorage.setItem(votedKey, '1')
      // refresh candidate and list
      const [list, one] = await Promise.all([
        fetchCandidates(),
        fetchCandidate(slug)
      ])
      setAll(list)
      setC(one)
    } catch (e) {
      alert(e.message)
    } finally {
      setVoting(false)
    }
  }

  if (loading) return <div className="container"><p>Chargement…</p></div>
  if (error) return <div className="container"><p style={{color:'#fca5a5'}}>{error}</p><p><Link to="/">← Retour</Link></p></div>
  if (!c) return <div className="container"><p>Candidat introuvable.</p></div>

  return (
    <div>
      <div className="header">
        <span className="badge">🏆 Ekklesia Impact Award 2025</span>
        <span className="notice">Vote pour <strong>{c.name}</strong></span>
        <span style={{marginLeft:'auto'}}><Link className="notice" to="/">← Tous les candidats</Link></span>
      </div>
      <div className="container">
        <ShareLink list={all} />

        <div className="card" style={{maxWidth:720, margin:'16px auto'}}>
          <img src={c.photo_url || 'https://picsum.photos/seed/placeholder/900/900'} alt={c.name} />
          <div className="content">
            <div>
              <div className="name" style={{fontSize:20}}>{c.name}</div>
              <div className="notice">Votes actuels : <strong>{c.votes}</strong></div>
              <div className="linkbox">Lien à partager : {window.location.origin + '/#/vote/' + c.slug}</div>
            </div>
            <div style={{display:'grid', gap:8}}>
              <button className="btn" onClick={onVote} disabled={voting || already}>
                {already ? 'Déjà voté' : (voting ? 'Vote…' : 'Voter pour lui/elle')}
              </button>
              <Link className="notice" to="/">← Retour</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}