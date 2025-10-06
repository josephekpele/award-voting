import React from 'react'

export default function ShareLink({ list }) {
  if (!list?.length) return null

  return (
    <div
      className="topbar"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        padding: '12px 8px',
      }}
    >
      {list.map((c) => (
        <div
          key={c.id}
          className="topitem"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#ffffff',
            borderRadius: 12,
            padding: '6px 10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        >
          <img
            src={c.photo_url || 'https://picsum.photos/seed/p/60/60'}
            alt={c.name}
            width={28}
            height={28}
            style={{ borderRadius: 999, objectFit: 'cover' }}
          />
          <span
            style={{
              fontWeight: 600,
              color: '#222', // 🟢 Texte bien contrasté sur fond clair
            }}
          >
            {c.name}
          </span>
          <span
            className="count"
            style={{
              background: '#2563EB', // bleu vif
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 6,
            }}
          >
            {c.votes}
          </span>
        </div>
      ))}
    </div>
  )
}
