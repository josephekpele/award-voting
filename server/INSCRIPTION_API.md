# API d'Inscription des Candidats

## Endpoint: POST /api/inscription

Cet endpoint permet aux candidats de s'inscrire au Prix Ekklesia Impact Award 2026.

### URL
```
http://localhost:8000/api/inscription
```

### Méthode
`POST`

### Content-Type
`multipart/form-data`

### Paramètres (Form Data)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `prenom` | string | ✅ Oui | Prénom du candidat |
| `nom` | string | ✅ Oui | Nom de famille du candidat |
| `sexe` | string | ✅ Oui | Sexe du candidat: `male` ou `female` |
| `whatsapp` | string | ✅ Oui | Numéro de téléphone WhatsApp (sans le préfixe pays 228) |
| `eglise` | string | ✅ Oui | Nom du ministère ou de la paroisse d'origine |
| `biographie` | string | ✅ Oui | Biographie/parcours du candidat |
| `photo` | file | ❌ Non | Photo de profil (JPG, PNG, RAW - MAX 4MB) |

### Exemple de requête (JavaScript/React)

```javascript
const formData = new FormData();
formData.append('prenom', 'Jean');
formData.append('nom', 'Dupont');
formData.append('sexe', 'male');
formData.append('whatsapp', '90000000');
formData.append('eglise', 'Église du Réveil');
formData.append('biographie', 'Pasteur depuis 20 ans...');
formData.append('photo', fileObject); // Optional

const response = await fetch('http://localhost:8000/api/inscription', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

### Réponse Succès (200)

```json
{
  "ok": true,
  "message": "Inscription réussie ! Bienvenue Jean Dupont.",
  "candidate": {
    "id": 42,
    "number": null,
    "name": "Dupont",
    "prenom": "Jean",
    "sexe": "male",
    "whatsapp": "90000000",
    "eglise": "Église du Réveil",
    "biographie": "Pasteur depuis 20 ans...",
    "photo_url": "/uploads/12345678-1234-5678-1234-567812345678.jpg",
    "slug": "jean-dupont",
    "votes": 0,
    "year": null,
    "created_at": "2026-06-02T10:30:45.123456",
    "rank": null
  }
}
```

### Réponse Erreur (400/500)

```json
{
  "ok": false,
  "message": "Erreur lors de l'inscription: [description de l'erreur]",
  "candidate": null
}
```

### Stockage des fichiers

Les photos uploadées sont stockées dans le dossier `/uploads/` du serveur et sont accessibles via:
```
http://localhost:8000/uploads/{filename}
```

Par exemple:
```
http://localhost:8000/uploads/12345678-1234-5678-1234-567812345678.jpg
```

### Notes Importantes

1. Le slug unique est généré automatiquement basé sur le prénom et le nom
2. Si un slug existe déjà, un suffixe numérique est ajouté (ex: `jean-dupont-2`)
3. Les photos doivent être en RAW, JPG ou PNG avec un maximum de 800x800px
4. Le dossier `uploads/` est ignoré par Git (voir `.gitignore`)
5. Le préfixe 228 du numéro WhatsApp n'est pas inclus (c'est le pays Togo)

### Champs sauvegardés en base de données

- `prenom`: Prénom
- `name`: Nom de famille
- `sexe`: Genre
- `whatsapp`: Numéro de téléphone
- `eglise`: Église/Ministère
- `biographie`: Biographie
- `photo_url`: URL de la photo
- `slug`: Identifiant unique généré
- `votes`: Nombre de votes (0 par défaut)
- `created_at`: Date/heure d'inscription
