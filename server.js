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

  return `You are an elite React engineer at a world-class design agency. Build a stunning, production-quality landing page — the kind that wins Awwwards and Dribbble features.

## BUSINESS
Name: ${plan.business_name}
Type: ${plan.business_type}
Tagline: "${plan.tagline}"
Theme: ${plan.theme}

## DESIGN SYSTEM — use these exact values
Primary: ${plan.primary}
Accent: ${plan.accent}
Background: ${plan.bg}
Text: ${plan.text}

## IMAGES — use THESE EXACT URLs verbatim. Never substitute or omit.
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
- React hooks only: useState, useEffect, useRef, useCallback, useMemo — NO other imports
- Tailwind CSS classes (CDN available — all standard classes work)
- All icons must be inline SVG elements — no icon library imports ever
- Complete, untruncated output — never use "..." or "// rest of code here"
- NEVER import react-router-dom, react-router, next/link, or any routing library
- NEVER use window.location, history.pushState, or URL navigation APIs

## NAVIGATION RULES (critical — rendered in iframe)
- ALL nav links MUST use anchor hrefs: <a href="#section-id"> — never "/about" page paths
- Every section MUST have the matching id attribute: <section id="services">
- Smooth scroll: add onClick={e => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({behavior:'smooth'}) }} to nav links
- Tab/filter switching: use React useState only
- Mobile menu: useState boolean toggle only

## ANIMATIONS (AOS and GSAP are globally available — use them)

**AOS scroll-triggered animations** — add data-aos attributes to elements:
- Section headings/labels: data-aos="fade-up"
- Service cards: data-aos="fade-up" data-aos-delay="0", "100", "200" (staggered)
- About image: data-aos="fade-right", about text block: data-aos="fade-left"
- Testimonial cards: data-aos="fade-up" with data-aos-delay="0","100","200"
- Contact form: data-aos="fade-right", contact info: data-aos="fade-left"
- Footer columns: data-aos="fade-up" with delays

**GSAP hero entrance** — add in useEffect (check typeof gsap !== 'undefined' first):
\`\`\`
useEffect(() => {
  if (typeof gsap === 'undefined') return
  gsap.fromTo('.hero-title', {y:60,opacity:0}, {y:0,opacity:1,duration:1,ease:'power3.out'})
  gsap.fromTo('.hero-sub', {y:40,opacity:0}, {y:0,opacity:1,duration:0.9,delay:0.25,ease:'power3.out'})
  gsap.fromTo('.hero-cta-row', {y:30,opacity:0}, {y:0,opacity:1,duration:0.8,delay:0.45,ease:'power3.out'})
  gsap.fromTo('.hero-stats', {y:20,opacity:0}, {y:0,opacity:1,duration:0.7,delay:0.65,ease:'power3.out'})
}, [])
\`\`\`
Add className="hero-title" to H1, "hero-sub" to subheadline div, "hero-cta-row" to buttons row, "hero-stats" to stats row.

## MODERN DESIGN PATTERNS (mandatory — these make the page premium)

**Glassmorphism on cards** (light theme):
  background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
**Glassmorphism on cards** (dark theme):
  background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'

**Gradient section headline**: Apply to the main H2 in each section:
  background: 'linear-gradient(135deg, ${plan.primary} 0%, ${plan.accent} 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'

**Hover micro-interactions** (add to every card and button):
  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
  onMouseEnter: transform translateY(-6px) + enhanced shadow
  onMouseLeave: reset

**Service card image zoom on hover**:
  img style: transition 'transform 0.45s cubic-bezier(0.4,0,0.2,1)', scale(1) → scale(1.07) on card hover

**CTA button glow**:
  background: linear-gradient(135deg, ${plan.primary}, ${plan.accent})
  boxShadow: '0 0 0 0 ${plan.primary}40'
  onMouseEnter: boxShadow '0 8px 40px ${plan.primary}55, 0 0 0 4px ${plan.primary}20'

## 7 REQUIRED SECTIONS (all mandatory, in order)

### 1. STICKY NAV
- position sticky top-0 z-50, backdropFilter blur(20px), WebkitBackdropFilter blur(20px)
- ${plan.theme === 'dark' ? 'background: rgba(10,10,20,0.82)' : 'background: rgba(255,255,255,0.82)'}, borderBottom '1px solid ${plan.theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}'
- Logo (business name bold, gradient text using primary→accent), nav links with hover underline animation, pill CTA button
- Add scrolled state (useState + scroll listener) — when scrolled>20px add stronger shadow
- Mobile hamburger (useState) reveals nav links vertically with smooth max-height transition

### 2. HERO (minHeight: '100vh', position relative)
- backgroundImage: 'linear-gradient(160deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.5) 100%), url(${heroImg})'
- backgroundSize cover, backgroundPosition center, backgroundAttachment fixed (parallax feel)
- Centered column: display flex, flexDirection column, alignItems center, justifyContent center, textAlign center, padding '0 24px', minHeight '100vh'
- Floating badge pill above headline: small icon + text, background rgba(255,255,255,0.12), backdropFilter blur(8px)
- H1 className="hero-title": clamp(3rem,6vw,5.5rem), fontWeight 900, letterSpacing -0.04em, color white, lineHeight 1.05
- Subheadline div className="hero-sub": fontSize 1.2rem, color rgba(255,255,255,0.8), maxWidth 600px, lineHeight 1.7, marginTop 24px
- Buttons row div className="hero-cta-row": flex, gap 16px, justifyContent center, marginTop 40px
  Primary button: background 'linear-gradient(135deg, ${plan.primary}, ${plan.accent})', paddingY 16px, paddingX 36px, borderRadius 50px, fontWeight 700, fontSize 1rem, boxShadow '0 8px 32px ${plan.primary}55'
  Secondary button: transparent, border '2px solid rgba(255,255,255,0.5)', color white, same padding, hover: background rgba(255,255,255,0.1)
- Stats row div className="hero-stats": marginTop 48px, display flex, gap 40px, justifyContent center
  Each stat: bold large number (color white), small label below (rgba(255,255,255,0.6))
  Stats: "500+" clients, "4.9★" rating, years in business

### 3. SERVICES (3 cards)
- Section paddingTop 112px, paddingBottom 112px, background ${plan.bg}
- Center: label pill (uppercase, ${plan.primary}), gradient H2, subtitle maxWidth 560px
- Grid: repeat(auto-fit,minmax(320px,1fr)), gap 32px, maxWidth 1240px, margin 64px auto 0
- Each card: overflow hidden, borderRadius 20px, GLASSMORPHISM styles above, transition all 0.3s cubic-bezier(0.4,0,0.2,1)
  - Image wrapper: overflow hidden, height 240px → img width 100% height 100% objectFit cover, scale transition on hover
  - Body: padding 32px
  - Colored icon circle (40px, ${plan.primary}15 bg, ${plan.primary} icon SVG 22px)
  - h3: 1.2rem fontWeight 700 ${plan.text}
  - p: 0.9rem color muted lineHeight 1.65
  - Link "Explore →": ${plan.primary}, fontWeight 600, marginTop 16px, hover: gap increase
  - Card hover: translateY(-8px), stronger shadow, image zoom
  - Add data-aos="fade-up" with staggered delays

### 4. ABOUT (two-column)
- Section paddingTop 112px, paddingBottom 112px, background ${plan.theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8f9fa'}
- Container maxWidth 1240px margin auto, flex row gap 80px alignItems center (reverse on mobile)
- Left 45%: img src=${aboutImg}, width 100%, height 520px objectFit cover, borderRadius 24px, boxShadow '0 32px 80px rgba(0,0,0,0.18)' — data-aos="fade-right"
- Right 55%: data-aos="fade-left"
  - Colored badge pill above headline
  - H2: 2.25rem fontWeight 800 — gradient text
  - Body text: 1rem lineHeight 1.8 color muted
  - 3 bullet rows: flex gap 14px, SVG check circle icon (${plan.primary}), bold title + description
  - CTA button: gradient background, paddingY 14px paddingX 32px borderRadius 50px fontWeight 700

### 5. TESTIMONIALS
- Section paddingTop 112px, paddingBottom 112px, background ${plan.theme === 'dark' ? '#080810' : '#f3f4f6'}
- Centered gradient H2 with subtitle
- Grid auto-fit minmax(300px,1fr) gap 28px maxWidth 1240px margin 64px auto 0
- Each card: GLASSMORPHISM styles, borderRadius 20px, padding 36px — data-aos="fade-up" with delays
  - Stars ★★★★★ in ${plan.accent} color, fontSize 1.2rem
  - Large open-quote " mark (${plan.primary}, 4rem, opacity 0.3) as decorative element
  - Quote: 1rem lineHeight 1.75 fontStyle italic color muted marginTop 8px
  - Avatar row marginTop 24px: img 52px circle borderRadius 50% objectFit cover, name bold ${plan.text}, role muted 0.85rem

### 6. CONTACT (two-column form + info)
- Section paddingTop 112px, paddingBottom 112px, background ${plan.bg}
- Container maxWidth 1240px margin auto, flex row gap 80px
- Left form (data-aos="fade-right"): gradient H2, then form
  - Inputs: width 100%, padding 14px 18px, border '1.5px solid ${plan.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}', borderRadius 10px, background '${plan.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9fafb'}', fontSize 0.95rem, color ${plan.text}, transition 'border-color 0.2s'
  - onFocus → borderColor ${plan.primary}
  - Submit button: full-width, gradient background ${plan.primary}→${plan.accent}, padding 15px, borderRadius 10px, fontWeight 700, glow shadow on hover, uses useState for submitted state (show "✓ Sent!" when submitted)
- Right info (data-aos="fade-left"): each row has gradient icon circle + text
  - Address, phone, email, hours (Mon–Sat format)
  - Add a decorative map placeholder div: background ${plan.primary}10, borderRadius 16px, height 180px, center text "📍 ${plan.address}"

### 7. FOOTER
- Background: always #0f0f18 (deep dark)
- 4 columns grid: brand logo+tagline+social icons (GitHub/Twitter/Instagram SVGs in circles), Services list, Company list, Contact info
- Brand column: gradient text logo name, muted tagline, social icon circles (${plan.primary}10 bg, 36px, SVG icons)
- Text colors: rgba(255,255,255,0.9) headings, rgba(255,255,255,0.5) links/body
- Links hover: rgba(255,255,255,0.9) with 0.2s transition
- Bottom bar: border-top rgba(255,255,255,0.08), flex space-between, "© 2025 ${plan.business_name}" + "Built with Forge ⚡"
- Padding: paddingTop 80px paddingBottom 32px

## OUTPUT FORMAT
One sentence summary, then the complete \`\`\`tsx component. Never truncate — output all 7 sections completely.`
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
