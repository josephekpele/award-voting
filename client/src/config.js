// Configuration de l'API
// export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_BASE_URL = "https://awards-api.tabledesrois.site"

export const API_ENDPOINTS = {
  candidates: {
    list: `${API_BASE_URL}/api/candidates`,
    get: (slug) => `${API_BASE_URL}/api/candidates/${slug}`,
    create: `${API_BASE_URL}/api/candidates`,
    vote: (slug) => `${API_BASE_URL}/api/candidates/${slug}/vote`,
  },
  inscription: `${API_BASE_URL}/api/inscription`,
  gallery: `${API_BASE_URL}/api/gallery`,
};
