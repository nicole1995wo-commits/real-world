"use client";

import React, { useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: { title: "Real World. Real Compute.", desc: "Join the world's most powerful decentralized infrastructure.", label1: "IDENTITY", label2: "HARDWARE NODE", btn: "Initialize Node", placeholder: "Email for Genesis Access", tiers: ["Tier 1: High-End GPU", "Tier 2: Standard PC", "Tier 3: Edge Node"] },
  zh: { title: "真实世界，真实算力", desc: "加入全球最强大的去中心化基础设施，出租闲置硬件获取收益。", label1: "身份认证", label2: "硬件节点类型", btn: "初始化节点", placeholder: "输入邮箱获取创世访问权限", tiers: ["一级：高端显卡 (RTX 40/50)", "二级：标准计算 (CPU/笔记本)", "三级：边缘节点 (手机/带宽)"] },
};

export default function RealPowerElite() {
  const [lang, setLang] = useState('en');
  const [device, setDevice] = useState('GPU');
  const [status, setStatus] = useState('idle');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <nav style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', padding: '40px 20px' }}>
        <div style={{ fontWeight: 'bold', letterSpacing: '2px' }}>REALPOWER</div>
        <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
          <span onClick={() => setLang('en')} style={{ cursor: 'pointer', opacity: lang === 'en' ? 1 : 0.4 }}>EN</span>
          <span onClick={() => setLang('zh')} style={{ cursor: 'pointer', opacity: lang === 'zh' ? 1 : 0.4 }}>中文</span>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: '800', textAlign: 'center', marginBottom: '20px', background: 'linear-gradient(to bottom, #fff, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.title}</h1>
        <p style={{ color: '#888', marginBottom: '60px', textAlign: 'center', maxWidth: '600px' }}>{t.desc}</p>

        <div style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '32px', border: '1px solid #222', background: '#050505', boxShadow: '0 50px 100px rgba(0,0,0,0.9)' }}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '0.7rem', color: '#444', display: 'block', marginBottom: '10px' }}>{t.label1}</label>
            <input type="email" placeholder={t.placeholder} style={{ width: '100%', padding: '15px', backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px', color: '#fff' }} />
          </div>
          <div style={{ marginBottom: '35px' }}>
            <label style={{ fontSize: '0.7rem', color: '#444', display: 'block', marginBottom: '10px' }}>{t.label2}</label>
            <select value={device} onChange={(e) => setDevice(e.target.value)} style={{ width: '100%', padding: '15px', backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px', color: '#fff' }}>
              <option value="GPU">{t.tiers[0]}</option>
              <option value="PC">{t.tiers[1]}</option>
              <option value="Mobile">{t.tiers[2]}</option>
            </select>
          </div>
          <button style={{ width: '100%', padding: '18px', backgroundColor: '#fff', color: '#000', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>{t.btn}</button>
        </div>
      </main>
      <footer style={{ padding: '40px', fontSize: '0.7rem', color: '#222' }}>REALPOWER PROTOCOL © 2026</footer>
    </div>
  );
}
