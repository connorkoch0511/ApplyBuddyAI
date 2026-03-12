import { NextRequest } from 'next/server'
import { chatStream } from '@/lib/openrouter'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { jobTitle, company, jobDescription, userBackground, tone } = await req.json()

  const toneInstructions: Record<string, string> = {
    professional: 'formal and professional',
    enthusiastic: 'enthusiastic and energetic',
    creative: 'creative and unique',
    concise: 'concise and to-the-point (under 200 words)',
  }

  const prompt = `Write a ${toneInstructions[tone] ?? 'professional'} cover letter for the following job:

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

  return new Response(chatStream(prompt), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
