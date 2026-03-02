import express from 'express'
import 'dotenv/config'

const app = express()
app.use(express.json())

const SYSTEM_PROMPT = `You are Forge AI, an expert React developer and UI designer. You help users build and modify React applications through natural conversation.

When modifying the app:
- Give a brief, friendly description of the changes you're making (1-3 sentences)
- Then provide the COMPLETE updated React component code in a \`\`\`tsx code block
- The component must be named "App" and be the default export
- Use only inline styles (no Tailwind, no CSS classes, no external imports except React)
- Make it visually impressive: dark theme, gradients, smooth interactions, modern UI
- Always include the full component code after your message, even for small changes`

app.post('/api/chat', async (req, res) => {
  const { messages, context } = req.body

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set. Add it to your .env file.' })
  }

  try {
    const systemPrompt = context
      ? `${SYSTEM_PROMPT}\n\nThe user is building: "${context}"`
      : SYSTEM_PROMPT

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Anthropic API error',
      })
    }

    res.json({ content: data.content[0].text })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

const PORT = 3001
app.listen(PORT, () => console.log(`✓ API server running on http://localhost:${PORT}`))
