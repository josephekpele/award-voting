import React from 'react'
import { vote } from './api'

export default function CandidateCard({ c, onVoted }) {
  const [loading, setLoading] = React.useState(false)
  const votedKey = 'voted:once' // clé unique pour tout vote
  const already = typeof window !== 'undefined' && localStorage.getItem(votedKey)

  const onClick = async () => {
    if (already) {
      alert("Vous avez déjà voté pour un candidat. Un seul vote est autorisé par appareil.")
      return
    }
    setLoading(true)
    try {
      await vote(c.slug)
      localStorage.setItem(votedKey, '1') // on enregistre le vote unique
      onVoted?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = `${window.location.origin}/#/vote/${c.slug}`

  return (
    <div className="card">
      <img src={c.photo_url || 'https://picsum.photos/seed/placeholder/600/600'} alt={c.name} />
      <div className="content">
        <div>
          <div className="name">{c.name}</div>
          <div className="linkbox">{shareUrl}</div>
        </div>
        <div style={{display:'grid', gap:8}}>
          <button className="btn" onClick={onClick} disabled={loading || already}>
            {already ? 'Déjà voté' : (loading ? 'Vote…' : 'Voter')}
          </button>
          <a className="notice" href={shareUrl} target="_blank" rel="noreferrer">Lien à partager →</a>
        </div>
      </div>
    </div>
  )
}