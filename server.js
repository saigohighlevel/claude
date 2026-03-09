import express from 'express'
import 'dotenv/config'

const app = express()
app.use(express.json())

// ─── Verified Photo Library ───────────────────────────────────────────────────
// All IDs are verified Unsplash photos matched to their category.
// Format: https://images.unsplash.com/photo-{ID}?auto=format&fit=crop&w={w}&h={h}&q=80

const PHOTOS = {
  salon: {
    hero:  '1560066984-138dadb4c035', // salon interior, warm lighting
    svc1:  '1522337360788-8b13dee7a37e', // hairstylist at work
    svc2:  '1582095133179-bfd08e2fbee6', // hair coloring
    svc3:  '1503951914875-452162b0f3f1', // barbershop chair
    about: '1595476108010-b4d1f102b1b1', // blowout / styling
  },
  restaurant: {
    hero:  '1517248135467-4c7edcad34c4', // restaurant interior, warm
    svc1:  '1565299624946-b28f40a0ae38', // food plating
    svc2:  '1414235077428-338989a2e8c0', // fine dining table
    svc3:  '1504674900247-0877df9cc836', // dish close-up
    about: '1414235077428-338989a2e8c0', // dining scene
  },
  gym: {
    hero:  '1534438327276-14e5300c3a48', // gym floor with equipment
    svc1:  '1571019614242-c5c5dee81f9a', // personal training session
    svc2:  '1583454110551-21f2fa2afe61', // weight lifting
    svc3:  '1544367567-0f2fcb009e0b',   // yoga class
    about: '1476480862126-209bfaa8edc8', // running track
  },
  spa: {
    hero:  '1540555700478-4be290a9f948', // spa candles and calm
    svc1:  '1515377905703-c4788e51af15', // massage treatment
    svc2:  '1596178068033-bc38d7f8ef7b', // facial treatment
    svc3:  '1544367567-0f2fcb009e0b',   // yoga / mindfulness
    about: '1540555700478-4be290a9f948', // spa ambiance
  },
  tech: {
    hero:  '1497366216548-37526070297c', // modern open office
    svc1:  '1551434678-e076c223a692',   // team meeting
    svc2:  '1504384308090-c894fdcc538d', // coding workspace
    svc3:  '1522202176988-66273c2fd55f', // team collaboration
    about: '1522202176988-66273c2fd55f', // office team
  },
  realestate: {
    hero:  '1560518883-ce09059eeffa',   // luxury home exterior
    svc1:  '1570129477492-45c003edd2be', // luxury interior living room
    svc2:  '1556909114-f6e7ad7d3136',   // modern kitchen
    svc3:  '1582407947304-fd86f28320c9', // pool and backyard
    about: '1560518883-ce09059eeffa',   // property exterior
  },
  medical: {
    hero:  '1576091160550-2173dba999ef', // doctor consultation
    svc1:  '1559757175-5700dde675bc',   // clinic interior
    svc2:  '1612349317150-e413f6a5b16d', // medical team
    svc3:  '1584820927498-cfe5211fd8bf', // therapy session
    about: '1576091160550-2173dba999ef', // medical consultation
  },
  generic: {
    hero:  '1557804483-ef3f8fbf14e4',   // abstract professional
    svc1:  '1551434678-e076c223a692',   // business meeting
    svc2:  '1497366216548-37526070297c', // office environment
    svc3:  '1504384308090-c894fdcc538d', // productivity/laptop
    about: '1522202176988-66273c2fd55f', // team
  },
}

// Verified portrait photos for testimonial avatars
const PORTRAITS = [
  '1531746020798-e6953c6e8e04', // woman, professional
  '1580489944761-15a19d654956', // woman, smiling
  '1507003211169-0a1dd7228f2d', // man, professional
]

function img(id, w, h) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`
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
  const avatars = PORTRAITS.map(id => img(id, 80, 80))
  const heroImg = img(photos.hero, 1920, 1080)
  const aboutImg = img(photos.about, 900, 600)
  const svcImgs = [img(photos.svc1, 800, 533), img(photos.svc2, 800, 533), img(photos.svc3, 800, 533)]

  return `You are an elite React engineer. Generate a COMPLETE, stunning landing page. You MUST output all 7 sections — do not stop early. This is the most important requirement.


## BRAND
- Name: ${plan.business_name} | Type: ${plan.business_type} | Theme: ${plan.theme}
- Primary: ${plan.primary} | Accent: ${plan.accent} | BG: ${plan.bg} | Text: ${plan.text}
- Tagline: "${plan.tagline}"

## EXACT IMAGES (copy these URLs verbatim — do not change them)
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
- Inline SVG for icons — no icon libraries
- Output the FULL component — never truncate — do not use "..." — CRITICAL
- NO react-router, NO window.location, NO history.pushState

## NAVIGATION (iframe environment)
- Nav anchor links: onClick={e => {e.preventDefault(); document.getElementById('section-id')?.scrollIntoView({behavior:'smooth'})}}
- Every section has matching id attribute
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

## 7 REQUIRED SECTIONS

1. NAV (sticky, z-50, glassmorphism, logo gradient text, pill CTA, hamburger mobile, shadow on scroll)

2. HERO (min-h-screen, bg image NO fixed attachment — use only backgroundSize cover + backgroundPosition center)
   Structure: badge pill → h1.hero-title → p.hero-sub → div.hero-cta (buttons) → stats row
   Text color white throughout. Primary + secondary buttons.

3. SERVICES (py-28, ${plan.bg} bg, gradient H2, 3-col grid, glassmorphism cards with image/body/explore link)

4. ABOUT (py-28, ${plan.theme==='dark'?'#0a0a14':'#f8f8fc'} bg, 2-col flex: photo left + text right, 3 checkmarks, CTA button)

5. TESTIMONIALS (py-28, ${plan.theme==='dark'?'#050510':'#f0f0f8'} bg, 3-col grid, glassmorphism cards, stars + quote + avatar)

6. CONTACT (py-28, ${plan.bg} bg, 2-col: form left + info right, map placeholder, submit with useState success state)

7. FOOTER (always dark #0d0d18, 4-col grid: brand+social | services | company | contact, bottom bar © + Built with Forge ⚡)

## OUTPUT
Brief intro sentence, then complete \`\`\`tsx\\n[full component here]\\n\`\`\`
MUST include all 7 sections. Never stop early.`
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
    const photos = PHOTOS[plan.business_type] || PHOTOS.generic
    res.json({ plan, photos })
  } catch (e) {
    console.error('Plan error:', e)
    res.status(500).json({ error: String(e) })
  }
})

// Stage 2: Build (streaming SSE)
app.post('/api/build', async (req, res) => {
  const { message, plan, photos, history = [] } = req.body
  const systemPrompt = makeBuilderPrompt(plan, photos)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const msgs = [
    ...history.filter(h => h.role === 'user' || h.role === 'assistant').slice(-6),
    { role: 'user', content: message },
  ]

  try {
    if (isAnthropic()) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 16000,
          stream: true,
          system: systemPrompt,
          messages: msgs,
        }),
      })
      for await (const chunk of r.body) {
        const lines = new TextDecoder().decode(chunk).split('\n').filter(l => l.startsWith('data:'))
        for (const line of lines) {
          try {
            const j = JSON.parse(line.slice(5))
            if (j.type === 'content_block_delta' && j.delta?.text) {
              res.write(`data: ${JSON.stringify({ content: j.delta.text })}\n\n`)
            }
          } catch { /* ignore parse errors */ }
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
          model: 'gpt-4.5-preview',
          max_tokens: 16000,
          stream: true,
          messages: [{ role: 'system', content: systemPrompt }, ...msgs],
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
            if (c) res.write(`data: ${JSON.stringify({ content: c })}\n\n`)
          } catch { /* ignore */ }
        }
      }
    }
    res.write('data: [DONE]\n\n')
  } catch (e) {
    console.error('Build error:', e)
    res.write(`data: ${JSON.stringify({ error: String(e) })}\n\n`)
  }
  res.end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server on :${PORT}`))
