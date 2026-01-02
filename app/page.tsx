"use client";

import React, { useState } from 'react';

export default function RealPowerLanding() {
  const [device, setDevice] = useState('GPU');

  return (
    <div style={{
      backgroundColor: '#050505',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      {/* 品牌头部 */}
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px', background: 'linear-gradient(to right, #ffffff, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        REALPOWER
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px', marginBottom: '40px' }}>
        The global decentralized AI & Bandwidth network. <br/>
        Turn your Hardware into Real Cash.
      </p>

      {/* 招募核心区域 */}
      <div style={{
        backgroundColor: '#111',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid #333',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 0 50px rgba(255,255,255,0.05)'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Join Genesis Node</h2>
        
        <input type="email" placeholder="Email Address" style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          border: '1px solid #333',
          backgroundColor: '#000',
          color: '#fff',
          outline: 'none'
        }} />

        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>Select Your Device Type:</p>
          <select 
            value={device} 
            onChange={(e) => setDevice(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #333',
              backgroundColor: '#000',
              color: '#fff'
          }}>
            <option value="GPU">High-End GPU (RTX 30/40/50 Series)</option>
            <option value="PC">Standard PC (CPU / Laptop)</option>
            <option value="Mobile">Smartphone (Android / iOS)</option>
          </select>
        </div>

        <button style={{
          width: '100%',
          padding: '15px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#fff',
          color: '#000',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          Register & Start Earning
        </button>
      </div>

      {/* 实时状态统计 */}
      <div style={{ marginTop: '50px', display: 'flex', gap: '30px', color: '#555', fontSize: '0.8rem' }}>
        <div>GLOBAL NODES: <span style={{color: '#fff'}}>1,248</span></div>
        <div>TOTAL HASHRATE: <span style={{color: '#fff'}}>82.4 PFLOPS</span></div>
        <div>PAYOUTS: <span style={{color: '#fff'}}>$0.00</span></div>
      </div>
    </div>
  );
}
