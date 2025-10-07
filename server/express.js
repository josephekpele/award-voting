const express = require('express')
const app = express()

// Exemple de données
const candidates = {
  'paul': {
    name: 'Paul',
    image: 'https://api.tabledesrois.site/uploads/paul.jpg'
  },
  'marie': {
    name: 'Marie',
    image: 'https://api.tabledesrois.site/uploads/marie.jpg'
  }
}

app.get('/share/:slug', (req, res) => {
  const { slug } = req.params
  const candidate = candidates[slug]
  if (!candidate) return res.status(404).send('Not found')

  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>Vote pour ${candidate.name} - Ekklesia Impact Award 2025</title>
        <meta property="og:title" content="Vote pour ${candidate.name}" />
        <meta property="og:image" content="${candidate.image}" />
        <meta property="og:description" content="Soutenez ${candidate.name} pour l'Award 2025 !" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="${candidate.image}" />
        <meta http-equiv="refresh" content="0; url=https://ton-site.com/#/vote/${slug}" />
      </head>
      <body>
        <p>Redirection...</p>
      </body>
    </html>
  `)
})

app.listen(3001, () => console.log('Share server running on port 3001'))