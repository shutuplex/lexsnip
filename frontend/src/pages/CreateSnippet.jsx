import React, { useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-void:        #03050a;
    --bg-glass:       rgba(255,255,255,0.03);
    --bg-glass-hover: rgba(255,255,255,0.055);
    --bg-active:      rgba(99,179,255,0.08);
    --border:         rgba(255,255,255,0.06);
    --border-bright:  rgba(99,179,255,0.28);
    --accent-blue:    #63b3ff;
    --accent-cyan:    #22d3ee;
    --accent-green:   #39ff14;
    --text-primary:   #e2e8f0;
    --text-dim:       #64748b;
    --text-muted:     #334155;
    --glow-blue:      0 0 20px rgba(99,179,255,0.25);
    --glow-green:     0 0 16px rgba(57,255,20,0.35);
    --radius-sm:      6px;
    --radius-md:      10px;
    --radius-lg:      16px;
  }

  html, body, #root { height: 100%; width: 100%; overflow: hidden; background: var(--bg-void); }

  /* custom scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(99,179,255,0.2); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(99,179,255,0.45); }

  /* token coloring that works with prism-tomorrow */
  .token.keyword   { color: #63b3ff !important; }
  .token.string    { color: #86efac !important; }
  .token.number    { color: #f9a8d4 !important; }
  .token.comment   { color: #475569 !important; font-style: italic; }
  .token.function  { color: #22d3ee !important; }
  .token.operator  { color: #a78bfa !important; }
  .token.class-name{ color: #fbbf24 !important; }

  /* noise texture overlay */
  .noise-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  .glass {
    background: var(--bg-glass);
    backdrop-filter: blur(16px) saturate(150%);
    -webkit-backdrop-filter: blur(16px) saturate(150%);
    border: 1px solid var(--border);
  }

  /* animated gradient orbs in bg */
  .orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.07;
    pointer-events: none;
    animation: drift 18s ease-in-out infinite alternate;
  }
  .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #1e40af, transparent); top: -200px; left: -200px; animation-duration: 20s; }
  .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #0e7490, transparent); bottom: -150px; right: -100px; animation-duration: 16s; animation-delay: -5s; }
  .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #166534, transparent); top: 40%; left: 40%; animation-duration: 24s; animation-delay: -10s; }

  @keyframes drift {
    0%   { transform: translate(0,0) scale(1); }
    50%  { transform: translate(30px, 20px) scale(1.08); }
    100% { transform: translate(-20px, 40px) scale(0.95); }
  }

  /* file tab active glow */
  .file-active {
    background: var(--bg-active) !important;
    border-color: var(--border-bright) !important;
    box-shadow: inset 2px 0 0 var(--accent-blue), var(--glow-blue);
  }

  .btn-share {
    background: linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%);
    border: 1px solid rgba(99,179,255,0.3);
    box-shadow: 0 0 14px rgba(14,116,144,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
    transition: all 0.2s ease;
  }
  .btn-share:hover:not(:disabled) {
    box-shadow: 0 0 22px rgba(14,116,144,0.55), inset 0 1px 0 rgba(255,255,255,0.12);
    transform: translateY(-1px);
  }
  .btn-share:disabled { opacity: 0.5; cursor: not-allowed; }

  .logo-text {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    letter-spacing: 0.12em;
    background: linear-gradient(120deg, var(--accent-green) 0%, var(--accent-cyan) 60%, var(--accent-blue) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 8px rgba(57,255,20,0.4));
  }

  .lang-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    padding: 2px 8px;
    border-radius: 99px;
    background: rgba(99,179,255,0.1);
    border: 1px solid rgba(99,179,255,0.2);
    color: var(--accent-blue);
  }

  .line-fade-in {
    animation: lineFade 0.15s ease;
  }
  @keyframes lineFade {
    from { opacity: 0.4; } to { opacity: 1; }
  }

  select option { background: #0f172a; }

  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent-green);
    box-shadow: var(--glow-green);
    animation: pulse 2.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
    color: var(--text-dim);
    transition: all 0.15s ease;
    cursor: pointer;
    background: none;
  }
  .icon-btn:hover {
    background: var(--bg-glass-hover);
    border-color: var(--border);
    color: var(--text-primary);
  }

  .file-row {
    position: relative;
    display: flex; align-items: center;
    padding: 7px 12px;
    cursor: pointer;
    border-left: 2px solid transparent;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    margin: 1px 6px 1px 0;
    transition: all 0.15s ease;
    gap: 8px;
  }
  .file-row:hover:not(.file-active) { background: var(--bg-glass-hover); }

  .file-actions { opacity: 0; transition: opacity 0.15s; }
  .file-row:hover .file-actions { opacity: 1; }

  .editor-wrap textarea { color: transparent !important; caret-color: var(--accent-cyan) !important; }
  .editor-wrap pre { color: var(--text-primary) !important; }

  .section-label {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  .link-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 10px;
    border-radius: 99px;
    background: rgba(57,255,20,0.08);
    border: 1px solid rgba(57,255,20,0.25);
    color: var(--accent-green);
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    text-decoration: none;
    transition: all 0.2s;
  }
  .link-pill:hover { background: rgba(57,255,20,0.15); box-shadow: var(--glow-green); }
`;

const langToExt = { python:'py', javascript:'js', java:'java', cpp:'cpp', html:'html', css:'css' };
const extToLang  = { py:'python', js:'javascript', java:'java', cpp:'cpp', html:'html', css:'css' };

/* ─── SVG Language Logos ─── */
const LangSVGs = {
  python: (
    <svg viewBox="0 0 32 32" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.885 2.1c-7.1 0-6.651 3.07-6.651 3.07v3.19h6.752v.96H6.545S2 8.8 2 16.005s4.013 6.93 4.013 6.93H8.33v-3.335s-.13-4.013 3.95-4.013h6.812s3.818.062 3.818-3.693V5.768S23.393 2.1 15.885 2.1zm-3.772 2.17a1.233 1.233 0 1 1 0 2.466 1.233 1.233 0 0 1 0-2.466z" fill="#4B8BBE"/>
      <path d="M16.115 29.9c7.1 0 6.651-3.07 6.651-3.07v-3.19h-6.752v-.96h9.441S30 23.2 30 15.995s-4.013-6.93-4.013-6.93H23.67v3.335s.13 4.013-3.95 4.013h-6.812S9.09 16.35 9.09 20.105v6.126S8.607 29.9 16.115 29.9zm3.772-2.17a1.233 1.233 0 1 1 0-2.466 1.233 1.233 0 0 1 0 2.466z" fill="#FFD43B"/>
    </svg>
  ),
  javascript: (
    <svg viewBox="0 0 32 32" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="3" fill="#F7DF1E"/>
      <path d="M9.564 26.198l2.637-1.596c.508.9 .972 1.662 2.085 1.662 1.065 0 1.737-.416 1.737-2.037V14.716h3.24v9.56c0 3.355-1.967 4.88-4.837 4.88-2.59 0-4.097-1.342-4.862-2.958zM20.24 25.83l2.637-1.528c.694 1.13 1.596 1.964 3.19 1.964 1.34 0 2.198-.67 2.198-1.596 0-1.11-.88-1.502-2.358-2.15l-.81-.347c-2.336-1-3.888-2.242-3.888-4.88 0-2.428 1.848-4.28 4.742-4.28 2.058 0 3.54.716 4.602 2.59l-2.52 1.617c-.556-.994-1.154-1.385-2.082-1.385-.947 0-1.548.6-1.548 1.385 0 .97.6 1.362 1.987 1.965l.81.347c2.752 1.18 4.305 2.382 4.305 5.08 0 2.913-2.29 4.51-5.366 4.51-3.006 0-4.95-1.432-5.9-3.292z" fill="#323330"/>
    </svg>
  ),
  java: (
    <svg viewBox="0 0 32 32" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.854 23.05s-1.27.74.904.99c2.633.3 3.979.257 6.878-.29 0 0 .763.478 1.827.893-6.496 2.785-14.7-.162-9.61-1.593z" fill="#5382A1"/>
      <path d="M11.1 19.876s-1.424 1.054.75 1.28c2.812.29 5.036.313 8.88-.424 0 0 .532.54 1.37.834-7.867 2.3-16.624.18-11-1.69z" fill="#5382A1"/>
      <path d="M17.522 13.955c1.602 1.842-.421 3.5-.421 3.5s4.065-2.097 2.199-4.724c-1.741-2.452-3.077-3.672 4.148-7.874 0 0-11.336 2.83-5.926 9.098z" fill="#E76F00"/>
      <path d="M25.63 25.556s.94.774-1.034 1.372c-3.752 1.137-15.617 1.48-18.91.045-1.184-.515 1.036-1.23 1.733-1.38.727-.16 1.143-.13 1.143-.13-1.316-.928-8.506 1.82-3.652 2.606 13.25 2.15 24.154-.968 20.72-2.513z" fill="#5382A1"/>
      <path d="M12.43 16.59s-6.033 1.433-2.136 1.954c1.645.224 4.923.174 7.98-.09 2.497-.218 5.005-.683 5.005-.683s-.88.377-1.516.812c-6.118 1.61-17.938.86-14.537-.786 2.87-1.4 5.204-1.207 5.204-1.207z" fill="#5382A1"/>
      <path d="M22.615 21.675c6.222-3.232 3.344-6.34 1.337-5.922-.493.103-.713.192-.713.192s.183-.287.532-.41c3.975-1.397 7.03 4.12-1.283 6.306 0 0 .097-.086.127-.166z" fill="#E76F00"/>
      <path d="M19.23 2s3.447 3.45-3.27 8.754c-5.385 4.25-1.228 6.673-.002 9.437-3.14-2.833-5.445-5.328-3.898-7.648 2.27-3.408 8.554-5.062 7.17-10.543z" fill="#E76F00"/>
      <path d="M13.072 29.23c5.975.383 15.153-.213 15.37-3.04 0 0-.418 1.072-4.94 1.922-5.13.96-11.454.848-15.2.232 0 0 .768.636 4.77.886z" fill="#5382A1"/>
    </svg>
  ),
  cpp: (
    <svg viewBox="0 0 32 32" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2L3 9v14l13 7 13-7V9L16 2z" fill="#004482"/>
      <path d="M16 2L3 9v14l13 7V2z" fill="#005A9C"/>
      <path d="M16 7.5C11.3 7.5 7.5 11.3 7.5 16S11.3 24.5 16 24.5c2.7 0 5.1-1.3 6.6-3.3l-3.2-1.9c-.8 1-2 1.7-3.4 1.7-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5c1.4 0 2.6.6 3.4 1.7l3.2-1.9C21.1 8.8 18.7 7.5 16 7.5z" fill="white"/>
      <path d="M22 14h-1.5v-1.5h-1V14H18v1h1.5v1.5h1V15H22v-1zM26.5 14H25v-1.5h-1V14h-1.5v1H24v1.5h1V15h1.5v-1z" fill="white"/>
    </svg>
  ),
  html: (
    <svg viewBox="0 0 32 32" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3l1.765 19.854L16 25.5l9.235-2.646L27 3H5z" fill="#E44D26"/>
      <path d="M16 23.982V5.05H25.5l-1.556 17.472L16 23.982z" fill="#F16529"/>
      <path d="M9.788 9.75l.252 2.818H16v-2.818H9.788zm6.212 7.5H12.75l.19 2.147 3.06.827V17.25zm-.01-4.69H16v-2.818H9.788l.252 2.818H15.99z" fill="#EBEBEB"/>
      <path d="M16 12.568h3.466l-.326 3.654L16 17.25v2.74l5.626-1.558.085-.934.826-9.248H16v2.818z" fill="white"/>
    </svg>
  ),
  css: (
    <svg viewBox="0 0 32 32" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3l1.765 19.854L16 25.5l9.235-2.646L27 3H5z" fill="#1572B6"/>
      <path d="M16 23.982V5.05H25.5l-1.556 17.472L16 23.982z" fill="#33A9DC"/>
      <path d="M9.788 9.75l.252 2.818H16v-2.818H9.788zm6.212 7.5H12.75l.19 2.147 3.06.827V17.25zm-.01-4.69H16v-2.818H9.788l.252 2.818H15.99z" fill="#EBEBEB"/>
      <path d="M16 12.568h3.466l-.326 3.654L16 17.25v2.74l5.626-1.558.085-.934.826-9.248H16v2.818z" fill="white"/>
    </svg>
  ),
  txt: (
    <svg viewBox="0 0 32 32" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="24" height="28" rx="3" fill="#334155" stroke="#475569" strokeWidth="1"/>
      <line x1="9" y1="10" x2="23" y2="10" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9" y1="14" x2="23" y2="14" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9" y1="18" x2="18" y2="18" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const extToLangMap = { py: 'python', js: 'javascript', java: 'java', cpp: 'cpp', html: 'html', css: 'css' };

/* File icon based on extension */
function FileIcon({ name }) {
  const ext = name.split('.').pop();
  const lang = extToLangMap[ext] || 'txt';
  return <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{LangSVGs[lang] || LangSVGs.txt}</span>;
}

export default function CreateSnippet() {
  const [files, setFiles] = useState([
    { id: Date.now(), name: 'main.py', content: '', language: 'python' }
  ]);
  const [activeId, setActiveId]       = useState(files[0].id);
  const [editingFileId, setEditingFileId] = useState(null);
  const [snippetUrl, setSnippetUrl]   = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const lineNumbersRef = useRef(null);

  /* inject styles once */
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const activeFile = files.find(f => f.id === activeId);
  const lineCount  = activeFile.content.split('\n').length;
  const lines      = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1);

  const handleScroll = (e) => {
    if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = e.target.scrollTop;
  };

  const updateActiveFile = (field, value) =>
    setFiles(prev => prev.map(f => f.id === activeId ? { ...f, [field]: value } : f));

  const updateFileName = (id, newName) => {
    const ext = newName.split('.').pop();
    const lang = extToLang[ext];
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName, ...(lang && { language: lang }) } : f));
  };

  const addNewFile = () => {
    const ext = langToExt[activeFile.language] || 'txt';
    const newFile = { id: Date.now(), name: `file${files.length + 1}.${ext}`, content: '', language: activeFile.language };
    setFiles(prev => [...prev, newFile]);
    setActiveId(newFile.id);
    setEditingFileId(newFile.id);
  };

  const deleteFile = (e, id) => {
    e.stopPropagation();
    if (files.length === 1) return;
    const remaining = files.filter(f => f.id !== id);
    setFiles(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 'http://localhost:5000';
    try {
      const response = await fetch(`${backendUrl}/api/snippets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });
      const data = await response.json();
      if (response.ok) setSnippetUrl(`${window.location.origin}/${data.id}`);
    } catch (err) {
      console.error('Failed to connect', err);
    } finally {
      setIsLoading(false);
    }
  };

  const highlightCode = (code) => {
    const grammar = Prism.languages[activeFile.language] || Prism.languages.javascript;
    return Prism.highlight(code, grammar, activeFile.language);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-void)',
      fontFamily: "'Outfit', sans-serif",
      color: 'var(--text-primary)',
    }}>
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── TOP BAR ── */}
      <header className="glass" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52,
        borderBottom: '1px solid var(--border)',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="logo-text" style={{ fontSize: 16 }}>LEXSNIP</span>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 99,
            background: 'rgba(99,179,255,0.08)', border: '1px solid var(--border)',
            color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.06em',
          }}>v2</span>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {snippetUrl && (
            <a href={snippetUrl} target="_blank" rel="noreferrer" className="link-pill">
              <span className="status-dot" />
              Share ready · copy link
            </a>
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-share"
            style={{
              color: '#fff', fontSize: 13, fontWeight: 600,
              padding: '6px 18px', borderRadius: 8, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", letterSpacing: '0.03em',
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Saving…
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 10V2M8 2L5 5M8 2L11 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 11v1.5A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                Share Workspace
              </span>
            )}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 220, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--border)',
          background: 'rgba(3,5,10,0.75)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Explorer header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 14px 10px',
            borderBottom: '1px solid var(--border)',
          }}>
            <span className="section-label">Explorer</span>
            <button
              onClick={addNewFile}
              className="icon-btn"
              title="New file"
              style={{ fontSize: 16, fontWeight: 300 }}
            >＋</button>
          </div>

          {/* File list */}
          <div style={{ flex: 1, overflowY: 'auto', paddingTop: 6 }}>
            {files.map(file => (
              <div
                key={file.id}
                className={`file-row ${activeId === file.id ? 'file-active' : ''}`}
                onClick={() => setActiveId(file.id)}
              >
                {editingFileId === file.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={file.name}
                    onChange={e => updateFileName(file.id, e.target.value)}
                    onBlur={() => setEditingFileId(null)}
                    onKeyDown={e => e.key === 'Enter' && setEditingFileId(null)}
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: 'rgba(99,179,255,0.08)',
                      border: '1px solid var(--border-bright)',
                      borderRadius: 5, color: 'var(--text-primary)',
                      outline: 'none', padding: '2px 6px', width: '100%',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    }}
                  />
                ) : (
                  <>
                    <FileIcon name={file.name} />
                    <span
                      onDoubleClick={() => setEditingFileId(file.id)}
                      style={{
                        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                        color: activeId === file.id ? 'var(--accent-blue)' : 'var(--text-primary)',
                        userSelect: 'none',
                      }}
                    >{file.name}</span>
                    <div className="file-actions" style={{ display: 'flex', gap: 2 }}>
                      <button
                        className="icon-btn"
                        style={{ width: 22, height: 22, fontSize: 11 }}
                        onClick={e => { e.stopPropagation(); setEditingFileId(file.id); }}
                        title="Rename"
                      >✎</button>
                      {files.length > 1 && (
                        <button
                          className="icon-btn"
                          style={{ width: 22, height: 22, fontSize: 11, color: '#f87171' }}
                          onClick={e => deleteFile(e, file.id)}
                          title="Delete"
                        >✕</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div className="status-dot" />
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
              {files.length} file{files.length !== 1 ? 's' : ''}
            </span>
          </div>
        </aside>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', height: 42,
            borderBottom: '1px solid var(--border)',
            background: 'rgba(3,5,10,0.55)',
            backdropFilter: 'blur(12px)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <span style={{ color: 'var(--text-dim)' }}>workspace</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: 'var(--accent-blue)' }}>{activeFile.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>{LangSVGs[activeFile.language]}</span>
              <select
                value={activeFile.language}
                onChange={e => updateActiveFile('language', e.target.value)}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  padding: '4px 10px',
                  outline: 'none',
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer',
                }}
              >
                {Object.keys(langToExt).map(l => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            <div
              ref={lineNumbersRef}
              style={{
                width: 52, flexShrink: 0,
                padding: '16px 0',
                background: 'rgba(8,11,16,0.5)',
                borderRight: '1px solid var(--border)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13, lineHeight: '1.6',
                color: 'var(--text-muted)',
                textAlign: 'right', paddingRight: 12,
                overflowY: 'hidden', userSelect: 'none',
              }}
            >
              {lines.map(n => (
                <div
                  key={n}
                  style={{
                    color: n === lineCount ? 'var(--accent-blue)' : undefined,
                    transition: 'color 0.1s',
                  }}
                >{n}</div>
              ))}
            </div>
            <div
              onScroll={handleScroll}
              style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}
            >
              <div className="editor-wrap" style={{ minHeight: '100%' }}>
                <Editor
                  value={activeFile.content}
                  onValueChange={code => updateActiveFile('content', code)}
                  highlight={highlightCode}
                  padding={16}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    minHeight: '100%',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                  }}
                  textareaClassName="editor-textarea"
                />
              </div>
            </div>
            {activeFile.content === '' && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center', pointerEvents: 'none',
                animation: 'drift 8s ease-in-out infinite alternate',
              }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>{'{ }'}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
                  start typing…
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer style={{
        height: 26, flexShrink: 0,
        background: 'linear-gradient(90deg, #050d1a 0%, #040c18 50%, #030b16 100%)',
        borderTop: '1px solid rgba(99,179,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-dot" />
            <span style={{ fontSize: 11, color: 'rgba(99,179,255,0.7)', fontFamily: "'JetBrains Mono', monospace" }}>
              lexsnip
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace" }}>
            {files.length} file{files.length !== 1 ? 's' : ''} open
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="lang-badge">{activeFile.language}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>
            Ln {lineCount} · {activeFile.content.length} chars
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>
            UTF-8
          </span>
        </div>
      </footer>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}