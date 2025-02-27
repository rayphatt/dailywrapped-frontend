import React, { useState, useEffect } from 'react';
import './App.css';
import UserRegistration from './components/UserRegistration';

const TIME_RANGES = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'short_term', label: 'This Month' },
  { id: 'medium_term', label: 'Last 6 Months' },
  { id: 'long_term', label: 'All Time' }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [currentView, setCurrentView] = useState('monthly');
  const [monthlyTracks, setMonthlyTracks] = useState([]);
  const [monthlyArtists, setMonthlyArtists] = useState([]);
  const [statsTopTracks, setStatsTopTracks] = useState([]);
  const [statsTopArtists, setStatsTopArtists] = useState([]);
  const [timeRange, setTimeRange] = useState('short_term');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    
    if (token) {
      setAccessToken(token);
      setIsLoggedIn(true);
      window.history.pushState({}, null, '/');
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('dailyWrapped_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setIsRegistered(true);
    }
  }, []);

  const fetchMonthlyData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const [tracksResponse, artistsResponse] = await Promise.all([
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/top-tracks?access_token=${accessToken}&time_range=short_term`),
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/top-artists?access_token=${accessToken}&time_range=short_term`)
          ]);

      if (!tracksResponse.ok || !artistsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const tracksData = await tracksResponse.json();
      const artistsData = await artistsResponse.json();

      setMonthlyTracks(tracksData.items.slice(0, 5));
      setMonthlyArtists(artistsData.items.slice(0, 5));
    } catch (err) {
      setError('Error fetching monthly data');
      console.error('Error:', err);
    }
    setIsLoading(false);
  };

  const fetchStatsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const [tracksResponse, artistsResponse] = await Promise.all([
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/top-tracks?access_token=${accessToken}&time_range=${timeRange}`),
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/top-artists?access_token=${accessToken}&time_range=${timeRange}`)
          ]);

      if (!tracksResponse.ok || !artistsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const tracksData = await tracksResponse.json();
      const artistsData = await artistsResponse.json();

      setStatsTopTracks(tracksData.items);
      setStatsTopArtists(artistsData.items);
    } catch (err) {
      setError('Error fetching stats data');
      console.error('Error:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (accessToken && currentView === 'monthly') {
      fetchMonthlyData();
    }
  }, [accessToken, currentView]);

  useEffect(() => {
    if (accessToken && currentView === 'stats') {
      fetchStatsData();
    }
  }, [accessToken, currentView, timeRange]);

  const handleLogin = () => {
    console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/login`;
  };

  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <div className="login-container">
          {!isRegistered ? (
            <>
              {showRegistration ? (
                <UserRegistration onComplete={() => setIsRegistered(true)} />
              ) : (
                <button onClick={() => setShowRegistration(true)} className="login-button">
                  Get My Monthly Wrapped
                </button>
              )}
            </>
          ) : (
            <button onClick={handleLogin} className="login-button">
              Connect with Spotify
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'monthly') {
    return (
      <div className="app-container">
        <div className="monthly-wrap-container">
          <div className="site-logo">DailyWrapped.com</div>
          <h1 className="time-frame-title">Monthly Wrapped</h1>
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              <div className="monthly-stats">
                <div className="top-section">
                  <div className="top-artists">
                    <h3>Top Artists</h3>
                    {monthlyArtists.map((artist, index) => (
                      <div key={artist.id} className="list-item">
                        <span className="number">{index + 1}</span>
                        {artist.images[0] && (
                          <img
                            src={artist.images[0].url}
                            alt={artist.name}
                            className="song-image"
                          />
                        )}
                        <span className="name">{artist.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="top-songs">
                    <h3>Top Songs</h3>
                    {monthlyTracks.map((track, index) => (
                      <div key={track.id} className="list-item">
                        <span className="number">{index + 1}</span>
                        {track.album.images[0] && (
                          <img
                            src={track.album.images[0].url}
                            alt={track.name}
                            className="song-image"
                          />
                        )}
                        <span className="name">{track.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('stats')}
                className="stats-button"
              >
                Get My Spotify Stats
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="stats-container">
        <button className="back-button" onClick={() => setCurrentView('monthly')}>
          Back to Monthly Wrapped
        </button>
        <div className="time-range-buttons">
          {TIME_RANGES.map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`range-button ${timeRange === range.id ? 'active' : ''}`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="monthly-stats">
            <div className="top-section">
              <div className="top-artists">
                <h3>Top Artists</h3>
                {statsTopArtists.map((artist, index) => (
                  <div key={artist.id} className="list-item">
                    <span className="number">{index + 1}</span>
                    <img 
                      src={artist.images[0]?.url} 
                      alt={artist.name} 
                      className="song-image"
                    />
                    <div className="name">{artist.name}</div>
                  </div>
                ))}
              </div>

              <div className="top-songs">
                <h3>Top Songs</h3>
                {statsTopTracks.map((track, index) => (
                  <div key={track.id} className="list-item">
                    <span className="number">{index + 1}</span>
                    <img
                      src={track.album.images[0]?.url}
                      alt={track.name}
                      className="song-image"
                    />
                    <div className="track-info">
                      <div className="name">{track.name}</div>
                      <div className="track-artist">
                        {track.artists.map(artist => artist.name).join(', ')}
                      </div>
                      {(timeRange === 'day' || timeRange === 'week') && (
                        <div className="play-count">{track.play_count || 0} plays</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;