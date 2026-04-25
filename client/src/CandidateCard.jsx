import React from 'react'
import { vote } from './api'

export default function CandidateCard({ c, onVoted }) {
  const [loading, setLoading] = React.useState(false)
  const votedKey = 'award_already_voted'
  const already = typeof window !== 'undefined' && localStorage.getItem(votedKey)


  const onClick = async () => {
    if (localStorage.getItem(votedKey)) {
      alert("Vous avez déjà voté. Un seul vote est autorisé par appareil.")
      return
    }

    setLoading(true)
    try {
      await vote(c.slug) // Appel API backend
      localStorage.setItem(votedKey, '1')
      onVoted?.()
      alert("Merci pour votre vote.")
    } catch (e) {
      // 💥 Afficher l’erreur retournée par le backend
      const errorMessage = e?.response?.data?.detail || e.message || "Erreur inconnue"
      alert(errorMessage)

      // 🔒 Sécurité : bloquer l'appareil côté frontend si le backend a rejeté le vote
      if (e?.response?.status === 409) {
        localStorage.setItem(votedKey, '1')
      }
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