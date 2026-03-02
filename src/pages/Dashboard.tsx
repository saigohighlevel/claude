import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Sparkles, Plus, Search, Globe, Clock, Star, MoreHorizontal,
  Trash2, Copy, ExternalLink, Zap, ArrowRight, Filter,
  Layout, ShoppingCart, MessageSquare, BarChart2, CheckSquare, BookOpen
} from 'lucide-react'

const PROJECT_ICONS: Record<string, typeof Layout> = {
  layout: Layout,
  shopping: ShoppingCart,
  chat: MessageSquare,
  chart: BarChart2,
  todo: CheckSquare,
  book: BookOpen,
}

const SAMPLE_PROJECTS = [
  {
    id: 'p1',
    name: 'E-commerce Store',
    desc: 'Full featured online store with cart, checkout, and order tracking',
    icon: 'shopping',
    color: '#6366f1',
    status: 'live',
    lastEdited: '2h ago',
    starred: true,
    url: 'mystore.forge.app',
  },
  {
    id: 'p2',
    name: 'Analytics Dashboard',
    desc: 'Real-time data visualization with charts, KPIs and custom reports',
    icon: 'chart',
    color: '#8b5cf6',
    status: 'live',
    lastEdited: '1d ago',
    starred: false,
    url: 'analytics.forge.app',
  },
  {
    id: 'p3',
    name: 'Team Chat App',
    desc: 'Real-time messaging with channels, threads, and file sharing',
    icon: 'chat',
    color: '#06b6d4',
    status: 'draft',
    lastEdited: '3d ago',
    starred: true,
    url: null,
  },
  {
    id: 'p4',
    name: 'SaaS Landing Page',
    desc: 'Marketing landing page with pricing, testimonials, and CTA',
    icon: 'layout',
    color: '#10b981',
    status: 'live',
    lastEdited: '1w ago',
    starred: false,
    url: 'mysaas.forge.app',
  },
  {
    id: 'p5',
    name: 'Task Manager',
    desc: 'Kanban board with drag & drop, deadlines, and team assignments',
    icon: 'todo',
    color: '#f59e0b',
    status: 'draft',
    lastEdited: '2w ago',
    starred: false,
    url: null,
  },
  {
    id: 'p6',
    name: 'Recipe Collection',
    desc: 'Browse, save, and share recipes with search and dietary filters',
    icon: 'book',
    color: '#ec4899',
    status: 'draft',
    lastEdited: '3w ago',
    starred: false,
    url: null,
  },
]

const TEMPLATES = [
  { name: 'SaaS Landing', desc: 'Hero, pricing, testimonials', color: '#6366f1', icon: 'layout' },
  { name: 'Dashboard', desc: 'Charts, tables, metrics', color: '#8b5cf6', icon: 'chart' },
  { name: 'E-commerce', desc: 'Products, cart, checkout', color: '#06b6d4', icon: 'shopping' },
  { name: 'Social App', desc: 'Feed, profiles, messages', color: '#10b981', icon: 'chat' },
]

type MenuState = { id: string; x: number; y: number } | null

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const passedPrompt = (location.state as { prompt?: string })?.prompt || ''

  const [prompt, setPrompt] = useState(passedPrompt)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'live' | 'draft' | 'starred'>('all')
  const [projects, setProjects] = useState(SAMPLE_PROJECTS)
  const [menu, setMenu] = useState<MenuState>(null)
  const [creating, setCreating] = useState(false)

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())
    if (filter === 'all') return matchSearch
    if (filter === 'live') return matchSearch && p.status === 'live'
    if (filter === 'draft') return matchSearch && p.status === 'draft'
    if (filter === 'starred') return matchSearch && p.starred
    return matchSearch
  })

  const handleCreate = async () => {
    if (!prompt.trim()) return
    setCreating(true)
    await new Promise(r => setTimeout(r, 800))
    const newId = `p${Date.now()}`
    navigate(`/builder/${newId}`, { state: { prompt } })
  }

  const toggleStar = (id: string) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, starred: !p.starred } : p))
  }

  const deleteProject = (id: string) => {
    setProjects(ps => ps.filter(p => p.id !== id))
    setMenu(null)
  }

  return (
    <div style={{
      background: '#0a0a0f', minHeight: '100vh', color: '#f1f5f9',
      display: 'flex', flexDirection: 'column',
    }}
      onClick={() => setMenu(null)}
    >
      {/* Top nav */}
      <nav style={{
        background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        padding: '0 2rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>Forge</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 8, padding: '6px 12px',
            fontSize: 13, color: '#64748b',
          }}>
            <Search size={14} />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#f1f5f9', fontSize: 13, width: 180, fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer',
          }}>
            JD
          </div>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, background: 'rgba(17,17,24,0.5)',
          borderRight: '1px solid rgba(99,102,241,0.08)',
          padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 6,
          position: 'sticky', top: 64, height: 'calc(100vh - 64px)',
        }}>
          {[
            { label: 'All projects', value: 'all' as const, count: projects.length },
            { label: 'Live', value: 'live' as const, count: projects.filter(p => p.status === 'live').length },
            { label: 'Drafts', value: 'draft' as const, count: projects.filter(p => p.status === 'draft').length },
            { label: 'Starred', value: 'starred' as const, count: projects.filter(p => p.starred).length },
          ].map(item => (
            <button key={item.value} onClick={() => setFilter(item.value)} style={{
              background: filter === item.value ? 'rgba(99,102,241,0.12)' : 'transparent',
              border: filter === item.value ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
              color: filter === item.value ? '#818cf8' : '#64748b',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              padding: '8px 12px', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.15s', fontFamily: 'inherit', textAlign: 'left',
            }}
              onMouseEnter={e => { if (filter !== item.value) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={e => { if (filter !== item.value) e.currentTarget.style.background = 'transparent' }}
            >
              <span>{item.label}</span>
              <span style={{
                background: filter === item.value ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                borderRadius: 100, padding: '1px 7px', fontSize: 11,
              }}>{item.count}</span>
            </button>
          ))}

          <div style={{ borderTop: '1px solid rgba(99,102,241,0.08)', margin: '8px 0', paddingTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: 4 }}>Templates</div>
            {TEMPLATES.map(t => {
              const Icon = PROJECT_ICONS[t.icon]
              return (
                <button key={t.name} onClick={() => {
                  setPrompt(`Build me a ${t.name}`)
                }} style={{
                  background: 'transparent', border: '1px solid transparent',
                  color: '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  padding: '7px 12px', borderRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.15s', fontFamily: 'inherit', width: '100%', textAlign: 'left',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
                >
                  <Icon size={13} color={t.color} />
                  {t.name}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
          {/* Create new project */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 20, padding: 28, marginBottom: 36,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Background orb */}
            <div style={{
              position: 'absolute', right: -40, top: -40,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={15} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Create new app</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Describe what you want to build</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{
                flex: 1,
                background: 'rgba(10,10,15,0.6)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Zap size={15} color="#6366f1" style={{ flexShrink: 0 }} />
                <input
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="Build me a task manager with drag & drop and team collaboration..."
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#f1f5f9', fontSize: 14, width: '100%', fontFamily: 'inherit',
                  }}
                />
              </div>
              <button onClick={handleCreate} disabled={creating || !prompt.trim()} style={{
                background: prompt.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.2)',
                border: 'none', color: 'white',
                cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                fontSize: 14, fontWeight: 600,
                padding: '12px 24px', borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s', fontFamily: 'inherit',
                opacity: creating ? 0.7 : 1, whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (prompt.trim() && !creating) e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = creating ? '0.7' : '1' }}
              >
                {creating ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.6s linear infinite' }} /> Building...</>
                ) : (
                  <><Plus size={16} /> New app</>
                )}
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
                {filter === 'all' ? 'All projects' : filter === 'live' ? 'Live apps' : filter === 'draft' ? 'Drafts' : 'Starred'}
              </h2>
              <p style={{ fontSize: 13, color: '#475569', margin: '2px 0 0' }}>{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={13} color="#475569" />
              <span style={{ fontSize: 12, color: '#475569' }}>Sort by last edited</span>
            </div>
          </div>

          {/* Projects grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>No projects found</div>
              <div style={{ fontSize: 13 }}>Try a different search or filter</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filtered.map(project => {
                const Icon = PROJECT_ICONS[project.icon]
                return (
                  <div key={project.id}
                    style={{
                      background: '#16161f', border: '1px solid rgba(99,102,241,0.1)',
                      borderRadius: 16, overflow: 'hidden',
                      transition: 'all 0.25s ease', cursor: 'pointer', position: 'relative',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${project.color}44`
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 30px ${project.color}18`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    onClick={() => navigate(`/builder/${project.id}`, { state: { project } })}
                  >
                    {/* Card header */}
                    <div style={{
                      height: 100, position: 'relative', overflow: 'hidden',
                      background: `linear-gradient(135deg, ${project.color}18, ${project.color}08)`,
                      borderBottom: `1px solid ${project.color}20`,
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }} />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: 52, height: 52, borderRadius: 14,
                        background: `linear-gradient(135deg, ${project.color}, ${project.color}99)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 8px 24px ${project.color}40`,
                      }}>
                        <Icon size={24} color="white" />
                      </div>
                      {/* Status badge */}
                      <div style={{
                        position: 'absolute', top: 10, left: 10,
                        background: project.status === 'live' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${project.status === 'live' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 100, padding: '3px 8px',
                        fontSize: 10, fontWeight: 600,
                        color: project.status === 'live' ? '#10b981' : '#64748b',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        {project.status === 'live' && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />}
                        {project.status === 'live' ? 'Live' : 'Draft'}
                      </div>
                      {/* Actions */}
                      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                        <button
                          onClick={e => { e.stopPropagation(); toggleStar(project.id) }}
                          style={{
                            background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 6, width: 28, height: 28, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Star size={12} fill={project.starred ? '#f59e0b' : 'transparent'} color={project.starred ? '#f59e0b' : '#64748b'} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setMenu({ id: project.id, x: e.clientX, y: e.clientY }) }}
                          style={{
                            background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 6, width: 28, height: 28, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <MoreHorizontal size={12} color="#64748b" />
                        </button>
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '16px 18px' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>{project.name}</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px', lineHeight: 1.6 }}>{project.desc}</p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569' }}>
                          <Clock size={11} />
                          {project.lastEdited}
                        </div>
                        {project.url && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 11, color: '#64748b',
                          }} onClick={e => e.stopPropagation()}>
                            <Globe size={11} />
                            {project.url}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover action bar */}
                    <div style={{
                      padding: '10px 18px', borderTop: '1px solid rgba(99,102,241,0.08)',
                      display: 'flex', gap: 8, background: 'rgba(10,10,15,0.3)',
                    }}>
                      <button style={{
                        flex: 1, background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        color: '#818cf8', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        padding: '7px', borderRadius: 8, fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                        onClick={e => { e.stopPropagation(); navigate(`/builder/${project.id}`, { state: { project } }) }}
                      >
                        <Sparkles size={12} /> Edit
                      </button>
                      {project.url && (
                        <button style={{
                          flex: 1, background: 'rgba(16,185,129,0.08)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          color: '#10b981', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          padding: '7px', borderRadius: 8, fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink size={12} /> View live
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* New project card */}
              <div
                onClick={() => document.querySelector('input')?.focus()}
                style={{
                  background: 'rgba(99,102,241,0.03)',
                  border: '2px dashed rgba(99,102,241,0.15)',
                  borderRadius: 16, minHeight: 200,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, cursor: 'pointer', transition: 'all 0.2s', color: '#475569',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'; e.currentTarget.style.background = 'rgba(99,102,241,0.03)' }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Plus size={20} color="#6366f1" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>New project</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Describe what you want to build</div>
                </div>
                <div style={{
                  fontSize: 11, color: '#6366f1', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <ArrowRight size={11} /> Start building
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Context menu */}
      {menu && (
        <div
          style={{
            position: 'fixed', top: menu.y, left: menu.x, zIndex: 200,
            background: '#1e1e2a', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 10, overflow: 'hidden', minWidth: 160,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { icon: Copy, label: 'Duplicate' },
            { icon: ExternalLink, label: 'Open' },
            { icon: Trash2, label: 'Delete', danger: true },
          ].map(item => {
            const Icon = item.icon
            return (
              <button key={item.label}
                onClick={() => { if (item.label === 'Delete') deleteProject(menu.id); else setMenu(null) }}
                style={{
                  width: '100%', background: 'transparent',
                  border: 'none', color: item.danger ? '#ef4444' : '#94a3b8',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  padding: '10px 14px', textAlign: 'left', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon size={14} /> {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
