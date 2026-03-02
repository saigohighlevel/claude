import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  Sparkles, ArrowLeft, Code2, Eye, Rocket, Share2,
  RotateCcw, Send, ChevronDown, Monitor,
  Tablet, Smartphone, X, Check, Loader2, Copy,
  Terminal, Maximize2, ThumbsUp, ThumbsDown,
  RefreshCw, Wand2, ChevronRight, Download
} from 'lucide-react'

// ─── AI call ────────────────────────────────────────────────────────────────
async function callAI(messages: { role: string; content: string }[], context: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'AI request failed')
  return data.content as string
}

// ─── Loading skeleton shown while AI generates first time ───────────────────
const LOADING_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0f172a;font-family:system-ui,-apple-system,sans-serif;overflow:hidden}
  .shimmer{background:linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.03) 100%);background-size:200% 100%;animation:shimmer 1.8s infinite}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .pulse{animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}
  .spin{animation:spin .9s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
</style></head>
<body>
  <div style="height:56px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 24px;gap:32px">
    <div class="shimmer" style="width:80px;height:20px;border-radius:6px"></div>
    <div style="display:flex;gap:24px">
      <div class="shimmer" style="width:56px;height:14px;border-radius:4px"></div>
      <div class="shimmer" style="width:56px;height:14px;border-radius:4px"></div>
      <div class="shimmer" style="width:56px;height:14px;border-radius:4px"></div>
      <div class="shimmer" style="width:56px;height:14px;border-radius:4px"></div>
    </div>
    <div class="shimmer" style="width:100px;height:32px;border-radius:8px;margin-left:auto"></div>
  </div>
  <div style="height:calc(100vh - 56px);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px">
    <div style="width:48px;height:48px;border:3px solid rgba(99,102,241,0.15);border-top-color:#6366f1;border-radius:50%" class="spin"></div>
    <div style="text-align:center">
      <div style="color:rgba(255,255,255,0.8);font-size:15px;font-weight:600;margin-bottom:6px">Building your app...</div>
      <div style="color:rgba(255,255,255,0.35);font-size:13px">Forge AI is crafting something beautiful</div>
    </div>
    <div style="display:flex;gap:6px;margin-top:8px">
      ${[0, 0.3, 0.6].map(d => `<div style="width:6px;height:6px;border-radius:50%;background:#6366f1;animation:pulse 1.4s ${d}s ease-in-out infinite"></div>`).join('')}
    </div>
  </div>
</body></html>`

// ─── Live Preview iframe ────────────────────────────────────────────────────
function LivePreview({ code, isGenerating }: { code: string; isGenerating: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const setIframeSrc = useCallback((html: string) => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    if (iframeRef.current) iframeRef.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [])

  // Show skeleton when generating with no code yet
  useEffect(() => {
    if (isGenerating && !code) {
      return setIframeSrc(LOADING_HTML)
    }
  }, [isGenerating, code, setIframeSrc])

  // Render actual code
  useEffect(() => {
    if (!code) return
    const processed = code
      .replace(/^import\s+.*$/gm, '')
      .replace(/export\s+default\s+function\s+App/g, 'function App')
      .replace(/export\s+default\s+/g, '')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',system-ui,-apple-system,sans-serif}
    html{scroll-behavior:smooth}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
const { useState, useEffect, useRef, useCallback, useMemo, useReducer } = React;
${processed}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
  </script>
</body>
</html>`
    return setIframeSrc(html)
  }, [code, setIframeSrc])

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', height: '100%', border: 'none', background: '#0f172a', display: 'block' }}
      sandbox="allow-scripts"
      title="App Preview"
    />
  )
}

// ─── Syntax-highlighted code panel ─────────────────────────────────────────
function CodePanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const lines = code.split('\n')
  const colorize = (line: string) => {
    if (line.trim().startsWith('//')) return <span style={{ color: '#64748b' }}>{line}</span>
    if (line.trim().startsWith('import')) return <span><span style={{ color: '#c084fc' }}>import</span><span style={{ color: '#94a3b8' }}>{line.slice(6)}</span></span>
    if (line.includes('export default')) return <span><span style={{ color: '#c084fc' }}>export default </span><span style={{ color: '#818cf8' }}>function</span><span style={{ color: '#fbbf24' }}>{line.split('function')[1] || ''}</span></span>
    if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
      return <span><span style={{ color: '#818cf8' }}>{line.match(/\b(const|let|var)\b/)?.[0] || ''}</span><span style={{ color: '#94a3b8' }}>{line.replace(/\b(const|let|var)\b/, '')}</span></span>
    }
    if (line.trim().startsWith('return')) return <span><span style={{ color: '#c084fc' }}>return</span><span style={{ color: '#94a3b8' }}>{line.slice(line.indexOf('return') + 6)}</span></span>
    return <span style={{ color: '#94a3b8' }}>{line}</span>
  }
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0d0d14' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(99,102,241,0.1)', background: '#0a0a0f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={13} color="#6366f1" />
          <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>App.tsx</span>
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 4, padding: '1px 6px', fontSize: 10, color: '#818cf8' }}>TypeScript</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copyCode} style={{ background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: copied ? '#10b981' : '#64748b', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy code</>}
          </button>
          <button onClick={() => { const blob = new Blob([code], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'App.tsx'; a.click() }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontFamily: 'inherit' }}>
            <Download size={11} /> Download
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 12 }}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} style={{ lineHeight: 1.7 }}>
                <td style={{ paddingLeft: 16, paddingRight: 16, color: '#2d3748', textAlign: 'right', userSelect: 'none', minWidth: 40, width: 40, fontSize: 11 }}>{i + 1}</td>
                <td style={{ paddingRight: 20, whiteSpace: 'pre' }}>{colorize(line)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Types ──────────────────────────────────────────────────────────────────
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  thinking?: boolean
  liked?: boolean | null
}

// ─── Visual Edits quick-action panel ────────────────────────────────────────
const VISUAL_EDITS = [
  { label: 'Dark mode', prompt: 'Convert to a beautiful dark theme with deep backgrounds and light text' },
  { label: 'Light mode', prompt: 'Convert to a clean light theme with white backgrounds and dark text' },
  { label: 'Add animations', prompt: 'Add smooth CSS animations — fade in on scroll, hover effects, transitions on all interactive elements' },
  { label: 'More minimal', prompt: 'Make the design more minimal and clean — reduce visual clutter, increase whitespace' },
  { label: 'Bolder design', prompt: 'Make the design bolder — bigger typography, stronger colors, more visual impact' },
  { label: 'Add gallery', prompt: 'Add an image gallery section with a grid of high-quality photos from Unsplash relevant to this business' },
  { label: 'Fix mobile', prompt: 'Make it fully responsive — fix all layouts for mobile, add proper hamburger menu, ensure touch-friendly targets' },
  { label: 'Better hero', prompt: 'Redesign the hero section to be more impactful — full screen, compelling headline, better background image, stats/badges' },
  { label: 'Add pricing', prompt: 'Add a beautiful pricing section with 3 tiers (Basic, Pro, Enterprise), feature lists, and a highlighted "Most popular" card' },
  { label: 'Add FAQ', prompt: 'Add an expandable FAQ section with 6-8 relevant questions and detailed answers' },
]

function VisualEditsPanel({ onSelect, onClose }: { onSelect: (prompt: string) => void; onClose: () => void }) {
  return (
    <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', background: 'rgba(10,10,15,0.8)', padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wand2 size={12} color="#818cf8" />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick edits</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <X size={12} color="#475569" />
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {VISUAL_EDITS.map(edit => (
          <button key={edit.label} onClick={() => { onSelect(edit.prompt); onClose() }} style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#c7d2fe'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)' }}
          >
            {edit.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Builder ────────────────────────────────────────────────────────────
export default function Builder() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { prompt?: string; project?: { name: string } } | null

  const initialPrompt = state?.prompt || 'Build a modern task manager app'
  const projectName = state?.project?.name || initialPrompt.split(' ').slice(0, 4).join(' ')

  const [view, setView] = useState<'preview' | 'code'>('preview')
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: '', timestamp: new Date(), thinking: true },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [generating, setGenerating] = useState(true)
  const [code, setCode] = useState('')
  const [deployed, setDeployed] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [shareMenu, setShareMenu] = useState(false)
  const [showVisualEdits, setShowVisualEdits] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-generate on first load
  const didInitRef = useRef(false)
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true
    setGenerating(true)
    callAI([{ role: 'user', content: initialPrompt }], initialPrompt)
      .then(aiText => {
        const codeMatch = aiText.match(/```(?:tsx?|jsx?)\n([\s\S]*?)```/)
        if (codeMatch) setCode(codeMatch[1].trim())
        const displayText = aiText.replace(/```(?:tsx?|jsx?)\n[\s\S]*?```/g, '').trim()
          || `✨ Your app is ready! I've built a complete, production-quality design. Ask me to make any changes.`
        setMessages([{ id: 'init', role: 'assistant', content: displayText, timestamp: new Date() }])
      })
      .catch(err => {
        setMessages([{ id: 'init', role: 'assistant', content: `⚠️ ${err.message || 'Something went wrong. Check your API key in the .env file.'}`, timestamp: new Date() }])
      })
      .finally(() => setGenerating(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = async (overrideInput?: string) => {
    const text = overrideInput ?? input
    if (!text.trim() || sending) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    const thinkingMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: new Date(), thinking: true }
    setMessages(m => [...m, userMsg, thinkingMsg])
    setInput('')
    setSending(true)
    setGenerating(true)
    try {
      const history = messages.filter(m => !m.thinking).map(m => ({ role: m.role, content: m.content }))
      history.push({ role: 'user', content: text })
      const aiText = await callAI(history, initialPrompt)
      const codeMatch = aiText.match(/```(?:tsx?|jsx?)\n([\s\S]*?)```/)
      if (codeMatch) setCode(codeMatch[1].trim())
      const displayText = aiText.replace(/```(?:tsx?|jsx?)\n[\s\S]*?```/g, '').trim()
        || 'Done! The preview has been updated.'
      setMessages(m => m.map(msg => msg.thinking ? { ...msg, content: displayText, thinking: false } : msg))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong.'
      setMessages(m => m.map(msg => msg.thinking ? { ...msg, content: `⚠️ ${errorMsg}`, thinking: false } : msg))
    }
    setSending(false)
    setGenerating(false)
  }

  const regenerateLast = () => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    if (lastUser) sendMessage(lastUser.content)
  }

  const likeMessage = (id: string, liked: boolean) => {
    setMessages(m => m.map(msg => msg.id === id ? { ...msg, liked } : msg))
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleDeploy = async () => {
    if (deploying || deployed) return
    setDeploying(true)
    await new Promise(r => setTimeout(r, 2200))
    setDeploying(false)
    setDeployed(true)
  }

  const viewportWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '390px'

  // Context-aware suggestions based on the initial prompt
  const getSuggestions = () => {
    const p = initialPrompt.toLowerCase()
    if (p.includes('salon') || p.includes('hair') || p.includes('barber') || p.includes('beauty')) {
      return ['Add online booking form', 'Show before/after gallery', 'Add team & stylists section', 'Add service pricing menu']
    }
    if (p.includes('restaurant') || p.includes('cafe') || p.includes('food') || p.includes('bar')) {
      return ['Add full menu with prices', 'Add reservation form', 'Show chef & team section', 'Add events/specials section']
    }
    if (p.includes('gym') || p.includes('fitness') || p.includes('yoga') || p.includes('sport')) {
      return ['Add class schedule', 'Add membership pricing', 'Show transformation gallery', 'Add trainer profiles']
    }
    if (p.includes('saas') || p.includes('app') || p.includes('software') || p.includes('tool')) {
      return ['Add pricing tiers', 'Add feature comparison table', 'Add integration logos', 'Add demo video section']
    }
    return ['Add dark mode', 'Add pricing section', 'Make it fully responsive', 'Add contact form']
  }

  return (
    <div style={{ height: '100vh', background: '#080810', color: '#f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Top bar ── */}
      <header style={{ height: 52, background: 'rgba(8,8,16,0.98)', borderBottom: '1px solid rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, flexShrink: 0, backdropFilter: 'blur(20px)' }}>

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f1f5f9' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#64748b' }}
          ><ArrowLeft size={14} /></button>

          <div style={{ width: 1, height: 18, background: 'rgba(99,102,241,0.15)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{projectName}</div>
              <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: generating ? '#f59e0b' : '#10b981', transition: 'background 0.3s' }} />
                {generating ? 'Generating…' : 'Ready'}
              </div>
            </div>
            <ChevronDown size={12} color="#475569" />
          </div>
        </div>

        {/* Center — view/viewport controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 8, padding: 3, gap: 2 }}>
            {([{ value: 'preview', icon: Eye, label: 'Preview' }, { value: 'code', icon: Code2, label: 'Code' }] as const).map(v => (
              <button key={v.value} onClick={() => setView(v.value)} style={{ background: view === v.value ? 'rgba(99,102,241,0.18)' : 'transparent', border: view === v.value ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', borderRadius: 6, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: view === v.value ? '#818cf8' : '#64748b', transition: 'all 0.15s' }}>
                <v.icon size={12} />{v.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: 3 }}>
            {([{ v: 'desktop', I: Monitor }, { v: 'tablet', I: Tablet }, { v: 'mobile', I: Smartphone }] as const).map(({ v, I }) => (
              <button key={v} onClick={() => setViewport(v)} style={{ background: viewport === v ? 'rgba(99,102,241,0.15)' : 'transparent', border: `1px solid ${viewport === v ? 'rgba(99,102,241,0.3)' : 'transparent'}`, borderRadius: 5, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: viewport === v ? '#818cf8' : '#475569', transition: 'all 0.15s' }}>
                <I size={12} />
              </button>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
          {/* Refresh preview */}
          <button onClick={() => { const c = code; setCode(''); setTimeout(() => setCode(c), 50) }} title="Reload preview" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#64748b' }}
          ><RotateCcw size={12} /></button>

          {/* Share */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShareMenu(!shareMenu)} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#818cf8', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
            ><Share2 size={12} />Share</button>
            {shareMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#1a1a26', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 14, minWidth: 260, zIndex: 200, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>Share preview link</div>
                <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '7px 10px', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>forge.app/preview/{projectId}</span>
                  <button onClick={() => { navigator.clipboard.writeText(`forge.app/preview/${projectId}`); setShareMenu(false) }} style={{ background: 'rgba(99,102,241,0.15)', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#818cf8', cursor: 'pointer', fontFamily: 'inherit' }}>Copy</button>
                </div>
                <button onClick={() => setShareMenu(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer' }}><X size={13} color="#475569" /></button>
              </div>
            )}
          </div>

          {/* Deploy */}
          <button onClick={handleDeploy} disabled={deploying} style={{ background: deployed ? 'rgba(16,185,129,0.12)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: deployed ? '1px solid rgba(16,185,129,0.3)' : 'none', borderRadius: 7, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, cursor: deploying ? 'not-allowed' : 'pointer', color: deployed ? '#10b981' : 'white', fontFamily: 'inherit', transition: 'all 0.2s', opacity: deploying ? 0.7 : 1 }}>
            {deploying ? <><Loader2 size={12} style={{ animation: 'spin .8s linear infinite' }} />Deploying…</> : deployed ? <><Check size={12} />Deployed!</> : <><Rocket size={12} />Deploy</>}
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', overflow: 'hidden' }}>

        {/* ── Chat panel ── */}
        <div style={{ borderRight: '1px solid rgba(99,102,241,0.1)', display: 'flex', flexDirection: 'column', background: '#0c0c18', overflow: 'hidden' }}>

          {/* Chat header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(8,8,16,0.6)', flexShrink: 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Forge AI</div>
              <div style={{ fontSize: 10, color: '#475569' }}>Full-stack UI builder</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: generating ? '#f59e0b' : '#10b981', transition: 'background 0.3s' }} />
              <span style={{ fontSize: 10, color: generating ? '#f59e0b' : '#10b981', transition: 'color 0.3s' }}>{generating ? 'Working…' : 'Online'}</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={9} color="white" />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#818cf8' }}>Forge</span>
                    <span style={{ fontSize: 10, color: '#2d3748' }}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}

                <div style={{ maxWidth: '90%', background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.18))' : 'rgba(255,255,255,0.04)', border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px', padding: '9px 13px', fontSize: 13, lineHeight: 1.65, color: msg.role === 'user' ? '#c7d2fe' : '#94a3b8' }}>
                  {msg.thinking ? (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '2px 0' }}>
                      {[0, 0.2, 0.4].map((d, i) => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: `pulse ${1.2}s ${d}s ease-in-out infinite`, opacity: 0.7 }} />
                      ))}
                    </div>
                  ) : (
                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                  )}
                </div>

                {/* Message actions for assistant messages */}
                {msg.role === 'assistant' && !msg.thinking && (
                  <div style={{ display: 'flex', gap: 3, marginTop: 5, opacity: 0.7 }}>
                    <button title="Helpful" onClick={() => likeMessage(msg.id, true)} style={{ background: msg.liked === true ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${msg.liked === true ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 5, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      <ThumbsUp size={10} color={msg.liked === true ? '#10b981' : '#475569'} />
                    </button>
                    <button title="Not helpful" onClick={() => likeMessage(msg.id, false)} style={{ background: msg.liked === false ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${msg.liked === false ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 5, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      <ThumbsDown size={10} color={msg.liked === false ? '#ef4444' : '#475569'} />
                    </button>
                    <button title="Copy" onClick={() => copyMessage(msg.content)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      <Copy size={10} color="#475569" />
                    </button>
                    <button title="Regenerate" onClick={regenerateLast} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      <RefreshCw size={10} color="#475569" />
                    </button>
                  </div>
                )}

                {msg.role === 'user' && (
                  <span style={{ fontSize: 10, color: '#2d3748', marginTop: 3 }}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Context-aware suggestions */}
          {!sending && messages.length < 4 && (
            <div style={{ padding: '0 12px 10px', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Suggestions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {getSuggestions().map(s => (
                  <button key={s} onClick={() => { setInput(s); inputRef.current?.focus() }} style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 7, padding: '7px 11px', fontSize: 12, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.1)' }}
                  >
                    <ChevronRight size={10} color="#6366f1" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Visual edits panel */}
          {showVisualEdits && (
            <VisualEditsPanel
              onSelect={prompt => { setInput(prompt); setTimeout(() => sendMessage(prompt), 100) }}
              onClose={() => setShowVisualEdits(false)}
            />
          )}

          {/* Input area */}
          <div style={{ padding: 10, borderTop: '1px solid rgba(99,102,241,0.08)', background: 'rgba(8,8,16,0.6)', flexShrink: 0 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Describe a change or new feature…"
                rows={2}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 13, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setShowVisualEdits(!showVisualEdits)} style={{ background: showVisualEdits ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)', border: `1px solid ${showVisualEdits ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.12)'}`, borderRadius: 6, padding: '4px 9px', fontSize: 11, color: showVisualEdits ? '#818cf8' : '#64748b', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
                    <Wand2 size={10} />Visual edits
                  </button>
                </div>
                <button onClick={() => sendMessage()} disabled={sending || !input.trim()} style={{ background: input.trim() && !sending ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.15)', border: 'none', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !sending ? 'pointer' : 'not-allowed', transition: 'all 0.15s', flexShrink: 0 }}>
                  {sending ? <Loader2 size={12} color="white" style={{ animation: 'spin .8s linear infinite' }} /> : <Send size={12} color="white" />}
                </button>
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#2d3748', marginTop: 5, textAlign: 'center' }}>Enter to send · Shift+Enter for new line</div>
          </div>
        </div>

        {/* ── Preview / Code panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: view === 'code' ? '#0d0d14' : '#13131f' }}>

          {/* Preview toolbar */}
          {view === 'preview' && (
            <div style={{ height: 40, background: 'rgba(8,8,16,0.9)', borderBottom: '1px solid rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '4px 12px', fontSize: 11, color: '#475569', maxWidth: 380, margin: '0 auto', textAlign: 'center' }}>
                forge.app/preview/{projectId}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => { const c = code; setCode(''); setTimeout(() => setCode(c), 50) }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Reload">
                  <RotateCcw size={10} color="#475569" />
                </button>
                <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Fullscreen">
                  <Maximize2 size={10} color="#475569" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflow: generating && !code ? 'hidden' : 'auto', display: 'flex', justifyContent: view === 'preview' ? 'center' : 'stretch', alignItems: view === 'preview' && viewport !== 'desktop' ? 'flex-start' : 'stretch', background: view === 'preview' ? '#13131f' : '#0d0d14' }}>
            {view === 'preview' ? (
              <div style={{ width: viewportWidth, maxWidth: '100%', height: '100%', transition: 'width 0.3s ease', boxShadow: viewport !== 'desktop' ? '0 0 80px rgba(0,0,0,0.6)' : 'none', flexShrink: 0 }}>
                <LivePreview code={code} isGenerating={generating} />
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%' }}>
                <CodePanel code={code} />
              </div>
            )}
          </div>

          {/* Status bar */}
          <div style={{ height: 28, background: 'rgba(8,8,16,0.9)', borderTop: '1px solid rgba(99,102,241,0.07)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 16, fontSize: 10, color: '#2d3748', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }} />
              <span>Live</span>
            </div>
            <span>React 18 · TypeScript · Tailwind CSS</span>
            {code && <span style={{ color: '#374151' }}>{code.split('\n').length} lines</span>}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Sparkles size={8} color="#6366f1" />
              <span style={{ color: '#6366f1' }}>Forge AI</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity: .3; transform: scale(.9) } 50% { opacity: 1; transform: scale(1.1) } }
      `}</style>
    </div>
  )
}
