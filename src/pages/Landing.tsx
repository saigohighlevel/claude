import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import {
  Sparkles, ArrowRight, Zap, Code2, Globe, Layers,
  GitBranch, Play, CheckCircle, ChevronRight, Star,
  MessageSquare, Eye, Cpu, Lock, Rocket
} from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
}

const fadeUpStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const inView = { once: true, margin: '-80px' }

const PROMPTS = [
  'Build me a SaaS landing page with pricing tables...',
  'Create a real-time chat application with rooms...',
  'Make a Kanban board with drag and drop...',
  'Build an e-commerce store with cart and checkout...',
  'Create a dashboard with charts and analytics...',
  'Make a recipe app with search and favorites...',
]

const FEATURES = [
  {
    icon: Cpu,
    title: 'AI-Powered Generation',
    desc: 'Describe what you want in plain English. Our AI understands your intent and builds production-ready code instantly.',
    color: '#7c3aed',
  },
  {
    icon: Eye,
    title: 'Live Preview',
    desc: 'See your app come to life in real-time. Every change is instantly reflected in the preview pane as you iterate.',
    color: '#8b5cf6',
  },
  {
    icon: Code2,
    title: 'Full Code Access',
    desc: 'Your code, your rules. Export clean, maintainable TypeScript and React code that you can take anywhere.',
    color: '#06b6d4',
  },
  {
    icon: Globe,
    title: 'One-Click Deploy',
    desc: 'Go from idea to live URL in seconds. Deploy to our global CDN or connect your own hosting provider.',
    color: '#10b981',
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    desc: 'Built-in Git integration. Every iteration is saved so you can always roll back to any previous version.',
    color: '#f59e0b',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    desc: 'SOC2 compliant with end-to-end encryption. Your ideas and code are always private and secure.',
    color: '#ec4899',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Founder @ Dataflow',
    avatar: 'SC',
    color: '#7c3aed',
    stars: 5,
    text: 'I built and launched my SaaS MVP in 3 days using Forge. What would have taken months with a dev team took a weekend. Absolutely mind-blowing.',
  },
  {
    name: 'Marcus Webb',
    role: 'Product Manager @ Stripe',
    avatar: 'MW',
    color: '#8b5cf6',
    stars: 5,
    text: "The quality of the generated code is incredible. It's not just a prototype — it's production-ready React with TypeScript, hooks, everything.",
  },
  {
    name: 'Aisha Patel',
    role: 'Designer & Indie Hacker',
    avatar: 'AP',
    color: '#06b6d4',
    stars: 5,
    text: "As a designer who can't code, Forge changed everything for me. I can now ship my ideas without depending on developers. Game changer.",
  },
]

const STEPS = [
  { num: '01', title: 'Describe your idea', desc: 'Type what you want to build in natural language. Be as detailed or as vague as you like.' },
  { num: '02', title: 'AI builds it instantly', desc: 'Watch as the AI generates your full application — UI, logic, and data — in real time.' },
  { num: '03', title: 'Refine with chat', desc: 'Ask for changes, tweaks, or new features in plain English. Iterate as many times as you need.' },
  { num: '04', title: 'Deploy & share', desc: 'Publish your app with one click. Share the URL with the world or export the code.' },
]

function TypewriterPrompt() {
  const [text, setText] = useState('')
  const [promptIdx, setPromptIdx] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pause' | 'erasing'>('typing')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const current = PROMPTS[promptIdx]

    if (phase === 'typing') {
      if (text.length < current.length) {
        timeoutRef.current = setTimeout(() => setText(current.slice(0, text.length + 1)), 45)
      } else {
        timeoutRef.current = setTimeout(() => setPhase('pause'), 2200)
      }
    } else if (phase === 'pause') {
      timeoutRef.current = setTimeout(() => setPhase('erasing'), 400)
    } else if (phase === 'erasing') {
      if (text.length > 0) {
        timeoutRef.current = setTimeout(() => setText(text.slice(0, -1)), 22)
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPromptIdx((i) => (i + 1) % PROMPTS.length)
        setPhase('typing')
      }
    }

    return () => clearTimeout(timeoutRef.current)
  }, [text, phase, promptIdx])

  return (
    <span style={{ color: '#9ca3af' }}>
      {text}
      <span style={{ borderRight: '2px solid #7c3aed', marginLeft: 1, animation: 'blink 1s step-end infinite' }}>&nbsp;</span>
    </span>
  )
}

function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(100px)',
      pointerEvents: 'none',
      ...style,
    }} />
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [heroInput, setHeroInput] = useState('')

  // Override body background for light theme
  useEffect(() => {
    const prevBg = document.body.style.background
    const prevColor = document.body.style.color
    document.body.style.background = '#ffffff'
    document.body.style.color = '#111827'
    return () => { document.body.style.background = prevBg; document.body.style.color = prevColor }
  }, [])

  const handleStart = (prompt?: string) => {
    const p = prompt || heroInput
    if (p.trim()) {
      sessionStorage.setItem('buildPrompt', p.trim())
      navigate(`/builder/p${Date.now()}`)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111827', overflow: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '0 2rem',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: '#111827' }}>Forge</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: 14, color: '#6b7280' }}>
          {['Features', 'Showcase', 'Pricing', 'Docs'].map(item => (
            <a key={item} href="#" style={{
              color: '#6b7280', textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
            >{item}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'transparent', border: 'none', color: '#6b7280',
            cursor: 'pointer', fontSize: 14, fontWeight: 500,
            padding: '0.5rem 1rem', borderRadius: 8,
            transition: 'color 0.2s', fontFamily: 'inherit',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
          >
            Sign in
          </button>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: 'none', color: 'white',
            cursor: 'pointer', fontSize: 14, fontWeight: 600,
            padding: '0.5rem 1.25rem', borderRadius: 8,
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Get started free <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: 160, paddingBottom: 120, textAlign: 'center', overflow: 'hidden' }}>
        {/* Background orbs — very subtle on white */}
        <Orb style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', top: -150, left: '50%', transform: 'translateX(-50%)' }} />
        <Orb style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', top: 200, left: '15%', animation: 'orb1 12s ease-in-out infinite' }} />
        <Orb style={{ width: 350, height: 350, background: 'radial-gradient(circle, rgba(236,72,153,0.03) 0%, transparent 70%)', top: 100, right: '10%', animation: 'orb2 15s ease-in-out infinite' }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
        }} />

        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto', padding: '0 2rem' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 32,
            animation: 'fadeUp 0.6s ease forwards',
          }}>
            <Zap size={13} color="#7c3aed" />
            <span style={{ fontSize: 13, color: '#7c3aed', fontWeight: 500 }}>AI-powered app builder — now in public beta</span>
            <ChevronRight size={13} color="#7c3aed" />
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-0.04em', marginBottom: 24,
            animation: 'fadeUp 0.6s 0.1s ease both',
            color: '#111827',
          }}>
            Build real apps
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #ec4899 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              in minutes, not months
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#6b7280', maxWidth: 560, margin: '0 auto 48px',
            lineHeight: 1.7, animation: 'fadeUp 0.6s 0.2s ease both',
          }}>
            Describe your app in plain English. Forge's AI builds production-ready React apps with real functionality — no templates, no drag-and-drop.
          </p>

          {/* Hero input */}
          <div style={{
            maxWidth: 680, margin: '0 auto 48px',
            animation: 'fadeUp 0.6s 0.3s ease both',
          }}>
            <div style={{
              background: '#ffffff',
              border: '1.5px solid rgba(0,0,0,0.1)',
              borderRadius: 16,
              padding: 6,
              display: 'flex', gap: 8,
              boxShadow: '0 4px 24px rgba(124,58,237,0.08), 0 1px 3px rgba(0,0,0,0.06)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
              onFocus={() => {}}
            >
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
                <MessageSquare size={16} color="#7c3aed" style={{ flexShrink: 0, marginRight: 10 }} />
                {heroInput === '' ? (
                  <div style={{ position: 'absolute', left: 42, right: 16, pointerEvents: 'none', fontSize: 15 }}>
                    <TypewriterPrompt />
                  </div>
                ) : null}
                <input
                  value={heroInput}
                  onChange={e => setHeroInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#111827', fontSize: 15, width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <button
                onClick={() => handleStart()}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  border: 'none', color: 'white',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  padding: '12px 24px', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 8,
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                  flexShrink: 0, fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <Sparkles size={15} />
                Build it
              </button>
            </div>

            {/* Quick prompts */}
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {['Todo app', 'Landing page', 'E-commerce', 'Chat app', 'Dashboard'].map(p => (
                <button key={p} onClick={() => handleStart(p)} style={{
                  background: 'rgba(124,58,237,0.04)',
                  border: '1px solid rgba(124,58,237,0.12)',
                  color: '#6b7280', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  padding: '6px 14px', borderRadius: 100,
                  transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.04)'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.12)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, animation: 'fadeUp 0.6s 0.4s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex' }}>
                {['#7c3aed', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'].map((c, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: c, border: '2px solid #ffffff',
                    marginLeft: i > 0 ? -8 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: 'white', fontWeight: 700,
                  }}>
                    {['S', 'M', 'A', 'J', 'K'][i]}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                <strong style={{ color: '#111827' }}>12,000+</strong> builders already shipping
              </span>
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
              ))}
              <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Hero preview mockup */}
        <div style={{
          maxWidth: 1100, margin: '80px auto 0', padding: '0 2rem',
          animation: 'fadeUp 0.8s 0.5s ease both',
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,0.12), 0 0 40px rgba(124,58,237,0.04)',
          }}>
            {/* Window chrome */}
            <div style={{
              background: '#f9fafb',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, background: 'rgba(0,0,0,0.04)',
                borderRadius: 8, padding: '6px 16px',
                fontSize: 12, color: '#9ca3af', textAlign: 'center',
              }}>
                forge.app / preview / my-saas-app
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: 6, padding: '4px 12px',
                  fontSize: 11, color: '#7c3aed', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Play size={10} fill="#7c3aed" /> Preview
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  borderRadius: 6, padding: '4px 12px',
                  fontSize: 11, color: 'white', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Rocket size={10} /> Deploy
                </div>
              </div>
            </div>

            {/* App layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', height: 460 }}>
              {/* Chat panel */}
              <div style={{
                borderRight: '1px solid rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column',
                background: '#ffffff',
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={14} color="#7c3aed" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Forge AI</span>
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                </div>
                <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'hidden' }}>
                  {/* AI message */}
                  <div style={{
                    background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '12px 12px 12px 4px', padding: '10px 14px',
                    fontSize: 12, color: '#6b7280', lineHeight: 1.6,
                  }}>
                    I've built your SaaS landing page! It includes a hero section, features grid, pricing cards, and a CTA. What would you like to change?
                  </div>
                  {/* User message */}
                  <div style={{
                    background: '#7c3aed',
                    borderRadius: '12px 12px 4px 12px', padding: '10px 14px',
                    fontSize: 12, color: 'white', lineHeight: 1.6,
                    alignSelf: 'flex-end', maxWidth: '85%',
                  }}>
                    Make the pricing section dark and add a "Most popular" badge to the Pro plan
                  </div>
                  {/* AI typing indicator */}
                  <div style={{
                    background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '12px 12px 12px 4px', padding: '10px 14px',
                    display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#7c3aed',
                        animation: `pulse-ring 1.2s ${d}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                </div>
                {/* Input */}
                <div style={{
                  padding: 12, borderTop: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex', gap: 8,
                }}>
                  <div style={{
                    flex: 1, background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#9ca3af',
                  }}>
                    Describe a change...
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    borderRadius: 10, padding: '8px 12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <ArrowRight size={14} color="white" />
                  </div>
                </div>
              </div>

              {/* Preview panel */}
              <div style={{ background: '#f3f4f6', overflow: 'hidden', position: 'relative' }}>
                {/* Fake website preview — keep this dark to show contrast */}
                <div style={{ background: '#0f172a', height: '100%', overflow: 'hidden' }}>
                  {/* Fake nav */}
                  <div style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>MySaaS</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {['Features', 'Pricing', 'Blog'].map(i => (
                        <span key={i} style={{ fontSize: 10, color: '#64748b' }}>{i}</span>
                      ))}
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: 6, padding: '4px 12px', fontSize: 10, color: 'white', fontWeight: 600 }}>
                      Get started
                    </div>
                  </div>
                  {/* Fake hero */}
                  <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#a78bfa', marginBottom: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 100, display: 'inline-block', padding: '3px 10px' }}>Now in beta</div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '10px 0 8px', lineHeight: 1.2 }}>
                      The platform that<br />
                      <span style={{ background: 'linear-gradient(135deg, #a78bfa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>scales with you</span>
                    </h2>
                    <p style={{ fontSize: 10, color: '#64748b', marginBottom: 16, lineHeight: 1.6 }}>
                      Automate your workflow, collaborate with your team, and ship faster than ever before.
                    </p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: 8, padding: '6px 14px', fontSize: 10, color: 'white', fontWeight: 600 }}>Start free trial</div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', fontSize: 10, color: 'white' }}>Live demo</div>
                    </div>
                  </div>
                  {/* Fake pricing cards */}
                  <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { name: 'Starter', price: '$9', color: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
                      { name: 'Pro', price: '$29', color: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.35)', badge: true },
                      { name: 'Enterprise', price: '$99', color: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
                    ].map(p => (
                      <div key={p.name} style={{
                        background: p.color, border: `1px solid ${p.border}`,
                        borderRadius: 10, padding: 10, position: 'relative',
                      }}>
                        {p.badge && (
                          <div style={{
                            position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                            borderRadius: 100, padding: '2px 8px', fontSize: 8, color: 'white', fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}>Most popular</div>
                        )}
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'white', marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 4 }}>{p.price}<span style={{ fontSize: 9, color: '#64748b' }}>/mo</span></div>
                        {[...Array(3)].map((_, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                            <CheckCircle size={7} color="#10b981" />
                            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, flex: 1 }} />
                          </div>
                        ))}
                        <div style={{ background: p.badge ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px', fontSize: 9, color: 'white', textAlign: 'center', marginTop: 6, fontWeight: 600 }}>
                          Get started
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '100px 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div style={{ textAlign: 'center', marginBottom: 64 }}
          initial="hidden" whileInView="show" viewport={inView} variants={fadeUp}>
          <div style={{
            display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#7c3aed',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>How it works</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#111827' }}>
            From idea to live app
            <br /><span style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>in four steps</span>
          </h2>
        </motion.div>

        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative' }}
          initial="hidden" whileInView="show" viewport={inView} variants={fadeUpStagger}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute', top: 40, left: '12.5%', right: '12.5%', height: 1,
            background: 'linear-gradient(90deg, rgba(124,58,237,0.08), rgba(124,58,237,0.25), rgba(124,58,237,0.08))',
          }} />

          {STEPS.map((step) => (
            <motion.div key={step.num} variants={fadeUp} style={{ textAlign: 'center', padding: '0 12px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(124,58,237,0.06)',
                border: '2px solid rgba(124,58,237,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 14, fontWeight: 800, color: '#7c3aed',
                position: 'relative', zIndex: 1,
                backdropFilter: 'blur(10px)',
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#111827' }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 2rem', maxWidth: 1100, margin: '0 auto', background: '#f9fafb', borderRadius: 24 }} id="features">
        <motion.div style={{ textAlign: 'center', marginBottom: 64 }}
          initial="hidden" whileInView="show" viewport={inView} variants={fadeUp}>
          <div style={{
            display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#7c3aed',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Features</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#111827' }}>
            Everything you need to
            <br /><span style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>build and ship</span>
          </h2>
        </motion.div>

        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
          initial="hidden" whileInView="show" viewport={inView} variants={fadeUpStagger}>
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <motion.div key={f.title} variants={fadeUp}
                whileHover={{ y: -5, boxShadow: `0 12px 40px ${f.color}18`, borderColor: `${f.color}30` }}
                style={{
                  background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 16, padding: 28, cursor: 'default',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${f.color}10`, border: `1px solid ${f.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={20} color={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div style={{ textAlign: 'center', marginBottom: 64 }}
          initial="hidden" whileInView="show" viewport={inView} variants={fadeUp}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#111827' }}>
            Loved by builders
          </h2>
        </motion.div>
        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
          initial="hidden" whileInView="show" viewport={inView} variants={fadeUpStagger}>
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} variants={fadeUp} whileHover={{ y: -4 }} style={{
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 16, padding: 28,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: 'white',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section style={{ padding: '100px 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', background: '#f9fafb', borderRadius: 24, margin: '0 2rem' }}
        initial="hidden" whileInView="show" viewport={inView} variants={fadeUp}>
        <Orb style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 20, lineHeight: 1.1, color: '#111827' }}>
            Start building your
            <br /><span style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>dream app today</span>
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 40, lineHeight: 1.7 }}>
            Free to start. No credit card required.<br />Deploy your first app in minutes.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              border: 'none', color: 'white',
              cursor: 'pointer', fontSize: 15, fontWeight: 700,
              padding: '14px 32px', borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 40px rgba(124,58,237,0.2)',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 60px rgba(124,58,237,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(124,58,237,0.2)' }}
            >
              <Sparkles size={18} /> Build something amazing
            </button>
            <button style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              color: '#7c3aed', cursor: 'pointer', fontSize: 15, fontWeight: 600,
              padding: '14px 32px', borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.06)' }}
            >
              <Layers size={16} /> View showcase
            </button>
          </div>

          {/* Checklist */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            {['No credit card', 'Free tier forever', 'Deploy in minutes', 'Cancel anytime'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={14} color="#10b981" />
                <span style={{ fontSize: 13, color: '#6b7280' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(0,0,0,0.06)',
        padding: '40px 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1100, margin: '0 auto',
        flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={13} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: '#111827' }}>Forge</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: 13, color: '#9ca3af' }}>
          {['Privacy', 'Terms', 'Security', 'Status', 'Blog'].map(item => (
            <a key={item} href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6b7280')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >{item}</a>
          ))}
        </div>
        <div style={{ fontSize: 13, color: '#9ca3af' }}>© 2025 Forge. All rights reserved.</div>
      </footer>
    </div>
  )
}
