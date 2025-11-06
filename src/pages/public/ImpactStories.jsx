import React, { useEffect, useMemo } from 'react';
import impactStories from '../../data/impactStories';
import '../../styles/universal.css';
import { Link } from 'react-router-dom';

const ImpactStories = () => {
  useEffect(() => {
    // Expose initial seeded stories so admin can populate samples
    window.__initialImpactStories = impactStories || [];
  }, []);

  // Merge stored admin stories (localStorage) with seeded ones (seeded last)
  const allStories = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('impactStories') || '[]');
      return [...stored, ...impactStories];
    } catch (err) {
      return [...impactStories];
    }
  }, []);

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
            <div><strong>{allStories.length}</strong><span> stories</span></div>
          </div>
        </div>
      </section>

      <main className="impact-layout">
        <aside className="impact-index">
          <nav>
            <ul>
              {allStories.map((s, i) => (
                <li key={s.id}><a href={`#{s.id}`}> {i+1}. {s.title}</a></li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="impact-content">
          {allStories.map((story, idx) => (
            <section id={story.id} key={story.id} className="impact-section">
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
