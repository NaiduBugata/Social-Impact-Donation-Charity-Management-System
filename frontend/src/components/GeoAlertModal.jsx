import React from 'react';

export default function GeoAlertModal({ open, onClose, details }) {
  if (!open) return null;
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#fff', padding:16, borderRadius:8, width:520, maxWidth:'95%'}}>
        <h3>Nearby Alert</h3>
        <p>{details?.message || 'A verified request was raised in your area.'}</p>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <button onClick={onClose}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}
