const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || "http://127.0.0.1:8888/callback";
const scopes = ['user-top-read', 'user-read-recently-played'];

export async function login() {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('verifier', verifier);

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('response_type', 'code');
  params.append('redirect_uri', redirectUri);
  params.append('scope', scopes.join(' '));
  params.append('code_challenge_method', 'S256');
  params.append('code_challenge', challenge);

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return null;

  const verifier = localStorage.getItem('verifier');
  if (!verifier) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!response.ok) {
    throw new Error('Failed to fetch token');
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  // Clear URL params
  window.history.replaceState({}, document.title, '/');
  return data.access_token;
}

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('verifier');
  window.location.reload();
}

export async function fetchSpotifyData() {
  const token = getAccessToken();
  if (!token) throw new Error('No access token');

  const headers = { Authorization: `Bearer ${token}` };

  const [topArtistsRes, topTracksRes, recentTracksRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me/top/artists?limit=20', { headers }),
    fetch('https://api.spotify.com/v1/me/top/tracks?limit=20', { headers }),
    fetch('https://api.spotify.com/v1/me/player/recently-played?limit=20', { headers })
  ]);

  if (!topArtistsRes.ok || !topTracksRes.ok || !recentTracksRes.ok) {
    if (topArtistsRes.status === 401) logout();
    throw new Error('Failed to fetch data');
  }

  const [topArtists, topTracks, recentTracks] = await Promise.all([
    topArtistsRes.json(),
    topTracksRes.json(),
    recentTracksRes.json()
  ]);

  return { topArtists, topTracks, recentTracks };
}

// PKCE Helpers
function generateCodeVerifier(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
