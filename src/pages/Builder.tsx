import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  business_name: string
  business_type: string
  tagline: string
  primary: string
  accent: string
  bg: string
  text: string
  theme: string
  hero_headline: string
  hero_sub: string
  hero_cta: string
  services: Array<{ title: string; desc: string }>
  about_headline: string
  about_body: string
  testimonials: Array<{ name: string; role: string; quote: string }>
  cta_headline: string
  phone: string
  email: string
  address: string
}

interface Message {
  id: number
  role: 'user' | 'assistant' | 'plan'
  content: string
  plan?: Plan
}

// ─── Loading HTML ─────────────────────────────────────────────────────────────

const LOADING_HTML = `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f9fafb;display:flex;align-items:center;justify-content:center;height:100vh;font-family:Inter,system-ui,sans-serif}
.wrap{text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px}
.ring{width:44px;height:44px;border-radius:50%;border:3px solid #ede9fe;border-top-color:#7c3aed;animation:spin 0.75s linear infinite}
p{color:#6b7280;font-size:14px;font-weight:500}
@keyframes spin{to{transform:rotate(360deg)}}
</style></head><body><div class="wrap"><div class="ring"></div><p>Building your website...</p></div></body></html>`

// ─── Live Preview ─────────────────────────────────────────────────────────────

function LivePreview({ code, isGenerating, viewport, onReady }: {
  code: string
  isGenerating: boolean
  viewport: number
  onReady?: (srcdoc: string) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const isNarrowed = viewport < 1024

  // Auto-resize iframe height from postMessage when in narrowed viewport
  useEffect(() => {
    if (!isNarrowed) return
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'forge-resize' && iframeRef.current) {
        const h = Math.max(Number(e.data.height) || 900, 900)
        iframeRef.current.style.height = `${h}px`
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [isNarrowed])

  useEffect(() => {
    if (!iframeRef.current) return

    // Show loading if no code yet or still generating (avoid rendering incomplete/broken TSX)
    if (!code || isGenerating) {
      clearTimeout(debounceRef.current)
      iframeRef.current.srcdoc = LOADING_HTML
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!iframeRef.current) return

      // Strip module syntax for browser execution
      const processed = code
        .replace(/^import\s+.*$/gm, '')
        .replace(/^export\s+default\s+function/gm, 'function')
        .replace(/^export\s+default\s+/gm, '')
        .replace(/^export\s+(?=const |let |var |function |class |interface |type )/gm, '')
        .replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, '')

      // Error boundary class + component code + render
      const fullCode = [
        'const { useState, useEffect, useRef, useCallback, useMemo } = React;',
        // Error boundary catches React render errors and shows them instead of blank page
        'class ErrorBoundary extends React.Component {',
        '  constructor(p){super(p);this.state={err:null}}',
        '  static getDerivedStateFromError(e){return{err:e}}',
        '  componentDidCatch(e){console.error("Preview error:",e)}',
        '  render(){',
        '    if(this.state.err)return React.createElement("div",{style:{padding:"40px",fontFamily:"Inter,sans-serif"}},',
        '      React.createElement("div",{style:{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"12px",padding:"20px"}},',
        '        React.createElement("h3",{style:{color:"#dc2626",fontSize:"14px",fontWeight:600,margin:"0 0 8px"}},"Component Error"),',
        '        React.createElement("pre",{style:{color:"#991b1b",fontSize:"12px",whiteSpace:"pre-wrap",margin:0,fontFamily:"monospace"}},this.state.err.message)',
        '      )',
        '    );',
        '    return this.props.children;',
        '  }',
        '}',
        processed,
        'const TheApp = typeof App !== "undefined" ? App : function(){return React.createElement("div",{style:{padding:"40px",fontFamily:"Inter,sans-serif",color:"#6b7280"}},"No App component found");};',
        'try {',
        '  ReactDOM.createRoot(document.getElementById("root")).render(',
        '    React.createElement(ErrorBoundary, null, React.createElement(TheApp))',
        '  );',
        '} catch(e) { showError(e.message + "\\n" + (e.stack||"")); }',
      ].join('\n')

      // JSON.stringify safely escapes all special characters
      const safeCode = JSON.stringify(fullCode)

      const sc = '<' + '/script>'
      const srcdoc = [
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>',
        '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>',
        '<link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css"/>',
        '<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js">' + sc,
        '<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js">' + sc,
        '<script src="https://unpkg.com/@babel/standalone@7.26.4/babel.min.js">' + sc,
        '<script src="https://cdn.tailwindcss.com">' + sc,
        '<script src="https://unpkg.com/aos@2.3.4/dist/aos.js">' + sc,
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js">' + sc,
        '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js">' + sc,
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>',
        '<style>',
        '*{margin:0;padding:0;box-sizing:border-box}',
        'body{font-family:"Inter",system-ui,sans-serif}',
        'html{scroll-behavior:smooth}',
        'img{max-width:100%;height:auto}',
        'a[href^="#"]{cursor:pointer}',
        '</style>',
        '</head><body><div id="root"></div><script>',
        'function showError(m){document.getElementById("root").innerHTML="<div style=\\"padding:32px;font-family:Inter,sans-serif\\"><div style=\\"background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px\\"><h3 style=\\"color:#dc2626;margin:0 0 8px;font-size:14px;font-weight:600\\">Preview Error</h3><pre style=\\"color:#991b1b;white-space:pre-wrap;font-size:12px;margin:0;font-family:monospace;line-height:1.5\\">"+m+"</pre></div></div>";}',
        'window.onerror=function(msg,src,line,col,err){showError((err&&err.stack)||msg);return true;};',
        // Auto-resize: tell parent iframe our scroll height
        'function sendHeight(){try{window.parent.postMessage({type:"forge-resize",height:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)},"*")}catch(e){}}',
        'try{',
        'var __code=' + safeCode + ';',
        'var __r=Babel.transform(__code,{presets:[["react",{runtime:"classic"}],"typescript"],filename:"App.tsx"});',
        '(0,eval)(__r.code);',
        // Init AOS + GSAP + start resize reporting after React renders
        'setTimeout(function(){',
        '  if(typeof AOS!=="undefined")AOS.init({duration:750,easing:"ease-out-cubic",once:true,offset:60});',
        '  if(typeof gsap!=="undefined")gsap.registerPlugin();',
        '  if(typeof lucide!=="undefined")lucide.createIcons();',
        '  window.scrollTo(0,0);',
        '  sendHeight();',
        '},150);',
        // Re-run createIcons when React updates the DOM (e.g. conditional renders)
        'new MutationObserver(function(){if(typeof lucide!=="undefined")lucide.createIcons()}).observe(document.getElementById("root"),{childList:true,subtree:true});',
        'setTimeout(sendHeight,700);',
        'setTimeout(function(){if(typeof lucide!=="undefined")lucide.createIcons();},800);',
        'setTimeout(sendHeight,2000);',
        'new MutationObserver(sendHeight).observe(document.body,{childList:true,subtree:true});',
        '}catch(e){showError(e.message+(e.stack?"\\n\\n"+e.stack:""));}',
        sc + '</body></html>',
      ].join('\n')

      iframeRef.current.srcdoc = srcdoc
      onReady?.(srcdoc)
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [code, isGenerating, onReady])

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: isNarrowed ? 'flex-start' : 'stretch',
      background: isNarrowed ? '#d1d5db' : '#f3f4f6',
      overflow: 'auto',
      padding: isNarrowed ? '24px' : '0',
    }}>
      <iframe
        ref={iframeRef}
        title="Preview"
        sandbox="allow-scripts allow-same-origin allow-forms"
        style={{
          width: isNarrowed ? `${viewport}px` : '100%',
          height: isNarrowed ? '900px' : '100%',
          minHeight: isNarrowed ? '900px' : '100%',
          border: 'none',
          background: 'white',
          borderRadius: isNarrowed ? 12 : 0,
          boxShadow: isNarrowed ? '0 8px 40px rgba(0,0,0,0.2)' : 'none',
          display: 'block',
          transition: 'height 0.3s ease',
        }}
      />
    </div>
  )
}

// ─── Code Panel ───────────────────────────────────────────────────────────────

function CodePanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'App.tsx'
    a.click()
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e2e' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#13131f', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', marginLeft: 6 }}>App.tsx</span>
          <span style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 4, padding: '1px 8px', fontSize: 11, color: '#a78bfa' }}>TypeScript</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copy} style={{ background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: copied ? '#34d399' : '#9ca3af', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button onClick={download} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#9ca3af', fontFamily: 'inherit' }}>
            Download
          </button>
        </div>
      </div>
      {/* Code */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <pre style={{ fontSize: 13, lineHeight: 1.75, color: '#cdd6f4', fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</pre>
      </div>
    </div>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div style={{ background: '#faf5ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '14px 16px', margin: '4px 0 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>✦</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6' }}>Plan ready</div>
          <div style={{ fontSize: 11, color: '#8b5cf6' }}>{plan.business_type} · {plan.theme} theme</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: plan.primary }} title={`Primary: ${plan.primary}`} />
          <div style={{ width: 14, height: 14, borderRadius: 3, background: plan.accent }} title={`Accent: ${plan.accent}`} />
          <div style={{ width: 14, height: 14, borderRadius: 3, background: plan.bg, border: '1px solid #e5e7eb' }} title={`BG: ${plan.bg}`} />
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 2 }}>{plan.business_name}</div>
      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 }}>{plan.tagline}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {plan.services.map(s => (
          <span key={s.title} style={{ background: '#ede9fe', color: '#6d28d9', fontSize: 11, borderRadius: 20, padding: '2px 9px', fontWeight: 500 }}>{s.title}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Generating Indicator ─────────────────────────────────────────────────────

const AGENT_STAGES: Array<{
  key: 'planning' | 'building' | 'verifying' | 'patching'
  label: string
  doneLabel: string
  sub: string
}> = [
  { key: 'planning',   label: 'Planning your website…',   doneLabel: 'Plan complete',       sub: 'Choosing layout, colors & images' },
  { key: 'building',   label: 'Building React component…', doneLabel: 'Component built',     sub: 'Generating all 7 sections' },
  { key: 'verifying',  label: 'Verifying quality…',        doneLabel: 'Quality verified',    sub: 'Checking sections & syntax' },
  { key: 'patching',   label: 'Fixing issues…',            doneLabel: 'Issues resolved',     sub: 'Regenerating from context' },
]

function GeneratingIndicator({ stage }: { stage: 'planning' | 'building' | 'verifying' | 'patching' }) {
  const currentIdx = AGENT_STAGES.findIndex(s => s.key === stage)
  const spinner = { width: 20, height: 20, borderRadius: '50%', border: '2.5px solid #ede9fe', borderTopColor: '#7c3aed', animation: 'forge-spin 0.75s linear infinite', flexShrink: 0 } as const
  const check = { width: 20, height: 20, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, color: 'white' } as const

  return (
    <div style={{ background: '#faf5ff', border: '1px solid #ede9fe', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {AGENT_STAGES.map((s, i) => {
        // Only show stages up to and including current (don't reveal future stages)
        if (i > currentIdx) return null
        const isActive = i === currentIdx
        const isDone = i < currentIdx
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isDone ? <div style={check}>✓</div> : <div style={spinner} />}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#5b21b6' : '#7c3aed' }}>
                {isDone ? s.doneLabel : s.label}
              </div>
              {isActive && <div style={{ fontSize: 11, color: '#8b5cf6', marginTop: 1 }}>{s.sub}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  'Make the hero more dramatic',
  'Add dark mode toggle',
  'Improve mobile layout',
  'Add an FAQ section',
  'Make the pricing section pop',
  'Add a gallery section',
]

// ─── Main Builder Component ───────────────────────────────────────────────────

export default function Builder() {
  const navigate = useNavigate()

  const [view, setView] = useState<'preview' | 'code'>('preview')
  const [viewport, setViewport] = useState(1024)
  const [messages, setMessages] = useState<Message[]>(() => {
    const p = sessionStorage.getItem('buildPrompt')
      || 'Build a website for a premium hair salon called "Luxe & Flow" in Miami Beach — specializing in cuts, color, and bridal styling'
    return [{ id: Date.now(), role: 'user', content: p }]
  })
  const [code, setCode] = useState('')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [photos, setPhotos] = useState<Record<string, string> | null>(null)
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [genStage, setGenStage] = useState<'planning' | 'building' | 'verifying' | 'patching'>('planning')
  const [deployed, setDeployed] = useState(false)
  const [deployUrl, setDeployUrl] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasAutoGenerated = useRef(false)
  const planRef = useRef<Plan | null>(null)
  const photosRef = useRef<Record<string, string> | null>(null)
  const srcdocRef = useRef('')

  // Keep refs in sync
  useEffect(() => { planRef.current = plan }, [plan])
  useEffect(() => { photosRef.current = photos }, [photos])

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  // Override body background for light theme
  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = '#f9fafb'
    return () => { document.body.style.background = prev }
  }, [])

  const generate = async (
    userMessage: string,
    existingPlan: Plan | null,
    existingPhotos: Record<string, string> | null,
    history: Message[]
  ) => {
    setIsGenerating(true)
    let activePlan = existingPlan
    let activePhotos = existingPhotos

    // Stage 1: Plan (only on first message)
    if (!activePlan) {
      setGenStage('planning')
      try {
        const r = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage }),
        })
        const data = await r.json()
        activePlan = data.plan
        activePhotos = data.photos
        setPlan(data.plan)
        setPhotos(data.photos)
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'plan',
          content: '',
          plan: data.plan,
        }])
      } catch (e) {
        console.error('Plan failed:', e)
        setIsGenerating(false)
        return
      }
    }

    // Stage 2: Build (streaming)
    setGenStage('building')
    const aiMsgId = Date.now() + 2
    setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }])

    try {
      const buildHistory = history
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      const r = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          plan: activePlan,
          photos: activePhotos,
          history: buildHistory,
        }),
      })

      const reader = r.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        for (const line of text.split('\n')) {
          if (!line.startsWith('data:')) continue
          const d = line.slice(5).trim()
          if (d === '[DONE]') continue
          try {
            const j = JSON.parse(d)
            if (j.type === 'stage') {
              setGenStage(j.stage)
            } else if (j.type === 'reset') {
              // Patch pass starting — clear accumulated so we extract fresh code
              accumulated = ''
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: '' } : m))
            } else if (j.content) {
              accumulated += j.content
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m))
              // Extract code — match any language identifier (tsx, typescript, jsx, etc.)
              const match = accumulated.match(/```\w*\n([\s\S]+?)(?:```|$)/)
              if (match) setCode(match[1])
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error('Build failed:', e)
    }

    setIsGenerating(false)
  }

  // Auto-generate on first load
  useEffect(() => {
    if (hasAutoGenerated.current) return
    hasAutoGenerated.current = true
    sessionStorage.removeItem('buildPrompt')
    const prompt = messages[0]?.content || ''
    if (prompt) generate(prompt, null, null, [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = () => {
    const msg = input.trim()
    if (!msg || isGenerating) return
    setInput('')
    const userMsg: Message = { id: Date.now(), role: 'user', content: msg }
    const currentMessages = [...messages, userMsg]
    setMessages(currentMessages)
    generate(msg, planRef.current, photosRef.current, currentMessages)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleDeploy = () => {
    setDeployed(true)
    const slug = plan?.business_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'my-site'
    setDeployUrl(`https://${slug}-${Math.random().toString(36).slice(2, 6)}.forge.app`)
  }

  const getDescription = (content: string) => {
    const before = content.split('```')[0].trim()
    return before || null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header style={{ height: 52, background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, flexShrink: 0, zIndex: 20 }}>
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '6px 8px', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Forge
        </button>

        <div style={{ width: 1, height: 18, background: '#e5e7eb' }} />

        {/* Project name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {plan?.business_name || 'New Project'}
          </div>
          {plan && (
            <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1 }}>
              {plan.business_type} · {plan.theme} theme
            </div>
          )}
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2 }}>
          {([['preview', '▶ Preview'], ['code', '{ } Code']] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{ padding: '5px 13px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', background: view === v ? 'white' : 'transparent', color: view === v ? '#111827' : '#6b7280', boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Deploy */}
        {deployed ? (
          <a
            href={deployUrl}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, color: '#7c3aed', textDecoration: 'none', background: '#f3f0ff', padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd6fe', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            ↗ {deployUrl.replace('https://', '')}
          </a>
        ) : (
          <button
            onClick={handleDeploy}
            disabled={!code || isGenerating}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: code && !isGenerating ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : '#e5e7eb', color: code && !isGenerating ? 'white' : '#9ca3af', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: code && !isGenerating ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            Deploy
          </button>
        )}
      </header>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left: Chat ─────────────────────────────────────────────────────── */}
        <aside style={{ width: 360, background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map(msg => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <div style={{ maxWidth: '88%', background: '#7c3aed', color: 'white', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', fontSize: 14, lineHeight: 1.55 }}>
                      {msg.content}
                    </div>
                  </div>
                )
              }

              if (msg.role === 'plan' && msg.plan) {
                return <PlanCard key={msg.id} plan={msg.plan} />
              }

              if (msg.role === 'assistant') {
                const desc = getDescription(msg.content)
                const hasCode = msg.content.includes('```')
                return (
                  <div key={msg.id} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginTop: 2 }}>✦</div>
                    <div style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
                      {hasCode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: desc ? 6 : 0 }}>
                          <div style={{ width: 17, height: 17, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#059669', flexShrink: 0 }}>✓</div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>Generated successfully</span>
                        </div>
                      )}
                      {desc && <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{desc}</p>}
                      {!desc && !hasCode && <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>Writing...</p>}
                    </div>
                  </div>
                )
              }

              return null
            })}

            {isGenerating && <GeneratingIndicator stage={genStage} />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {!isGenerating && code && (
            <div style={{ padding: '8px 16px 4px', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {QUICK_ACTIONS.slice(0, 4).map(action => (
                  <button
                    key={action}
                    onClick={() => { setInput(action); inputRef.current?.focus() }}
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.borderColor = '#c4b5fd' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
            <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '10px 12px', display: 'flex', gap: 8, transition: 'border-color 0.2s' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={e => (e.currentTarget.closest('div')!.style.borderColor = '#c4b5fd')}
                onBlur={e => (e.currentTarget.closest('div')!.style.borderColor = '#e5e7eb')}
                placeholder={isGenerating ? 'Generating…' : 'Describe a change or new feature…'}
                disabled={isGenerating}
                rows={2}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: 13, color: '#374151', fontFamily: 'inherit', lineHeight: 1.55, opacity: isGenerating ? 0.5 : 1 }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isGenerating}
                style={{ alignSelf: 'flex-end', width: 32, height: 32, borderRadius: 8, background: input.trim() && !isGenerating ? '#7c3aed' : '#e5e7eb', border: 'none', cursor: input.trim() && !isGenerating ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !isGenerating ? 'white' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 6 }}>Enter to send · Shift+Enter for new line</div>
          </div>
        </aside>

        {/* ── Right: Preview / Code ───────────────────────────────────────────── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Viewport controls */}
          {view === 'preview' && (
            <div style={{ height: 44, background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 6, flexShrink: 0 }}>
              {([
                { label: 'Desktop', w: '100%', size: 1024 },
                { label: 'Tablet', w: '768px', size: 768 },
                { label: 'Mobile', w: '390px', size: 390 },
              ] as const).map(({ label, size }) => (
                <button
                  key={size}
                  onClick={() => setViewport(size)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: `1.5px solid ${viewport === size ? '#c4b5fd' : '#e5e7eb'}`, borderRadius: 7, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', background: viewport === size ? '#f3f0ff' : 'white', color: viewport === size ? '#7c3aed' : '#6b7280', fontWeight: viewport === size ? 600 : 400, transition: 'all 0.15s' }}
                >
                  {label}
                </button>
              ))}

              {code && (
                <button
                  onClick={() => {
                    const html = srcdocRef.current
                    if (!html) return
                    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
                    window.open(url)
                    setTimeout(() => URL.revokeObjectURL(url), 60_000)
                  }}
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', background: 'white', color: '#6b7280', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#111827'; e.currentTarget.style.borderColor = '#d1d5db' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Open
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {view === 'preview'
              ? <LivePreview code={code} isGenerating={isGenerating} viewport={viewport} onReady={s => { srcdocRef.current = s }} />
              : <CodePanel code={code} />
            }
          </div>

          {/* Status bar */}
          <div style={{ height: 24, background: '#5b21b6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
              <span>⚡ React 18 · Tailwind · TypeScript</span>
              {plan && <span>· {plan.business_type}</span>}
            </div>
            {code && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{code.split('\n').length} lines</span>}
          </div>
        </main>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes forge-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
