import React, { useState } from 'react';

export default function SanctionForm({ requestId, onSanctioned }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!amount) return alert('Enter amount');
    setLoading(true);
    try {
      const body = { requestId, amount: Number(amount), adminId: 1 };
      const res = await fetch('/api/sanction', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        alert('Mock: sanction completed');
        onSanctioned && onSanctioned(data.data);
      } else alert('Sanction failed');
    } catch (err) { console.error(err); alert('Error'); }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{padding:8}}>
      <label>Sanction Amount</label>
      <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount in INR" />
      <div style={{marginTop:8}}>
        <button type="submit" disabled={loading} style={{padding:'6px 10px'}}>{loading? 'Processing...' : 'Sanction'}</button>
      </div>
    </form>
  );
}
