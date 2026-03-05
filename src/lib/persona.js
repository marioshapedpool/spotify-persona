export function analyzePersona(data) {
  const { topArtists, topTracks, recentTracks } = data;

  const genres = topArtists.items.flatMap(artist => artist.genres);
  const genreCounts = genres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).map(g => g[0]);
  const primaryGenre = sortedGenres[0] || 'Unknown';

  let character = 'The Observer';
  let personality = 'You appreciate a wide variety of sounds but keep your true feelings hidden.';
  let destiny = 'You will soon discover a new passion that changes your trajectory.';
  let aesthetic = 'Neutral Minimalist';

  if (primaryGenre.includes('pop') || primaryGenre.includes('dance')) {
    character = 'The Luminary';
    personality = 'You thrive in social settings, bringing energy and light to those around you. Your vibrant spirit is infectious.';
    destiny = 'A grand celebration will soon place you in the center of attention where you belong.';
    aesthetic = 'Neon Glamour';
  } else if (primaryGenre.includes('rock') || primaryGenre.includes('metal')) {
    character = 'The Rebel';
    personality = 'You are fiercely independent, valuing authenticity over conformity. You find comfort in intensity.';
    destiny = 'An upcoming challenge will test your resolve, but you will break through the barriers.';
    aesthetic = 'Grunge Core';
  } else if (primaryGenre.includes('indie') || primaryGenre.includes('alternative')) {
    character = 'The Dreamer';
    personality = 'Introspective and creative, you see the world through a unique lens. You value emotional depth.';
    destiny = 'A quiet moment of reflection will lead to a breakthrough idea that defines your next chapter.';
    aesthetic = 'Vintage Ethereal';
  } else if (primaryGenre.includes('hip hop') || primaryGenre.includes('rap')) {
    character = 'The Hustler';
    personality = 'Driven, rhythm-focused, and confident. You know what you want and you speak your mind clearly.';
    destiny = 'Your persistence is about to pay off with a significant personal victory.';
    aesthetic = 'Urban Sleek';
  } else if (primaryGenre.includes('classical') || primaryGenre.includes('jazz')) {
    character = 'The Scholar';
    personality = 'You have refined tastes, appreciating structure, history, and complexity in life.';
    destiny = 'An unexpected mentor will guide you toward a deeper understanding of your craft.';
    aesthetic = 'Dark Academia';
  } else if (primaryGenre.includes('electronic') || primaryGenre.includes('techno')) {
    character = 'The Visionary';
    personality = 'Forward-thinking and analytical. You are captivated by the future and the possibilities of technology.';
    destiny = 'You will be at the forefront of a modern wave, connecting disparate groups of people.';
    aesthetic = 'Cyberpunk Future';
  }

  return {
    character,
    personality,
    destiny,
    aesthetic,
    topGenres: sortedGenres.slice(0, 5),
    topArtistName: topArtists.items[0]?.name || 'Unknown',
    topTrackName: topTracks.items[0]?.name || 'Unknown'
  };
}
