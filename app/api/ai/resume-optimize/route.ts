import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { resumeText, jobDescription } = await req.json()

  if (!resumeText || !jobDescription) {
    return NextResponse.json({ error: 'Resume text and job description are required' }, { status: 400 })
  }

  const prompt = `You are an expert resume optimizer and ATS (Applicant Tracking System) specialist.

Analyze the following resume against the job description and provide a detailed optimization report.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide your analysis as a valid JSON object with exactly this structure:
{
  "matchScore": <number between 0 and 100 representing how well the resume matches the job>,
  "missingKeywords": [<array of important keywords/skills from the job description missing from the resume, max 10>],
  "strengths": [<array of 4-6 specific strengths the resume has for this role>],
  "improvements": [<array of 5-7 specific, actionable improvement suggestions>],
  "rewrittenSummary": "<a compelling 2-3 sentence professional summary tailored to this specific job>"
}

Be specific and actionable. Reference actual content from both the resume and job description.
Return ONLY the JSON object, no other text.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error('Resume optimization error:', error)
    return NextResponse.json({ error: 'Failed to optimize resume' }, { status: 500 })
  }
}
