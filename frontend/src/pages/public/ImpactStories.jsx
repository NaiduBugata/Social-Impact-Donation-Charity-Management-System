import React, { useEffect, useState } from 'react';
import '../../styles/universal.css';
import { Link } from 'react-router-dom';

const ImpactStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await fetch('/api/impact-stories');
      const data = await response.json();
      if (data.success) {
        setStories(data.data);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em' }}>🔄</div>
          <p>Loading impact stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <header>
        <nav className="navbar">
          <div className="logo">🌍 Social<span>Impact</span></div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/transparency">Transparency</Link></li>
            <li><Link to="/impact-stories" className="btn primary">Impact Stories</Link></li>
            <li><Link to="/Role" className="btn">Login</Link></li>
          </ul>
        </nav>
      </header>

      <section className="impact-hero">
        <div className="impact-hero-inner">
          <h1>📚 Impact Stories</h1>
          <p className="muted">Emotional journeys from donors, helpers, NGOs and the people whose lives were changed.</p>
          <div className="impact-stats">
            <div><strong>{stories.length}</strong><span> stories</span></div>
          </div>
        </div>
      </section>

      <main className="impact-layout">
        <aside className="impact-index">
          <nav>
            <ul>
              {stories.map((s, i) => (
                <li key={s._id || s.id}><a href={`#${s._id || s.id}`}> {i+1}. {s.title}</a></li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="impact-content">
          {stories.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '3em' }}>📝</p>
              <h3>No impact stories yet</h3>
              <p>Stories will appear here once they are published.</p>
            </div>
          )}
          {stories.map((story, idx) => (
            <section id={story._id || story.id} key={story._id || story.id} className="impact-section">
              {story.imageUrl && (
                <div className="impact-media" style={{ backgroundImage: `url(${story.imageUrl})` }} aria-hidden="true"></div>
              )}

              <div className="impact-body">
                <div className="impact-meta">{story.date} • {story.category}</div>
                <h2 className="impact-title">{story.title}</h2>
                {story.emotionalQuote && <div className="impact-quote">{story.emotionalQuote}</div>}
                <p className="impact-summary">{story.summary}</p>

                {story.videoUrl && (
                  <div className="impact-video">
                    <video controls style={{ width: '100%' }}>
                      <source src={story.videoUrl} type="video/mp4" />
                    </video>
                  </div>
                )}

                <div className="impact-details">{story.details}</div>
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="impact-footer">
        <div>
          <strong>Social Impact</strong> — Transparency & accountability in charity.
        </div>
        <div>
          <Link to="/transparency">View Transparency</Link>
        </div>
      </footer>
    </div>
  );
};

export default ImpactStories;
