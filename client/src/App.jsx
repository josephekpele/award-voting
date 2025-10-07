import React from 'react'
import CandidateCard from './CandidateCard'
import ShareLink from './ShareLink'
import { fetchCandidates, wsConnect } from './api'
import { HashRouter, Routes, Route } from 'react-router-dom'
import VotePage from './VotePage'
import './styles.css'

function Home() {
  const [list, setList] = React.useState([])

  const load = async () => {
    const data = await fetchCandidates()
    setList(data)
  }

  React.useEffect(() => { load() }, [])
  React.useEffect(() => {
    const ws = wsConnect((msg) => {
      if (msg?.type === 'scoreboard') setList(msg.payload)
    })
    // ping keepalive
    const ping = setInterval(() => { try { ws.send('ping') } catch{} }, 25000)
    return () => { clearInterval(ping); try { ws.close() } catch{} }
  }, [])

  return (
    <div>
      <div className="header">
        <span className="badge">🏆 Ekklesia Impact Award 2025</span>
        <span className="notice">Partagez le lien d’un candidat pour voter</span>
      </div>
      <div className="container">
        <ShareLink list={list} />
        <div className="grid" style={{marginTop:16}}>
          {list.map((c) => (
            <CandidateCard key={c.id} c={c} onVoted={load} />
          ))}
        </div>
      </div>
      <footer style={{marginTop:32, textAlign:'center', color:'#888', fontSize:'0.9em'}}>
        Developed by J.E.A
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote/:slug" element={<VotePage />} />
      </Routes>
    </HashRouter>
  )
}