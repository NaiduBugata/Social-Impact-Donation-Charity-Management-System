import React, { useState } from 'react';

export default function ProofUpload({ requestId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select a file');
    setLoading(true);
    // In mock: just call /api/requests (simulate adding proof)
    try {
      const body = { requestId, proofDocs: [{ name: file.name, uploadedAt: new Date().toISOString() }] };
      const res = await fetch('/api/requests', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        alert('Mock: proof uploaded');
        onUploaded && onUploaded(data.data);
      } else alert('Upload failed');
    } catch (err) { console.error(err); alert('Upload error'); }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{padding:8}}>
      <label>Upload proof (photo/pdf)</label>
      <input type="file" onChange={(e)=> setFile(e.target.files[0])} />
      <div style={{marginTop:8}}>
        <button type="submit" disabled={loading} style={{padding:'6px 10px'}}>{loading? 'Uploading...' : 'Upload Proof'}</button>
      </div>
    </form>
  );
}
