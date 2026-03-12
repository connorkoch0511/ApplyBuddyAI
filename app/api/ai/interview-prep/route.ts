import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobTitle, company, jobDescription } = await req.json()

  if (!jobTitle || !company) {
    return NextResponse.json({ error: 'Job title and company are required' }, { status: 400 })
  }

  const prompt = `You are an expert interview coach with deep knowledge of hiring practices at top companies.

Generate 10 highly relevant interview questions and strong suggested answers for the following role:

Job Title: ${jobTitle}
Company: ${company}
${jobDescription ? `Job Description:\n${jobDescription}` : ''}

Create a mix of:
- 3 behavioral questions (STAR format answers)
- 3 technical/role-specific questions
- 2 situational/problem-solving questions
- 1 culture fit / motivation question
- 1 question about the candidate's experience

Return a valid JSON array with exactly this structure:
[
  {
    "id": 1,
    "category": "<Behavioral|Technical|Situational|Culture Fit>",
    "question": "<the interview question>",
    "suggestedAnswer": "<a detailed, 150-200 word suggested answer that is specific and compelling>",
    "tips": "<2-3 short tips for answering this question well>"
  }
]

Make the questions specific to ${company} and the ${jobTitle} role. The suggested answers should be genuine and specific, not generic platitudes.
Return ONLY the JSON array, no other text.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Extract JSON array from response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in response')
    }

    const questions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ questions, jobTitle, company })
  } catch (error) {
    console.error('Interview prep error:', error)
    return NextResponse.json({ error: 'Failed to generate interview questions' }, { status: 500 })
  }
}
