const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export async function fetchCandidates() {
  const res = await fetch(`${API_BASE}/api/candidates`)
  if (!res.ok) throw new Error('Failed to fetch candidates')
  return res.json()
}

export async function fetchCandidate(slug) {
  const res = await fetch(`${API_BASE}/api/candidates/${slug}`)
  if (!res.ok) throw new Error('Candidate not found')
  return res.json()
}

export async function vote(slug) {
  const res = await fetch(`${API_BASE}/api/candidates/${slug}/vote`, { method: 'POST' })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Vote failed')
  }
  return res.json()
}

export async function payAndVote(slug, paymentData) {
  const res = await fetch(`${API_BASE}/api/candidates/${slug}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Payment failed')
  }
  return res.json()
}

export function wsConnect(onMessage) {
  const url = (API_BASE.replace('http', 'ws')) + '/ws'
  const ws = new WebSocket(url)
  ws.onmessage = (ev) => {
    try { onMessage(JSON.parse(ev.data)) } catch {}
  }
  return ws
}