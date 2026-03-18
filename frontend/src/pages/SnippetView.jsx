import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/* ─── Global styles (same design token system as CreateSnippet) ─── */
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
    --accent-purple:  #a78bfa;
    --text-primary:   #e2e8f0;
    --text-dim:       #64748b;
    --text-muted:     #334155;
    --glow-blue:      0 0 20px rgba(99,179,255,0.25);
    --glow-green:     0 0 16px rgba(57,255,20,0.35);
    --glow-purple:    0 0 16px rgba(167,139,250,0.3);
    --radius-sm:      6px;
    --radius-md:      10px;
  }

  html, body, #root { height: 100%; width: 100%; overflow: hidden; background: var(--bg-void); }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(99,179,255,0.2); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(99,179,255,0.4); }

  .glass {
    background: var(--bg-glass);
    backdrop-filter: blur(16px) saturate(150%);
    -webkit-backdrop-filter: blur(16px) saturate(150%);
    border: 1px solid var(--border);
  }

  .orb {
    position: fixed; border-radius: 50%;
    filter: blur(90px); opacity: 0.07;
    pointer-events: none;
    animation: drift 18s ease-in-out infinite alternate;
  }
  .orb-1 { width:600px;height:600px; background:radial-gradient(circle,#1e40af,transparent); top:-200px;left:-200px; animation-duration:20s; }
  .orb-2 { width:500px;height:500px; background:radial-gradient(circle,#0e7490,transparent); bottom:-150px;right:-100px; animation-duration:16s;animation-delay:-5s; }
  .orb-3 { width:300px;height:300px; background:radial-gradient(circle,#4c1d95,transparent); top:40%;left:40%; animation-duration:24s;animation-delay:-10s; }

  @keyframes drift {
    0%   { transform:translate(0,0) scale(1); }
    50%  { transform:translate(30px,20px) scale(1.08); }
    100% { transform:translate(-20px,40px) scale(0.95); }
  }

  .file-active {
    background: var(--bg-active) !important;
    border-color: var(--border-bright) !important;
    box-shadow: inset 2px 0 0 var(--accent-blue), var(--glow-blue);
  }

  .logo-text {
    font-family: 'Outfit', sans-serif; font-weight: 700; letter-spacing: 0.12em;
    background: linear-gradient(120deg, var(--accent-green) 0%, var(--accent-cyan) 60%, var(--accent-blue) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    filter: drop-shadow(0 0 8px rgba(57,255,20,0.4));
  }

  .lang-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.08em;
    padding: 2px 8px; border-radius: 99px;
    background: rgba(99,179,255,0.1); border: 1px solid rgba(99,179,255,0.2);
    color: var(--accent-blue);
  }

  .section-label {
    font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-dim);
  }

  .file-row {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 12px; cursor: pointer;
    border-left: 2px solid transparent;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    margin: 1px 6px 1px 0;
    transition: all 0.15s ease;
  }
  .file-row:hover:not(.file-active) { background: var(--bg-glass-hover); }

  .icon-btn {
    display: flex; align-items: center; justify-content: center;
    border-radius: var(--radius-sm); border: 1px solid transparent;
    color: var(--text-dim); transition: all 0.15s ease;
    cursor: pointer; background: none;
  }
  .icon-btn:hover { background: var(--bg-glass-hover); border-color: var(--border); color: var(--text-primary); }

  .status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent-green); box-shadow: var(--glow-green);
    animation: pulse 2.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(0.7); }
  }

  /* syntax highlighter tweaks */
  .snip-code pre { background: transparent !important; }
  .snip-code code { font-family: 'JetBrains Mono', monospace !important; font-size: 13.5px !important; line-height: 1.6 !important; }

  /* chat bubble */
  .bubble-user   { background: linear-gradient(135deg,#1d4ed8,#0891b2); color:#fff; border-radius:12px 12px 2px 12px; }
  .bubble-ai     { background:rgba(255,255,255,0.05); border:1px solid var(--border); color:var(--text-primary); border-radius:12px 12px 12px 2px; }

  /* typing dots */
  .dot { width:6px; height:6px; border-radius:50%; background:var(--text-dim); animation:bounce 1.2s ease-in-out infinite; }
  .dot:nth-child(2) { animation-delay:0.15s; }
  .dot:nth-child(3) { animation-delay:0.3s; }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

  /* AI panel slide-in */
  @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
  .ai-panel { animation: slideIn 0.25s ease; }

  /* button variants */
  .btn-download {
    background: linear-gradient(135deg,#065f46,#047857);
    border: 1px solid rgba(52,211,153,0.25);
    box-shadow: 0 0 12px rgba(5,150,105,0.25);
    transition: all 0.2s;
  }
  .btn-download:hover { box-shadow:0 0 20px rgba(5,150,105,0.45); transform:translateY(-1px); }

  .btn-ai {
    background: linear-gradient(135deg,#4c1d95,#6d28d9);
    border: 1px solid rgba(167,139,250,0.3);
    box-shadow: 0 0 12px rgba(109,40,217,0.25);
    transition: all 0.2s;
  }
  .btn-ai:hover { box-shadow: 0 0 20px rgba(109,40,217,0.5); transform:translateY(-1px); }

  .btn-new {
    background: linear-gradient(135deg,#1d4ed8,#0891b2);
    border: 1px solid rgba(99,179,255,0.3);
    box-shadow: 0 0 12px rgba(14,116,144,0.25);
    transition: all 0.2s;
  }
  .btn-new:hover { box-shadow: 0 0 20px rgba(14,116,144,0.5); transform:translateY(-1px); }

  .chat-input {
    background: rgba(255,255,255,0.05) !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px;
    color: var(--text-primary) !important;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    outline: none;
    transition: border-color 0.15s;
  }
  .chat-input:focus { border-color: var(--border-bright) !important; }
  .chat-input::placeholder { color: var(--text-dim); }

  .btn-send {
    background: linear-gradient(135deg,#4c1d95,#6d28d9);
    border: 1px solid rgba(167,139,250,0.3);
    border-radius: 8px;
    transition: all 0.15s;
    cursor: pointer;
  }
  .btn-send:hover:not(:disabled) { box-shadow: var(--glow-purple); }
  .btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
`;

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
      <path d="M9.564 26.198l2.637-1.596c.508.9.972 1.662 2.085 1.662 1.065 0 1.737-.416 1.737-2.037V14.716h3.24v9.56c0 3.355-1.967 4.88-4.837 4.88-2.59 0-4.097-1.342-4.862-2.958zM20.24 25.83l2.637-1.528c.694 1.13 1.596 1.964 3.19 1.964 1.34 0 2.198-.67 2.198-1.596 0-1.11-.88-1.502-2.358-2.15l-.81-.347c-2.336-1-3.888-2.242-3.888-4.88 0-2.428 1.848-4.28 4.742-4.28 2.058 0 3.54.716 4.602 2.59l-2.52 1.617c-.556-.994-1.154-1.385-2.082-1.385-.947 0-1.548.6-1.548 1.385 0 .97.6 1.362 1.987 1.965l.81.347c2.752 1.18 4.305 2.382 4.305 5.08 0 2.913-2.29 4.51-5.366 4.51-3.006 0-4.95-1.432-5.9-3.292z" fill="#323330"/>
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

const extToLangMap = { py:'python', js:'javascript', java:'java', cpp:'cpp', html:'html', css:'css' };

function FileIcon({ name }) {
  const ext = name.split('.').pop();
  const lang = extToLangMap[ext] || 'txt';
  return <span style={{ display:'flex', alignItems:'center', flexShrink:0 }}>{LangSVGs[lang] || LangSVGs.txt}</span>;
}

/* ─── Sparkle SVG for AI button ─── */
const SparkleIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.22 3.22l2.12 2.12M10.66 10.66l2.12 2.12M3.22 12.78l2.12-2.12M10.66 5.34l2.12-2.12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="8" r="2" fill="white"/>
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2v8M5 7l3 3 3-3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 11v1.5A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 8L2.5 2.5l2.8 5.5-2.8 5.5L13.5 8z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,255,255,0.15)"/>
  </svg>
);

/* ─── Syntax theme override to match our palette ─── */
const customDarkTheme = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    background: 'transparent',
    margin: 0,
    padding: '16px',
    minHeight: '100%',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '13.5px',
    lineHeight: '1.6',
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    background: 'transparent',
    fontFamily: "'JetBrains Mono', monospace",
  },
};

/* ════════════════════════════════════════════════════════ */
function SnippetView() {
  const { id } = useParams();
  const [snippet, setSnippet]             = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isLoading, setIsLoading]         = useState(true);
  const [copied, setCopied]               = useState(false);

  const [showAIPanel, setShowAIPanel]     = useState(false);
  const [isTyping, setIsTyping]           = useState(false);
  const [messages, setMessages]           = useState([]);
  const [chatInput, setChatInput]         = useState('');
  const chatScrollRef                     = useRef(null);

  /* inject styles */
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  /* auto-scroll chat */
  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  /* fetch snippet */
  useEffect(() => {
    const fetchSnippet = async () => {
      const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 'http://localhost:5000';
      try {
        const res = await fetch(`${backendUrl}/api/snippets/${id}`);
        const result = await res.json();
        if (res.ok) setSnippet(result.data);
      } catch (err) {
        console.error('Failed to connect');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSnippet();
  }, [id]);

  const handleCopy = () => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet.files[activeFileIndex].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    if (!snippet?.files) return;
    const zip = new JSZip();
    snippet.files.forEach(f => zip.file(f.name, f.content));
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `lexsnip-${snippet.snippetId}.zip`);
  };

  const sendChatMessage = async (text) => {
    if (!text.trim() || !snippet) return;
    const next = [...messages, { role: 'user', text }];
    setMessages(next);
    setChatInput('');
    setIsTyping(true);
    const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 'http://localhost:5000';
    try {
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: snippet.files, chatHistory: messages, message: text }),
      });
      const data = await res.json();
      setMessages([...next, { role: 'ai', text: res.ok ? data.text : `Error: ${data.error}` }]);
    } catch {
      setMessages([...next, { role: 'ai', text: 'Failed to reach the AI server.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const openChatAndSummarize = () => {
    setShowAIPanel(true);
    if (messages.length === 0) sendChatMessage('Please provide a concise, easy-to-understand summary of what this code workspace does.');
  };

  /* ── loading / error states ── */
  if (isLoading) return (
    <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#080b10' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{ display:'flex', gap:8 }}>
          {[0,1,2].map(i => (
            <div key={i} className="dot" style={{ animationDelay:`${i*0.15}s` }} />
          ))}
        </div>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", color:'#64748b', fontSize:13 }}>loading workspace…</span>
      </div>
    </div>
  );

  if (!snippet?.files) return (
    <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#080b10' }}>
      <div style={{ textAlign:'center', fontFamily:"'Outfit',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>{'{ }'}</div>
        <div style={{ color:'#f87171', fontSize:14 }}>Workspace not found</div>
      </div>
    </div>
  );

  const activeFile = snippet.files[activeFileIndex];

  return (
    <div style={{
      position:'fixed', inset:0, display:'flex', flexDirection:'column',
      background:'var(--bg-void)', fontFamily:"'Outfit',sans-serif", color:'var(--text-primary)',
    }}>
      {/* Background orbs */}
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      {/* ── TOP BAR ── */}
      <header className="glass" style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 20px', height:52, borderBottom:'1px solid var(--border)',
        flexShrink:0, position:'relative', zIndex:10,
      }}>
        {/* Logo + snippet ID */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span className="logo-text" style={{ fontSize:16 }}>LEXSNIP</span>

          {/* Snippet ID pill */}
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'3px 10px', borderRadius:99,
            background:'rgba(99,179,255,0.07)', border:'1px solid var(--border)',
          }}>
            <div className="status-dot" style={{ width:5, height:5 }}/>
            <span style={{
              fontFamily:"'JetBrains Mono',monospace", fontSize:11,
              color:'var(--text-dim)', letterSpacing:'0.06em',
            }}>{snippet.snippetId}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="icon-btn"
            style={{ padding:'5px 12px', fontSize:12, fontFamily:"'Outfit',sans-serif", gap:6, display:'flex', alignItems:'center' }}
          >
            {copied ? (
              <>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none"><path d="M2 8l4 4 8-8" stroke="var(--accent-green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ color:'var(--accent-green)' }}>Copied!</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none"><rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 11V3a1 1 0 011-1h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span>Copy file</span>
              </>
            )}
          </button>

          {/* Download ZIP */}
          <button
            onClick={handleDownloadZip}
            className="btn-download"
            style={{
              color:'#fff', fontSize:12, fontWeight:600,
              padding:'6px 14px', borderRadius:8, cursor:'pointer',
              fontFamily:"'Outfit',sans-serif", display:'flex', alignItems:'center', gap:6,
            }}
          >
            <DownloadIcon/> Download ZIP
          </button>

          {/* AI Chat */}
          <button
            onClick={openChatAndSummarize}
            className="btn-ai"
            style={{
              color:'#fff', fontSize:12, fontWeight:600,
              padding:'6px 14px', borderRadius:8, cursor:'pointer',
              fontFamily:"'Outfit',sans-serif", display:'flex', alignItems:'center', gap:6,
            }}
          >
            <SparkleIcon/> AI Chat
          </button>

          {/* New snippet */}
          <Link
            to="/"
            style={{
              color:'#fff', fontSize:12, fontWeight:600,
              padding:'6px 14px', borderRadius:8, textDecoration:'none',
              fontFamily:"'Outfit',sans-serif", display:'flex', alignItems:'center', gap:6,
            }}
            className="btn-new"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none"><path d="M8 2v12M2 8h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            New
          </Link>
        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', position:'relative', zIndex:1 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width:220, flexShrink:0,
          display:'flex', flexDirection:'column',
          borderRight:'1px solid var(--border)',
          background:'rgba(3,5,10,0.75)',
          backdropFilter:'blur(20px)',
        }}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 14px 10px', borderBottom:'1px solid var(--border)',
          }}>
            <span className="section-label">Files</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>
              {snippet.files.length} file{snippet.files.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ flex:1, overflowY:'auto', paddingTop:6 }}>
            {snippet.files.map((file, idx) => (
              <div
                key={idx}
                className={`file-row ${activeFileIndex === idx ? 'file-active' : ''}`}
                onClick={() => setActiveFileIndex(idx)}
              >
                <FileIcon name={file.name}/>
                <span style={{
                  flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  fontSize:13, fontFamily:"'JetBrains Mono',monospace",
                  color: activeFileIndex === idx ? 'var(--accent-blue)' : 'var(--text-primary)',
                  userSelect:'none',
                }}>{file.name}</span>
              </div>
            ))}
          </div>

          {/* sidebar footer */}
          <div style={{
            padding:'10px 14px', borderTop:'1px solid var(--border)',
            display:'flex', alignItems:'center', gap:8,
          }}>
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="var(--text-dim)" strokeWidth="1.3"/>
              <path d="M5 8h6M8 5v6" stroke="var(--text-dim)" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize:11, color:'var(--text-dim)', fontFamily:"'JetBrains Mono',monospace" }}>
              read-only view
            </span>
          </div>
        </aside>

        {/* ── CODE VIEWER ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* toolbar */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0 16px', height:42,
            borderBottom:'1px solid var(--border)',
            background:'rgba(3,5,10,0.55)',
            backdropFilter:'blur(12px)',
            flexShrink:0,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>
              <span style={{ color:'var(--text-dim)' }}>workspace</span>
              <span style={{ color:'var(--text-muted)' }}>/</span>
              <span style={{ color:'var(--accent-blue)' }}>{activeFile.name}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ display:'flex', alignItems:'center' }}>{LangSVGs[activeFile.language] || LangSVGs.txt}</span>
              <span className="lang-badge">{activeFile.language}</span>
            </div>
          </div>

          <div className="snip-code" style={{ flex:1, overflowY:'auto', overflowX:'auto' }}>
            <SyntaxHighlighter
              language={activeFile.language}
              style={customDarkTheme}
              showLineNumbers
              lineNumberStyle={{
                minWidth:'3.5em', paddingRight:'1.2em',
                color:'var(--text-muted)', textAlign:'right',
                fontFamily:"'JetBrains Mono',monospace", fontSize:'13px',
                userSelect:'none', borderRight:'1px solid var(--border)',
                marginRight:'1em',
              }}
              customStyle={{
                margin:0, padding:0, minHeight:'100%',
                background:'transparent',
              }}
            >
              {activeFile.content || '// empty file'}
            </SyntaxHighlighter>
          </div>
        </div>

        {showAIPanel && (
          <div className="ai-panel" style={{
            width:360, flexShrink:0,
            display:'flex', flexDirection:'column',
            borderLeft:'1px solid var(--border)',
            background:'rgba(3,5,10,0.85)',
            backdropFilter:'blur(24px)',
            zIndex:20,
          }}>
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'12px 16px', borderBottom:'1px solid var(--border)',
              background:'rgba(255,255,255,0.02)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>LEXSNIP Assistant</div>
                  <div style={{ fontSize:10, color:'var(--text-dim)', fontFamily:"'JetBrains Mono',monospace" }}>powered by AI</div>
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowAIPanel(false)}
                style={{ width:26, height:26, fontSize:14 }}
                title="Close"
              >
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div ref={chatScrollRef} style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>
              {messages.length === 0 && !isTyping && (
                <div style={{ textAlign:'center', marginTop:40, color:'var(--text-dim)', fontSize:13 }}>
                  <div style={{ fontSize:28, marginBottom:8, opacity:0.5 }}>✦</div>
                  Ask anything about this code
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{ display:'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div
                    className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}
                    style={{
                      maxWidth:'88%', padding:'10px 13px',
                      fontSize:12.5, lineHeight:1.6,
                      fontFamily:"'JetBrains Mono',monospace",
                      whiteSpace:'pre-wrap', wordBreak:'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display:'flex', justifyContent:'flex-start' }}>
                  <div className="bubble-ai" style={{ padding:'12px 16px', display:'flex', gap:5, alignItems:'center' }}>
                    <div className="dot"/><div className="dot"/><div className="dot"/>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)', background:'rgba(255,255,255,0.02)' }}>
              <div style={{ display:'flex', gap:8 }} onSubmit={e => { e.preventDefault(); sendChatMessage(chatInput); }}>
                <input
                  className="chat-input"
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendChatMessage(chatInput))}
                  placeholder="Ask about this code…"
                  disabled={isTyping}
                  style={{
                    flex:1, padding:'8px 12px',
                    opacity: isTyping ? 0.5 : 1,
                  }}
                />
                <button
                  className="btn-send"
                  onClick={() => sendChatMessage(chatInput)}
                  disabled={isTyping || !chatInput.trim()}
                  style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                >
                  <SendIcon/>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer style={{
        height:26, flexShrink:0,
        background:'linear-gradient(90deg,#050d1a 0%,#040c18 50%,#030b16 100%)',
        borderTop:'1px solid rgba(99,179,255,0.15)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 16px', position:'relative', zIndex:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div className="status-dot"/>
            <span style={{ fontSize:11, color:'rgba(99,179,255,0.7)', fontFamily:"'JetBrains Mono',monospace" }}>read-only</span>
          </div>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:"'JetBrains Mono',monospace" }}>
            {snippet.files.length} file{snippet.files.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span className="lang-badge">{activeFile.language}</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontFamily:"'JetBrains Mono',monospace" }}>
            {activeFile.content.split('\n').length} lines
          </span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontFamily:"'JetBrains Mono',monospace" }}>
            UTF-8
          </span>
        </div>
      </footer>
    </div>
  );
}

export default SnippetView;