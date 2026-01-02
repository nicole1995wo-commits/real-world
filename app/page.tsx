"use client";

import React, { useState } from 'react';

export default function RealPowerElite() {
  const [device, setDevice] = useState('GPU');

  return (
    <div style={{
      backgroundColor: '#000',
      backgroundImage: 'radial-gradient(circle at 50% -20%, #1a1a1a, #000)',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '40px 20px',
    }}>
      {/* 顶部导航装饰 */}
      <nav style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', marginBottom: '80px', opacity: 0.8 }}>
        <div style={{ fontWeight: '900', letterSpacing: '2px' }}>REALPOWER</div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>DEPIN & AI PROTOCOL v1.0</div>
      </nav>

      {/* 核心宣传语 */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
          lineHeight: '1.1',
          fontWeight: '800', 
          marginBottom: '24px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #666666 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.04em'
        }}>
          Real World. <br/> Real Compute.
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#888', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Join the world's most powerful decentralized infrastructure. <br/>
          Rent your idle hardware to AI labs and earn institutional-grade rewards.
        </p>
      </div>

      {/* 玻璃拟态注册框 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '48px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', color: '#555', fontSize: '0.8rem', marginBottom: '8px', fontWeight: '600' }}>IDENTITY</label>
          <input type="email" placeholder="Email for Genesis Access" style={{
            width: '100%',
            padding: '16px',
            marginBottom: '24px',
            borderRadius: '12px',
            border: '1px solid #222',
            backgroundColor: '#0a0a0a',
            color: '#fff',
            fontSize: '1rem'
          }} />

          <label style={{ display: 'block', color: '#555', fontSize: '0.8rem', marginBottom: '8px', fontWeight: '600' }}>HARDWARE NODE</label>
          <select 
            value={device} 
            onChange={(e) => setDevice(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #222',
              backgroundColor: '#0a0a0a',
              color: '#fff',
              fontSize: '1rem',
              appearance: 'none',
              marginBottom: '32px'
          }}>
            <option value="GPU">Tier 1: High-End GPU (RTX 40/50 Series)</option>
            <option value="PC">Tier 2: Standard Compute (CPU/Laptop)</option>
            <option value="Mobile">Tier 3: Edge Node (Smartphone/Bandwidth)</option>
          </select>
        </div>

        <button style={{
          width: '100%',
          padding: '18px',
          borderRadius: '14px',
          border: 'none',
          backgroundColor: '#fff',
          color: '#000',
          fontWeight: '700',
          cursor: 'pointer',
          fontSize: '1.1rem',
          transition: 'all 0.2s',
          boxShadow: '0 0 20px rgba(255,255,255,0.2)'
        }}>
          Initialize Node
        </button>
      </div>

      {/* 底部数据流 - 极简高级感 */}
      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '80px',
        display: 'flex', 
        gap: '40px', 
        borderTop: '1px solid #111',
        width: '100%',
        maxWidth: '800px',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>1,248</div>
          <div style={{ color: '#444', fontSize: '0.7rem', letterSpacing: '1px' }}>ACTIVE NODES</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>82.4 PF</div>
          <div style={{ color: '#444', fontSize: '0.7rem', letterSpacing: '1px' }}>NETWORK POWER</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00ffaa', fontSize: '1.2rem', fontWeight: 'bold' }}>ONLINE</div>
          <div style={{ color: '#444', fontSize: '0.7rem', letterSpacing: '1px' }}>STATUS</div>
        </div>
      </div>
    </div>
  );
}
