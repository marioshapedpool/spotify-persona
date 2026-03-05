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
    <div class="card" style="margin-top: 10vh; animation-delay: 0.2s;">
      <h1>Spotify Persona</h1>
      <p style="font-size: 1.2em; color: #ccc; margin-bottom: 2rem;">
        Discover your personality, character, and destiny based on your musical taste.
      </p>
      <button on:click={handleLogin}>Log in with Spotify</button>
      {#if error}
        <p style="color: #ff4d4d; margin-top: 1rem;">{error}</p>
      {/if}
    </div>
  {/if}

  {#if loading}
    <div style="margin-top: 20vh;">
      <div class="loader"></div>
      <p style="color: #ccc; font-size: 1.2em;">Analyzing your musical soul...</p>
    </div>
  {/if}

  {#if isAuthenticated && !loading && personaResult}
    <div>
      <h1 style="font-size: 2.5em; margin-bottom: 0;">Your Musical Persona</h1>
      <p style="color: #ccc; margin-top: 0.5rem; margin-bottom: 2rem;">Based on your Spotify listening history</p>

      <div class="card">
        <h2>{personaResult.character}</h2>
        
        <div class="attribute">
          <h3>Personality</h3>
          <p>{personaResult.personality}</p>
        </div>
        
        <div class="attribute">
          <h3>Destiny</h3>
          <p>{personaResult.destiny}</p>
        </div>
        
        <div class="attribute">
          <h3>Aesthetic</h3>
          <p>{personaResult.aesthetic}</p>
        </div>

        <div class="attribute">
          <h3>Top Genres</h3>
          <div class="tags">
            {#each personaResult.topGenres as genre}
              <span class="tag">{genre}</span>
            {/each}
          </div>
        </div>
        
        <div class="attribute">
          <h3>Vibe Check</h3>
          <p style="font-size: 1.1em; color: #bbb;">
            Your favorite artist right now is <strong>{personaResult.topArtistName}</strong> 
            and your top track is <strong>{personaResult.topTrackName}</strong>.
          </p>
        </div>
      </div>

      <button class="logout-btn" on:click={handleLogout}>Log Out</button>
    </div>
  {/if}

  {#if isAuthenticated && !loading && error}
    <div class="card">
      <h2 style="color: #ff4d4d;">Error</h2>
      <p>{error}</p>
      <button class="logout-btn" on:click={handleLogout}>Log Out & Try Again</button>
    </div>
  {/if}
</main>
