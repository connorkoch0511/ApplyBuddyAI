import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/openrouter'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { jobTitle, company, jobDescription } = await req.json()

  if (!jobTitle || !company) {
    return NextResponse.json({ error: 'Job title and company are required' }, { status: 400 })
  }

  const prompt = `You are an expert interview coach.

Generate 10 relevant interview questions and strong suggested answers for this role:

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
    "suggestedAnswer": "<a detailed 150-200 word suggested answer>",
    "tips": "<2-3 short tips for answering this question well>"
  }
]

Return ONLY the JSON array, no other text.`

  try {
    const text = await chat(prompt)
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array in response')
    const questions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ questions, jobTitle, company })
  } catch (error) {
    console.error('Interview prep error:', error)
    return NextResponse.json({ error: 'Failed to generate interview questions' }, { status: 500 })
  }
}
