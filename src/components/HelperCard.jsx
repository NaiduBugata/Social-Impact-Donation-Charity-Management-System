import React from 'react';

export default function HelperCard({ helper, onAccept }) {
  if (!helper) return null;
  return (
    <div className="helper-card" style={{border:'1px solid #e5e7eb', padding: '12px', borderRadius:8, marginBottom:8}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h4 style={{margin:0}}>{helper.name} <small style={{color:'#6b7280'}}>({helper.profession})</small></h4>
          <div style={{fontSize:12, color:'#6b7280'}}>
            Trust: {(helper.trustScore ?? helper.trust) || 50}
          </div>
        </div>
        <div>
          <button className="btn" onClick={() => onAccept && onAccept(helper)} style={{background:'#0ea5e9', color:'#fff', border:'none', padding:'6px 10px', borderRadius:6}}>Request Help</button>
        </div>
      </div>
    </div>
  );
}
