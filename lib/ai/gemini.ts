import { GoogleGenerativeAI } from '@google/generative-ai'

const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const openaiKey = process.env.OPENAI_API_KEY || ''

// Prefer gemini-2.5-flash-lite (separate quota pool), fall back to openai
const GEMINI_MODEL = 'gemini-2.5-flash-lite'

let genAI: GoogleGenerativeAI | null = null

function getGeminiClient() {
  if (!genAI && geminiKey) genAI = new GoogleGenerativeAI(geminiKey)
  return genAI
}

async function openAIFallback(prompt: string, systemInstruction?: string): Promise<string> {
  if (!openaiKey) return '[AI unavailable — configure GEMINI_API_KEY or OPENAI_API_KEY]'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
        { role: 'user', content: prompt },
      ],
      max_tokens: 1024,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error')
  return data.choices[0].message.content
}

async function openAIChatFallback(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  systemInstruction?: string
): Promise<string> {
  if (!openaiKey) return '[AI unavailable — configure GEMINI_API_KEY or OPENAI_API_KEY]'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
        ...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.content })),
      ],
      max_tokens: 1024,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error')
  return data.choices[0].message.content
}

export async function geminiGenerate(prompt: string, systemInstruction?: string): Promise<string> {
  const client = getGeminiClient()
  if (client) {
    try {
      const model = client.getGenerativeModel({
        model: GEMINI_MODEL,
        ...(systemInstruction ? { systemInstruction } : {}),
      })
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (e: any) {
      // quota or model error — fall through to OpenAI
      console.warn('[gemini] falling back to OpenAI:', e?.message?.slice(0, 80))
    }
  }
  return openAIFallback(prompt, systemInstruction)
}

export async function geminiChat(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  systemInstruction?: string
): Promise<string> {
  const client = getGeminiClient()
  if (client) {
    try {
      const model = client.getGenerativeModel({
        model: GEMINI_MODEL,
        ...(systemInstruction ? { systemInstruction } : {}),
      })
      const chat = model.startChat({
        history: messages.slice(0, -1).map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
      })
      const result = await chat.sendMessage(messages[messages.length - 1].content)
      return result.response.text()
    } catch (e: any) {
      console.warn('[gemini] chat falling back to OpenAI:', e?.message?.slice(0, 80))
    }
  }
  return openAIChatFallback(messages, systemInstruction)
}
