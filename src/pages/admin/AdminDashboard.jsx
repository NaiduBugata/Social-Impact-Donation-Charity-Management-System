import React, { useEffect, useState } from 'react';
import SanctionForm from '../../components/SanctionForm';

export default function AdminDashboard(){
  const [requests, setRequests] = useState([]);

  useEffect(()=>{ (async ()=>{
    try{ const res = await fetch('/api/requests'); const d = await res.json(); if(d.success) setRequests(d.data||[]); }catch(e){console.error(e);} })(); },[]);

  return (
    <div style={{padding:16}}>
      <h2>Admin Dashboard (Mock)</h2>
      <p>Approve requests and sanction funds (mock).</p>

      <div style={{marginTop:12}}>
        <h3>Pending Requests</h3>
        {requests.length===0 && <div>No requests</div>}
        {requests.map(r => (
          <div key={r.id} style={{border:'1px solid #e5e7eb', padding:12, borderRadius:8, marginBottom:8}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div>
                <strong>{r.title}</strong>
                <div style={{fontSize:12,color:'#6b7280'}}>{r.description}</div>
              </div>
              <div>
                <SanctionForm requestId={r.id} onSanctioned={(data)=>alert('Sanctioned: '+JSON.stringify(data))} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
