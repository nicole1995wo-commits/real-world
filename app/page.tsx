"use client";

import React, { useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: { title: "Real World. Real Compute.", desc: "Join the world's most powerful decentralized infrastructure.", label1: "IDENTITY", label2: "HARDWARE NODE", btn: "Initialize Node", placeholder: "Email for Genesis Access", tiers: ["Tier 1: High-End GPU", "Tier 2: Standard PC", "Tier 3: Edge Node"] },
  zh: { title: "真实世界，真实算力", desc: "加入全球最强大的去中心化基础设施，出租闲置硬件获取收益。", label1: "身份认证", label2: "硬件节点类型", btn: "初始化节点", placeholder: "输入邮箱获取创世访问权限", tiers: ["一级：高端显卡 (RTX 40/50)", "二级：标准计算 (CPU/笔记本)", "三级：边缘节点 (手机/带宽)"] },
  jp: { title: "現実世界。リアル計算。", desc: "世界最強の分散型インフラに参加して、収益を得ましょう。", label1: "身元", label2: "ハードウェアノード", btn: "ノードを初期化", placeholder: "アクセス用メールアドレス", tiers: ["ティア1：ハイエンドGPU", "ティア2：標準PC", "ティア3：エッジノード"] },
  kr: { title: "실제 세계. 실제 컴퓨팅.", desc: "세계에서 가장 강력한 분산형 인프라에 참여하십시오.", label1: "신원", label2: "하드웨어 노드", btn: "노드 초기화", placeholder: "이메일 주소", tiers: ["티어 1: 하이엔드 GPU", "티어 2: 표준 PC", "티어 3: 에지 노드"] },
  ru: { title: "Реальный мир. Реальные вычисления.", desc: "Присоединяйтесь к самой мощной в мире децентрализованной инфраструктуре.", label1: "ЛИЧНОСТЬ", label2: "УЗЕЛ ОБОРУДОВАНИЯ", btn: "Инициализировать узел", placeholder: "Электронная почта", tiers: ["Уровень 1: Мощный GPU", "Уровень 2: Стандартный ПК", "Уровень 3: Граничный узел"] }
};

export default function RealPowerGlobal() {
  const [lang, setLang] = useState('en');
  const [device, setDevice] = useState('GPU');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const userLang = navigator.language.split('-')[0];
    if (TRANSLATIONS[userLang]) setLang(userLang);
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleJoin = () => {
    setStatus('loading');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: '"Inter", sans-serif', padding: '20px' }}>
      {/* 顶部语言切换 */}
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '20px 0', fontSize: '0.7rem', color: '#444' }}>
        {Object.keys(TRANSLATIONS).map(l => (
          <span key={l} onClick={() => setLang(l)} style={{ cursor: 'pointer', color: lang === l ? '#fff' : '#444' }}>{l.toUpperCase()}</span>
        ))}
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4.5rem)', fontWeight: '800', textAlign: 'center', marginBottom: '20px', letterSpacing: '-0.05em', background: 'linear-gradient(to bottom, #fff 30%, #444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t.title}
        </h1>
        <p style={{ color: '#666', marginBottom: '60px', textAlign: 'center', maxWidth: '500px' }}>{t.desc}</p>

        <div style={{ width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '24px', border: '1px solid #1a1a1a', background: 'linear-gradient(145deg, #0a0a0a 0%, #000 100%)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', color: '#00ffaa' }}>✓ Node Initialized. Check your email.</div>
          ) : (
            <>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '0.65rem', color: '#444', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>{t.label1}</label>
                <input type="email" placeholder={t.placeholder} style={{ width: '100%', padding: '15px', backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px', color: '#fff', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '35px' }}>
                <label style={{ fontSize: '0.65rem', color: '#444', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>{t.label2}</label>
                <select value={device} onChange={(e) => setDevice(e.target.value)} style={{ width: '100%', padding: '15px', backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px', color: '#fff', appearance: 'none', cursor: 'pointer' }}>
                  <option value="GPU">{t.tiers[0]}</option>
                  <option value="PC">{t.tiers[1]}</option>
                  <option value="Mobile">{t.tiers[2]}</option>
                </select>
              </div>
              <button onClick={handleJoin} style={{ width: '100%', padding: '18px', backgroundColor: '#fff', color: '#000', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                {status === 'loading' ? 'Processing...' : t.btn}
              </button>
            </>
          )}
        </div>
      </main>

      <footer style={{ padding: '40px', fontSize: '0.6rem', color: '#222', letterSpacing: '2px' }}>
        REALPOWER PROTOCOL © 2026 GLOBAL INFRASTRUCTURE
      </footer>
    </div>
  );
}
