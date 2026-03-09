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

  return `You are an elite React engineer. Build a stunning, production-quality landing page — the kind a $15,000 design agency would deliver.

## BUSINESS
Name: ${plan.business_name}
Type: ${plan.business_type}
Tagline: "${plan.tagline}"
Theme: ${plan.theme}

## DESIGN SYSTEM — exact values only
Primary: ${plan.primary}
Accent: ${plan.accent}
Background: ${plan.bg}
Text: ${plan.text}

## IMAGES — use THESE EXACT URLs verbatim. No substitutions, no placeholders.
Hero background:      ${heroImg}
Service card 1 image: ${svcImgs[0]}
Service card 2 image: ${svcImgs[1]}
Service card 3 image: ${svcImgs[2]}
About section photo:  ${aboutImg}
Testimonial avatar 1: ${avatars[0]}
Testimonial avatar 2: ${avatars[1]}
Testimonial avatar 3: ${avatars[2]}

## CONTENT — use word-for-word
Hero headline: "${plan.hero_headline}"
Hero subheadline: "${plan.hero_sub}"
Primary CTA: "${plan.hero_cta}"
Services:
${plan.services.map((s, i) => `  ${i + 1}. ${s.title}: ${s.desc}`).join('\n')}
About headline: "${plan.about_headline}"
About body: "${plan.about_body}"
Testimonials:
${plan.testimonials.map((t, i) => `  ${i + 1}. ${t.name} (${t.role}): "${t.quote}"`).join('\n')}
Final CTA: "${plan.cta_headline}"
Contact: ${plan.phone} | ${plan.email} | ${plan.address}

## CODE RULES
- Single file: export default function App()
- React hooks: useState, useEffect, useRef, useCallback, useMemo — NO other imports at all
- Tailwind CSS classes (CDN, all classes work)
- All icons must be inline SVG — no icon library imports
- Complete output — never truncate, never use "..." or comments like "rest of code here"
- NEVER import or use react-router-dom, react-router, next/link, or any routing library
- NEVER use window.location, history.pushState, or any URL navigation APIs

## NAVIGATION RULES (critical — iframe environment)
- ALL nav links MUST be anchor hrefs: <a href="#section-id"> — never use page paths like "/about"
- Every section must have a matching id: e.g. <section id="services"> paired with <a href="#services">
- For smooth scroll: use onClick with scrollIntoView or rely on CSS html{scroll-behavior:smooth}
- Tab/filter switching: use React useState only — never navigate away from the page
- Mobile menu toggle: use useState boolean, no routing involved

## 7 REQUIRED SECTIONS (all mandatory, in order)

### 1. STICKY NAV
- position sticky top-0 z-50, backdrop-filter blur(12px)
- ${plan.theme === 'dark' ? 'background: rgba(15,15,26,0.85)' : 'background: rgba(255,255,255,0.85)'}, border-bottom 1px solid (${plan.theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'})
- Logo (business name bold), nav links, CTA button (primary bg, pill shape)
- Mobile hamburger that works via useState, reveals nav links vertically

### 2. HERO (minHeight 100vh)
- CSS: backgroundImage 'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 100%), url(${heroImg})', backgroundSize cover, backgroundPosition center
- Centered column: maxWidth 760px, padding 24px, textAlign center
- H1: clamp(2.8rem, 5.5vw, 5rem) fontSize, fontWeight 800, letterSpacing -0.03em, color white, lineHeight 1.1
- Subheadline: 1.15rem, rgba(255,255,255,0.82), marginTop 20px, lineHeight 1.7
- Two buttons row: primary solid (${plan.primary} bg, white text, paddingY 14px, paddingX 32px, borderRadius 50px, fontWeight 600), secondary (transparent bg, 2px solid rgba(255,255,255,0.55), white text)
- Stats row below buttons: "500+ Happy Clients · ★ 4.9 / 5 · Since 2015" — fontSize 0.875rem, rgba(255,255,255,0.65), marginTop 32px

### 3. SERVICES (3 cards)
- Section paddingTop 96px, paddingBottom 96px, background ${plan.bg}
- Centered label (uppercase, tracking-widest, 0.75rem, ${plan.primary}), H2 (2.5rem bold, ${plan.text}), subtitle (1rem, muted, maxWidth 560px centered)
- Grid: gridTemplateColumns repeat(auto-fit,minmax(300px,1fr)), gap 28px, maxWidth 1200px, margin 56px auto 0
- Each card: overflow hidden, borderRadius 14px, boxShadow '0 4px 20px rgba(0,0,0,0.08)', border '1px solid rgba(0,0,0,0.06)', transition 'all 0.25s ease'
  - Image: width 100%, height 220px, objectFit cover — use svcImgs above
  - Body: padding 28px
  - SVG icon (28px, ${plan.primary}), h3 1.15rem fontWeight 700, p 0.925rem color muted lineHeight 1.6, "Learn more →" link in ${plan.primary}
  - Hover: translateY(-5px), boxShadow '0 16px 44px rgba(0,0,0,0.14)'

### 4. ABOUT (two-column)
- Section paddingTop 96px, paddingBottom 96px, background ${plan.theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8f9fa'}
- Container maxWidth 1200px margin auto, flex row, gap 64px, alignItems center
- Left (45%): img src=${aboutImg}, width 100%, height 500px, objectFit cover, borderRadius 16px, boxShadow '0 20px 60px rgba(0,0,0,0.15)'
- Right (55%): colored badge pill, H2 2rem fontWeight 800 ${plan.text}, body text 1rem lineHeight 1.75, 3 bullet points with SVG check icon (${plan.primary}), CTA button (${plan.primary} bg)
- On mobile (max-width 768px): stack vertically, img full width, height 300px

### 5. TESTIMONIALS
- Section paddingTop 96px, paddingBottom 96px, background ${plan.theme === 'dark' ? '#050507' : '#f3f4f6'}
- Centered H2 above
- Grid 3 cols (auto-fit, minmax(280px, 1fr)), gap 24px, maxWidth 1200px margin auto
- Each card: padding 32px, background ${plan.theme === 'dark' ? '#111118' : 'white'}, borderRadius 14px, boxShadow subtle
  - "★★★★★" in gold/amber color (#f59e0b), fontSize 1.1rem
  - Quote: italic, 0.975rem, lineHeight 1.7, color muted, marginTop 12px
  - Avatar row: img 48px circle (objectFit cover, borderRadius 50%), bold name + muted role — use the portrait URLs above

### 6. CONTACT (two-column form + info)
- Section paddingTop 96px, paddingBottom 96px, background ${plan.bg}
- Container maxWidth 1200px margin auto, flex row gap 64px
- Left: H2, form with Name / Email / Phone inputs + Message textarea
  - Input style: width 100%, padding 13px 16px, border '1.5px solid rgba(0,0,0,0.12)', borderRadius 8, fontSize 0.95rem, outline none, on focus border-color ${plan.primary}
  - Submit: width 100%, padding 14px, background ${plan.primary}, color white, fontWeight 600, borderRadius 8, cursor pointer
- Right: address, phone, email, hours — each row with inline SVG icon (${plan.primary}), text

### 7. FOOTER
- Background #111827 (always dark, regardless of theme)
- Text colors: white headings, rgba(255,255,255,0.6) body text
- 4 columns: brand (logo + tagline + social SVG icons in circles), Services, Company, Contact
- Bottom bar: flex row, border-top rgba(255,255,255,0.1), copyright left, "Built with Forge" right
- Padding: paddingTop 64px, paddingBottom 24px

## OUTPUT FORMAT
One sentence summary, then the complete \`\`\`tsx component. No truncation.`
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
          max_tokens: 8000,
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
          model: 'gpt-4o',
          max_tokens: 8000,
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
