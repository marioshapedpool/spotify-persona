<script>
  import { onMount } from 'svelte';
  import { login, handleRedirect, getAccessToken, fetchSpotifyData, logout } from './lib/spotify.js';
  import { analyzePersona } from './lib/persona.js';
  import './app.css';

  let isAuthenticated = false;
  let loading = true;
  let error = null;
  let personaResult = null;

  onMount(async () => {
    try {
      const tokenFromRedirect = await handleRedirect();
      if (tokenFromRedirect || getAccessToken()) {
        isAuthenticated = true;
        await loadData();
      } else {
        loading = false;
      }
    } catch (err) {
      error = err.message || 'Authentication failed';
      loading = false;
    }
  });

  async function loadData() {
    loading = true;
    error = null;
    try {
      const data = await fetchSpotifyData();
      personaResult = analyzePersona(data);
    } catch (err) {
      error = err.message || 'Failed to load Spotify data';
      if (err.message === 'No access token') {
        isAuthenticated = false;
      }
    } finally {
      loading = false;
    }
  }

  function handleLogin() {
    login();
  }

  function handleLogout() {
    logout();
  }
</script>

<main class="container">
  {#if !isAuthenticated && !loading}
    <div class="glass-card" style="margin-top: 10vh; max-width: 600px; margin-inline: auto;">
      <div style="margin-bottom: 2rem;">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="#1DB954" style="margin-bottom: 1.5rem;">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM19.08 9.3c-3.9-2.28-10.32-2.46-14.04-1.38-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.32-1.2 11.4-1.02 15.84 1.62.54.3 0 .9-.3 1.26-.18.42-.72.54-1.2.3z"/>
        </svg>
        <h1>Spotify Persona</h1>
        <p class="subtitle">
          Uncover the true essence of your musical taste. We analyze your Spotify history to reveal your unique character, aesthetic, and destiny.
        </p>
      </div>
      <button class="btn-primary" on:click={handleLogin}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM19.08 9.3c-3.9-2.28-10.32-2.46-14.04-1.38-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.32-1.2 11.4-1.02 15.84 1.62.54.3 0 .9-.3 1.26-.18.42-.72.54-1.2.3z"/>
        </svg>
        Connect with Spotify
      </button>
      {#if error}
        <div style="margin-top: 1.5rem; padding: 1rem; border-radius: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);">
          <p style="color: #ef4444; margin: 0; font-weight: 500;">{error}</p>
        </div>
      {/if}
    </div>
  {/if}

  {#if loading}
    <div class="loader-container">
      <div class="spotify-spinner"></div>
      <div style="text-align: center;">
        <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-main);">Analyzing your sound</h2>
        <p style="color: var(--text-muted); margin: 0;">Reading your top tracks and artists...</p>
      </div>
    </div>
  {/if}

  {#if isAuthenticated && !loading && personaResult}
    <div style="animation: slideUpFade 0.6s ease-out;">
      <div style="margin-bottom: 3rem;">
        <h1 style="font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 0.5rem;">Your Musical Soul</h1>
        <p class="subtitle" style="margin-bottom: 0;">Based on your unique Spotify listening patterns</p>
      </div>

      <div class="glass-card">
        <div class="persona-header">
          <span style="font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 600;">You are the</span>
          <h2 class="persona-title">{personaResult.character}</h2>
        </div>

        <div class="persona-grid">
          <div class="attribute-card">
            <span class="attribute-icon">🧠</span>
            <h3>Personality</h3>
            <p>{personaResult.personality}</p>
          </div>
          
          <div class="attribute-card">
            <span class="attribute-icon">✨</span>
            <h3>Aesthetic</h3>
            <p>{personaResult.aesthetic}</p>
          </div>

          <div class="attribute-card" style="grid-column: 1 / -1;">
            <span class="attribute-icon">🔮</span>
            <h3>Destiny</h3>
            <p style="font-size: 1.25rem;">{personaResult.destiny}</p>
          </div>
          
          <div class="attribute-card">
            <span class="attribute-icon">🎧</span>
            <h3>Sonic Signature</h3>
            <div class="tags">
              {#each personaResult.topGenres as genre}
                <span class="tag">{genre}</span>
              {/each}
            </div>
          </div>
          
          <div class="attribute-card">
            <span class="attribute-icon">🔥</span>
            <h3>Current Vibe</h3>
            <p style="font-size: 1rem; color: var(--text-muted);">
              Currently obsessed with <strong style="color: var(--text-main);">{personaResult.topArtistName}</strong> 
              and heavily looping <strong style="color: var(--text-main);">{personaResult.topTrackName}</strong>.
            </p>
          </div>
        </div>
      </div>

      <button class="btn-secondary" on:click={handleLogout}>Disconnect Spotify</button>
    </div>
  {/if}

  {#if isAuthenticated && !loading && error}
    <div class="glass-card error-card" style="max-width: 500px; margin-inline: auto;">
      <h2 class="error-title">Connection Error</h2>
      <p style="color: var(--text-muted); margin-bottom: 2rem;">{error}</p>
      <button class="btn-secondary" style="margin-top: 0;" on:click={handleLogout}>Log Out & Try Again</button>
    </div>
  {/if}
</main>
