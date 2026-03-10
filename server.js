import express from 'express'
import 'dotenv/config'
import { parse } from '@babel/parser'

const app = express()
app.use(express.json())

// ─── Photo Library (Picsum Photos — reliable, no API key needed) ───────────────
// Format: https://picsum.photos/seed/{seed}/{width}/{height}
// Seeds are deterministic — same seed always returns same image

const PHOTO_SEEDS = {
  salon: {
    hero:  'luxury-salon-interior',
    svc1:  'hairstyle-cut-stylist',
    svc2:  'hair-color-salon',
    svc3:  'barbershop-grooming',
    about: 'beauty-salon-blowout',
  },
  restaurant: {
    hero:  'fine-dining-restaurant',
    svc1:  'gourmet-food-plating',
    svc2:  'restaurant-table-candles',
    svc3:  'wine-cuisine-closeup',
    about: 'chef-kitchen-cooking',
  },
  gym: {
    hero:  'modern-gym-equipment',
    svc1:  'personal-training-session',
    svc2:  'weight-lifting-barbell',
    svc3:  'yoga-studio-class',
    about: 'running-track-athlete',
  },
  spa: {
    hero:  'spa-candles-zen-calm',
    svc1:  'massage-therapy-table',
    svc2:  'facial-skincare-treatment',
    svc3:  'yoga-meditation-wellness',
    about: 'spa-pool-tranquil',
  },
  tech: {
    hero:  'modern-open-office',
    svc1:  'team-meeting-boardroom',
    svc2:  'coding-workspace-screens',
    svc3:  'startup-collaboration',
    about: 'tech-team-startup',
  },
  realestate: {
    hero:  'luxury-home-exterior',
    svc1:  'modern-living-room',
    svc2:  'luxury-kitchen-design',
    svc3:  'pool-backyard-estate',
    about: 'real-estate-architecture',
  },
  medical: {
    hero:  'doctor-consultation',
    svc1:  'medical-clinic-reception',
    svc2:  'healthcare-team',
    svc3:  'physical-therapy',
    about: 'medical-professional-care',
  },
  generic: {
    hero:  'professional-business-modern',
    svc1:  'business-team-meeting',
    svc2:  'office-workspace-bright',
    svc3:  'productivity-laptop-desk',
    about: 'company-team-work',
  },
}

// Verified portrait seeds for testimonial avatars
const PORTRAIT_SEEDS = [
  'woman-professional-headshot',
  'woman-smiling-portrait',
  'man-professional-headshot',
]

function img(seed, w, h) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

// ─── Stage 1: Planner Prompt ──────────────────────────────────────────────────
const PLANNER_PROMPT = `You are a web design strategist. Analyze the user's request and produce a creative brief as JSON.

Return ONLY valid JSON — no markdown, no explanation, no code fences. Just the JSON object.

Available business_type values: salon, restaurant, gym, spa, tech, realestate, medical, generic

JSON schema (fill every field):
{
  "business_name": "string — specific business name (invent one if not given)",
  "business_type": "salon|restaurant|gym|spa|tech|realestate|medical|generic",
  "tagline": "string — short, emotional, specific to this business",
  "primary": "#hexcode — vivid brand color for buttons, accents",
  "accent": "#hexcode — complementary highlight color",
  "bg": "#hexcode — page background",
  "text": "#hexcode — main body text color",
  "theme": "light|dark",
  "hero_headline": "string — bold, specific, emotional (NOT generic like 'Welcome to Our Business')",
  "hero_sub": "string — 1-2 sentence value proposition",
  "hero_cta": "string — action verb + specific outcome (e.g. 'Book Your Transformation')",
  "services": [
    {"title": "string", "desc": "string — 2 sentences, specific benefits"},
    {"title": "string", "desc": "string"},
    {"title": "string", "desc": "string"}
  ],
  "about_headline": "string",
  "about_body": "string — 3 sentences, personal story and mission",
  "testimonials": [
    {"name": "string — realistic full name", "role": "string — job or city", "quote": "string — specific, emotional, authentic-sounding"},
    {"name": "string", "role": "string", "quote": "string"},
    {"name": "string", "role": "string", "quote": "string"}
  ],
  "cta_headline": "string — final section headline to drive conversion",
  "phone": "string — realistic US phone number",
  "email": "string — realistic email",
  "address": "string — realistic US address"
}

Color guidance by business type:
- salon: primary #c084fc, accent #f59e0b, bg #fdf8ff, text #1a1a2e, theme light
- restaurant: primary #b91c1c, accent #d97706, bg #0f0907, text #f5f0eb, theme dark
- gym: primary #2563eb, accent #f97316, bg #0a0f1a, text #e2e8f0, theme dark
- spa: primary #0d9488, accent #d4a855, bg #f9fdf9, text #1c2b2a, theme light
- tech: primary #6366f1, accent #06b6d4, bg #0f0f1a, text #e2e8f0, theme dark
- realestate: primary #1e3a5f, accent #ca8a04, bg #f8f6f1, text #1a1a1a, theme light
- medical: primary #0891b2, accent #2dd4bf, bg #f0fdfe, text #164e63, theme light
- generic: primary #6366f1, accent #f59e0b, bg #ffffff, text #111827, theme light

Be creative and specific. Invent a realistic, unique business name if not provided.`

// ─── Stage 2: Builder Prompt factory ─────────────────────────────────────────
function makeBuilderPrompt(plan, photos) {
  const avatars = PORTRAIT_SEEDS.map(s => img(s, 80, 80))
  const heroImg = img(photos.hero, 1920, 1080)
  const aboutImg = img(photos.about, 900, 600)
  const svcImgs = [img(photos.svc1, 800, 533), img(photos.svc2, 800, 533), img(photos.svc3, 800, 533)]

  return `You are an elite React engineer. Generate a COMPLETE, stunning landing page. You MUST output all 7 sections — do not stop early. This is the most important requirement.


## BRAND
- Name: ${plan.business_name} | Type: ${plan.business_type} | Theme: ${plan.theme}
- Primary: ${plan.primary} | Accent: ${plan.accent} | BG: ${plan.bg} | Text: ${plan.text}
- Tagline: "${plan.tagline}"

## EXACT IMAGES (use these URLs exactly — do not invent or change them)
- Hero bg: ${heroImg}
- Service 1: ${svcImgs[0]}  |  Service 2: ${svcImgs[1]}  |  Service 3: ${svcImgs[2]}
- About: ${aboutImg}
- Avatar 1: ${avatars[0]}  |  Avatar 2: ${avatars[1]}  |  Avatar 3: ${avatars[2]}

## EXACT CONTENT
- Hero H1: "${plan.hero_headline}"
- Hero sub: "${plan.hero_sub}"
- Hero CTA: "${plan.hero_cta}"
- Services: ${plan.services.map(s => `"${s.title}: ${s.desc}"`).join(' | ')}
- About headline: "${plan.about_headline}"
- About body: "${plan.about_body}"
- Testimonials: ${plan.testimonials.map(t => `${t.name} (${t.role}): "${t.quote}"`).join(' | ')}
- Final CTA: "${plan.cta_headline}"
- Contact: ${plan.phone} | ${plan.email} | ${plan.address}

## CODE RULES
- export default function App() — single file, NO imports whatsoever
- React globals already available: React, useState, useEffect, useRef, useCallback, useMemo
- Tailwind CSS (CDN) for all styling — use className
- Output the FULL component — never truncate — do not use "..." — CRITICAL

## ICONS — Use Lucide (globally available as window.lucide)
- In JSX: <i data-lucide="ICON_NAME" className="w-5 h-5 inline-block"></i>
- Call once: useEffect(() => { if (typeof lucide !== 'undefined') lucide.createIcons() }, [])
- Nav/UI: menu, x, chevron-down, arrow-right, external-link
- Contact: phone, mail, map-pin, clock, calendar
- Trust: shield, award, star, check-circle, users, trending-up, zap, sparkles
- Social: instagram, facebook, twitter, linkedin, youtube
- Business icons — use whichever fits: scissors, utensils, dumbbell, leaf, building-2, home, stethoscope, heart, flame, bolt
- NEVER use inline SVG — always use data-lucide attributes

## IMAGES
- Hero: style={{backgroundImage:'url(URL)',backgroundSize:'cover',backgroundPosition:'center',backgroundColor:'${plan.primary}'}}
- Service/About <img>: className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.opacity='0'}}
- Avatars: className="w-12 h-12 rounded-full object-cover"

## NAVIGATION (iframe environment)
- Nav anchor links: onClick={e => {e.preventDefault(); document.getElementById('section-id')?.scrollIntoView({behavior:'smooth'})}}
- Every section has matching id attribute: id="hero", id="services", id="about", id="testimonials", id="contact"
- Mobile menu: useState boolean
- No page routes

## ANIMATIONS
AOS globally available — add to scroll sections (NOT the hero):
- data-aos="fade-up" on section headers
- data-aos="fade-up" data-aos-delay="0"/"100"/"200" on service cards, testimonials
- data-aos="fade-right" on about image, data-aos="fade-left" on about text

GSAP globally available — use ONLY for hero entrance animation:
\`\`\`js
useEffect(() => {
  if (typeof gsap === 'undefined') return
  gsap.fromTo('.hero-title', {y:50,opacity:0}, {y:0,opacity:1,duration:0.9,ease:'power3.out'})
  gsap.fromTo('.hero-sub',   {y:35,opacity:0}, {y:0,opacity:1,duration:0.8,delay:0.2,ease:'power3.out'})
  gsap.fromTo('.hero-cta',   {y:25,opacity:0}, {y:0,opacity:1,duration:0.7,delay:0.4,ease:'power3.out'})
}, [])
\`\`\`

## DESIGN
- Cards: glassmorphism — backdrop-blur-xl bg-white/${plan.theme==='dark'?'5':'80'} border border-white/${plan.theme==='dark'?'10':'60'} shadow-xl
- Section H2: gradient text — style for bg gradient (primary→accent) with WebkitBackgroundClip text
- Hover: transition-all duration-300 hover:-translate-y-1 hover:shadow-xl on cards
- Service card images: overflow-hidden, img hover:scale-105 transition-transform duration-500
- Buttons: bg gradient primary→accent, rounded-full, shadow-lg, hover:shadow-xl hover:-translate-y-0.5

## 7 REQUIRED SECTIONS (ALL must be present with correct id attributes)

1. NAV (sticky, z-50, glassmorphism, logo gradient text, pill CTA, hamburger mobile, shadow on scroll)

2. HERO — id="hero" (min-h-screen, bg image NO fixed attachment)
   Structure: badge pill → h1.hero-title → p.hero-sub → div.hero-cta (buttons) → stats row
   Text color white throughout. Primary + secondary buttons.

3. SERVICES — id="services" (py-28, ${plan.bg} bg, gradient H2, 3-col grid, glassmorphism cards with image/body/explore link)

4. ABOUT — id="about" (py-28, ${plan.theme==='dark'?'#0a0a14':'#f8f8fc'} bg, 2-col flex: photo left + text right, 3 checkmarks with check-circle icons, CTA button)

5. TESTIMONIALS — id="testimonials" (py-28, ${plan.theme==='dark'?'#050510':'#f0f0f8'} bg, 3-col grid, glassmorphism cards, stars + quote + avatar)

6. CONTACT — id="contact" (py-28, ${plan.bg} bg, 2-col: form left + info right with phone/mail/map-pin Lucide icons, submit with useState success state)

7. FOOTER (always dark #0d0d18, 4-col grid: brand+social icons | services | company | contact, bottom bar © + Built with Forge ⚡)

## OUTPUT
Brief intro sentence, then complete \`\`\`tsx\\n[full component]\\n\`\`\`
MUST include all 7 sections with proper id attributes. Never stop early.`
}

// ─── Code Verification ────────────────────────────────────────────────────────

function extractCode(text) {
  const match = text.match(/```(?:tsx?|typescript|jsx?)\n([\s\S]+?)```/)
  return match ? match[1] : null
}

function verifyCode(code) {
  if (!code) return { valid: false, error: 'No code block found in the response' }

  const lines = code.split('\n').length
  if (lines < 250) {
    return { valid: false, error: `Code is too short (${lines} lines). A complete 7-section landing page should be 300+ lines. Output was likely truncated.` }
  }

  if (!/export\s+default\s+function\s+App/.test(code)) {
    return { valid: false, error: 'Missing "export default function App" — component not properly exported.' }
  }

  // Use prefix matching so id="hero-section" also passes
  const required = [
    { name: 'hero',          re: /id=["']hero/i },
    { name: 'services',      re: /id=["']services/i },
    { name: 'about',         re: /id=["']about/i },
    { name: 'testimonials',  re: /id=["']testimonials/i },
    { name: 'contact',       re: /id=["']contact/i },
    { name: 'footer',        re: /<footer|id=["']footer/i },
  ]
  const missing = required.filter(r => !r.re.test(code)).map(r => r.name)
  if (missing.length > 1) {
    return { valid: false, error: `Missing required sections: ${missing.join(', ')}. All 7 sections must be present.` }
  }

  try {
    parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] })
  } catch (e) {
    return { valid: false, error: `Syntax error: ${e.message.split('\n')[0]}` }
  }

  return { valid: true }
}

// ─── API Routes ───────────────────────────────────────────────────────────────

const isAnthropic = () => !process.env.OPENAI_API_KEY && !!process.env.ANTHROPIC_API_KEY

// Stage 1: Plan
app.post('/api/plan', async (req, res) => {
  const { message } = req.body
  try {
    let text
    if (isAnthropic()) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          system: PLANNER_PROMPT,
          messages: [{ role: 'user', content: message }],
        }),
      })
      const d = await r.json()
      text = d.content?.[0]?.text
    } else {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: PLANNER_PROMPT },
            { role: 'user', content: message },
          ],
        }),
      })
      const d = await r.json()
      text = d.choices?.[0]?.message?.content
    }

    const plan = JSON.parse(text)
    const photos = PHOTO_SEEDS[plan.business_type] || PHOTO_SEEDS.generic
    res.json({ plan, photos })
  } catch (e) {
    console.error('Plan error:', e)
    res.status(500).json({ error: String(e) })
  }
})

// ─── Streaming helper ─────────────────────────────────────────────────────────

async function streamGeneration({ model, systemPrompt, messages, isAnthropic: useAnthropic, onChunk }) {
  let fullText = ''

  if (useAnthropic) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: 16000,
        stream: true,
        system: systemPrompt,
        messages,
      }),
    })
    for await (const chunk of r.body) {
      const lines = new TextDecoder().decode(chunk).split('\n').filter(l => l.startsWith('data:'))
      for (const line of lines) {
        try {
          const j = JSON.parse(line.slice(5))
          if (j.type === 'content_block_delta' && j.delta?.text) {
            fullText += j.delta.text
            onChunk(j.delta.text)
          }
        } catch { /* ignore */ }
      }
    }
  } else {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        max_tokens: 32000,
        stream: true,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    })
    for await (const chunk of r.body) {
      const lines = new TextDecoder().decode(chunk).split('\n').filter(l => l.startsWith('data:'))
      for (const line of lines) {
        const d = line.slice(5).trim()
        if (d === '[DONE]') continue
        try {
          const j = JSON.parse(d)
          const c = j.choices?.[0]?.delta?.content
          if (c) {
            fullText += c
            onChunk(c)
          }
        } catch { /* ignore */ }
      }
    }
  }

  return fullText
}

// Stage 2: Build (agentic loop — build → verify → patch if needed)
app.post('/api/build', async (req, res) => {
  const { message, plan, photos, history = [] } = req.body
  const systemPrompt = makeBuilderPrompt(plan, photos)
  const useAnthropic = isAnthropic()

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`)

  const msgs = [
    ...history.filter(h => h.role === 'user' || h.role === 'assistant').slice(-6),
    { role: 'user', content: message },
  ]

  try {
    // ── Stage: Build ─────────────────────────────────────────────────────────
    send({ type: 'stage', stage: 'building' })

    const fullResponse = await streamGeneration({
      systemPrompt,
      messages: msgs,
      isAnthropic: useAnthropic,
      onChunk: (text) => send({ content: text }),
    })

    // ── Stage: Verify ─────────────────────────────────────────────────────────
    send({ type: 'stage', stage: 'verifying' })

    const code = extractCode(fullResponse)
    const { valid, error } = verifyCode(code)

    if (!valid) {
      console.log(`[verify] Failed: ${error} — starting patch pass`)

      // ── Stage: Patch ───────────────────────────────────────────────────────
      send({ type: 'stage', stage: 'patching' })
      send({ type: 'reset' })  // tell frontend to clear accumulated text

      const patchMessages = [
        { role: 'user', content: message },
        { role: 'assistant', content: fullResponse },
        {
          role: 'user',
          content: `The generated code has this issue: ${error}

Please regenerate the COMPLETE landing page from scratch. Requirements:
- ALL 7 sections must be present: nav, hero (id="hero"), services (id="services"), about (id="about"), testimonials (id="testimonials"), contact (id="contact"), footer
- Minimum 350 lines of complete, working TSX
- No truncation — write every section in full
- export default function App() at the end

Output only a single \`\`\`tsx code block with the full component.`,
        },
      ]

      await streamGeneration({
        systemPrompt,
        messages: patchMessages,
        isAnthropic: useAnthropic,
        onChunk: (text) => send({ content: text }),
      })
    }

    res.write('data: [DONE]\n\n')
  } catch (e) {
    console.error('Build error:', e)
    send({ error: String(e) })
  }
  res.end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server on :${PORT}`))
