import React, { useState, useEffect } from 'react';
import '../../styles/universal.css';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'impactStories';

const ManageImpactStories = ({ embedded = false }) => {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState({ title: '', date: '', category: '', summary: '', details: '', imageUrl: '', videoUrl: '', emotionalQuote: '' });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setStories(stored);
  }, []);

  const saveToLocal = (arr) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    setStories(arr);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fileToDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageData = form.imageUrl;
    let videoData = form.videoUrl;
    try {
      if (imageFile) imageData = await fileToDataURL(imageFile);
      if (videoFile) videoData = await fileToDataURL(videoFile);
    } catch (err) {
      console.error('File read error', err);
      alert('Error reading files');
      return;
    }

    const newStory = {
      id: `admin-${Date.now()}`,
      title: form.title || 'Untitled Story',
      date: form.date || new Date().toISOString().slice(0,10),
      category: form.category || 'General',
      summary: form.summary || '',
      details: form.details || '',
      imageUrl: imageData || '',
      videoUrl: videoData || '',
      emotionalQuote: form.emotionalQuote || ''
    };

    const updated = [newStory, ...stories];
    saveToLocal(updated);
    setForm({ title: '', date: '', category: '', summary: '', details: '', imageUrl: '', videoUrl: '', emotionalQuote: '' });
    setImageFile(null);
    setVideoFile(null);
    alert('✅ Story saved to localStorage (admin demo)');
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this story?')) return;
    const updated = stories.filter(s => s.id !== id);
    saveToLocal(updated);
  };

  const handlePopulateSample = () => {
    // Quick helper to copy seeded stories into localStorage for simulation
    const sample = window.__initialImpactStories || [];
    if (sample.length === 0) {
      alert('No seeded stories available in window.__initialImpactStories');
      return;
    }
    const cloned = sample.map(s => ({ ...s, id: `admin-sample-${Date.now()}-${Math.random().toString(36).slice(2,8)}` }));
    const updated = [...cloned, ...stories];
    saveToLocal(updated);
    alert('✅ Sample stories copied to admin storage');
  };

  // Inner content can be embedded into Admin Dashboard
  const innerContent = (
    <section style={{ padding: '24px 2rem' }}>
      <h2>Admin — Manage Impact Stories</h2>
      <p style={{ marginBottom: '12px' }}>Create emotional, media-rich impact stories. For demo purposes stories are saved in localStorage.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: 900 }}>
        <input id="impact-title-input" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        <input name="date" type="date" value={form.date} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="summary" placeholder="Short summary" value={form.summary} onChange={handleChange} />
        <textarea name="details" placeholder="Full details" value={form.details} onChange={handleChange} rows={5} />
        <input name="imageUrl" placeholder="Image URL (or use file)" value={form.imageUrl} onChange={handleChange} />
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        <input name="videoUrl" placeholder="Video URL (mp4)" value={form.videoUrl} onChange={handleChange} />
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
        <input name="emotionalQuote" placeholder='Emotional quote (e.g. "Thank you...")' value={form.emotionalQuote} onChange={handleChange} />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn primary">Save Story</button>
          <button type="button" className="btn" onClick={handlePopulateSample}>Populate Sample</button>
          <button type="button" className="btn" onClick={() => { localStorage.removeItem(STORAGE_KEY); setStories([]); }}>Clear All</button>
        </div>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h3>Existing Admin Stories ({stories.length})</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {stories.map(s => (
          <div key={s.id} className="card" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{s.title}</strong>
              <div>
                <button className="btn" onClick={() => navigator.clipboard.writeText(JSON.stringify(s)).then(() => alert('Copied'))}>Copy</button>
                <button className="btn" onClick={() => handleDelete(s.id)}>Delete</button>
              </div>
            </div>
            <div style={{ marginTop: '8px', color: '#666' }}>{s.date} • {s.category}</div>
            {s.imageUrl && <img src={s.imageUrl} alt={s.title} style={{ width: 200, height: 120, objectFit: 'cover', marginTop: 8 }} />}
          </div>
        ))}
      </div>
    </section>
  );

  if (embedded) {
    return innerContent;
  }

  return (
    <div className="main-container" style={{ paddingTop: '70px' }}>
      <header>
        <nav className="navbar">
          <div className="logo">🌍 Social<span>Impact</span></div>
          <ul className="nav-links">
            <li><a href="#" onClick={() => navigate(-1)}>Back</a></li>
            <li><a href="#" onClick={() => navigate('/admin')}>Admin Home</a></li>
            <li><a href="#" onClick={() => navigate('/impact-stories')}>View Live Page</a></li>
          </ul>
        </nav>
      </header>

      {innerContent}
    </div>
  );
};

export default ManageImpactStories;
