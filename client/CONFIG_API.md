# Configuration de l'API Client

## Fichier config.js

Le fichier `src/config.js` contient la configuration centralisée pour l'API.

### Variables d'environnement

Vous pouvez configurer l'URL de l'API via la variable d'environnement `REACT_APP_API_URL`:

```bash
# Production
REACT_APP_API_URL=https://api.ekklesia-impact.com

# Développement (localhost)
REACT_APP_API_URL=http://localhost:8000
```

### Endpoints disponibles

```javascript
import { API_ENDPOINTS } from './config';

// Inscription
API_ENDPOINTS.inscription
// => http://localhost:8000/api/inscription

// Candidats
API_ENDPOINTS.candidates.list
// => http://localhost:8000/api/candidates

API_ENDPOINTS.candidates.get(slug)
// => http://localhost:8000/api/candidates/{slug}

API_ENDPOINTS.candidates.vote(slug)
// => http://localhost:8000/api/candidates/{slug}/vote
```

## Utilisation dans les composants

### Exemple: Utiliser config.js dans un composant

```javascript
import { API_ENDPOINTS } from './config';

const handleInscription = async (formData) => {
  const response = await fetch(API_ENDPOINTS.inscription, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  return data;
};
```

## Changer l'URL de l'API

### En développement

1. Ouvrez `src/config.js`
2. Modifiez `API_BASE_URL`:

```javascript
export const API_BASE_URL = 'http://localhost:8000'; // Développement local
```

### En production

Utilisez une variable d'environnement:

```bash
# Dans votre fichier .env.production
REACT_APP_API_URL=https://api.ekklesia-impact.com
```

Ou modifiez directement:

```javascript
export const API_BASE_URL = 'https://api.ekklesia-impact.com';
```

## CORS et Security

Le serveur FastAPI configure CORS pour accepter les requêtes depuis:
- http://localhost:5173 (client Vite en développement)
- http://127.0.0.1:5173
- http://localhost:4173

Assurez-vous que votre URL de client est autorisée dans `server/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À adapter selon l'environnement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
