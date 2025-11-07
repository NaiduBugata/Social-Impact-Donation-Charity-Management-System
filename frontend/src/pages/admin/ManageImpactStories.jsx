import React, { useState, useEffect } from 'react';
import '../../styles/universal.css';
import { useNavigate } from 'react-router-dom';

const ManageImpactStories = ({ embedded = false }) => {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState({ title: '', date: '', category: '', summary: '', details: '', imageUrl: '', videoUrl: '', emotionalQuote: '' });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await fetch('/api/impact-stories/admin');
      const data = await response.json();
      if (data.success) {
        setStories(data.data);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      alert('Error loading impact stories');
    }
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
    setLoading(true);
    
    let imageData = form.imageUrl;
    let videoData = form.videoUrl;
    
    try {
      if (imageFile) imageData = await fileToDataURL(imageFile);
      if (videoFile) videoData = await fileToDataURL(videoFile);
    } catch (err) {
      console.error('File read error', err);
      alert('Error reading files');
      setLoading(false);
      return;
    }

    const storyData = {
      title: form.title || 'Untitled Story',
      date: form.date || new Date().toISOString().slice(0,10),
      category: form.category || 'General',
      summary: form.summary || '',
      details: form.details || '',
      imageUrl: imageData || '',
      videoUrl: videoData || '',
      emotionalQuote: form.emotionalQuote || '',
      status: 'published'
    };

    try {
      const url = editingId ? `/api/impact-stories/${editingId}` : '/api/impact-stories';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingId ? '✅ Story updated successfully!' : '✅ Story created successfully!');
        setForm({ title: '', date: '', category: '', summary: '', details: '', imageUrl: '', videoUrl: '', emotionalQuote: '' });
        setImageFile(null);
        setVideoFile(null);
        setEditingId(null);
        await loadStories();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Error saving story');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (story) => {
    setForm({
      title: story.title,
      date: story.date ? new Date(story.date).toISOString().slice(0,10) : '',
      category: story.category,
      summary: story.summary,
      details: story.details,
      imageUrl: story.imageUrl,
      videoUrl: story.videoUrl,
      emotionalQuote: story.emotionalQuote || ''
    });
    setEditingId(story._id || story.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm({ title: '', date: '', category: '', summary: '', details: '', imageUrl: '', videoUrl: '', emotionalQuote: '' });
    setEditingId(null);
    setImageFile(null);
    setVideoFile(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this story? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/impact-stories/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Story deleted successfully!');
        await loadStories();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Error deleting story');
    }
  };

  // Inner content can be embedded into Admin Dashboard
  const innerContent = (
    <section style={{ padding: '24px 2rem' }}>
      <h2>Admin — Manage Impact Stories</h2>
      <p style={{ marginBottom: '12px' }}>Create emotional, media-rich impact stories. Stories are saved in the database.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: 900 }}>
        {editingId && (
          <div style={{ padding: '12px', backgroundColor: '#fff3cd', borderRadius: '8px', marginBottom: '10px' }}>
            <strong>✏️ Editing Story</strong>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel Edit
            </button>
          </div>
        )}
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
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Saving...' : (editingId ? 'Update Story' : 'Create Story')}
          </button>
          {editingId && (
            <button type="button" className="btn" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h3>Existing Stories ({stories.length})</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {stories.map(s => (
          <div key={s._id || s.id} className="card" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <strong>{s.title}</strong>
                <div style={{ marginTop: '8px', color: '#666', fontSize: '0.9em' }}>
                  {new Date(s.date).toLocaleDateString()} • {s.category}
                  {s.status && <span style={{ marginLeft: '8px', padding: '2px 8px', backgroundColor: s.status === 'published' ? '#d4edda' : '#fff3cd', borderRadius: '4px', fontSize: '0.85em' }}>{s.status}</span>}
                </div>
                {s.summary && <p style={{ marginTop: '8px', color: '#555' }}>{s.summary}</p>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" onClick={() => handleEdit(s)}>✏️ Edit</button>
                <button className="btn" onClick={() => handleDelete(s._id || s.id)} style={{ backgroundColor: '#dc3545', color: 'white' }}>🗑️ Delete</button>
              </div>
            </div>
            {s.imageUrl && <img src={s.imageUrl} alt={s.title} style={{ width: 200, height: 120, objectFit: 'cover', marginTop: 8, borderRadius: '8px' }} />}
          </div>
        ))}
        {stories.length === 0 && (
          <p style={{ color: '#999', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
            No stories yet. Create your first impact story above!
          </p>
        )}
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
