import { NextRequest } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { jobTitle, company, jobDescription, userBackground, tone } = await req.json()

  const toneInstructions: Record<string, string> = {
    professional: 'formal and professional',
    enthusiastic: 'enthusiastic and energetic',
    creative: 'creative and unique',
    concise: 'concise and to-the-point (under 200 words)',
  }

  const prompt = `Write a ${toneInstructions[tone] || 'professional'} cover letter for the following job:

Job Title: ${jobTitle}
Company: ${company}

Job Description:
${jobDescription}

Applicant Background:
${userBackground}

Write a compelling cover letter that:
1. Opens with a strong hook
2. Highlights relevant experience matching the job requirements
3. Shows enthusiasm for the company
4. Ends with a clear call to action
5. Is 3-4 paragraphs

Write only the cover letter text, no subject line or date needed.`

  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
