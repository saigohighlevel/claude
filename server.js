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

  const systemPrompt = context
    ? `${SYSTEM_PROMPT}\n\nThe user is building: "${context}"`
    : SYSTEM_PROMPT

  // Prefer OpenAI if key is set, otherwise fall back to Anthropic
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 4096,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return res.status(response.status).json({
          error: data.error?.message || 'OpenAI API error',
        })
      }

      res.json({ content: data.choices[0].message.content })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }

  } else if (process.env.ANTHROPIC_API_KEY) {
    try {
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

  } else {
    res.status(500).json({
      error: 'No API key found. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to your .env file.',
    })
  }
})

const PORT = 3001
app.listen(PORT, () => console.log(`✓ API server running on http://localhost:${PORT}`))
