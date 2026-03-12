import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true },
    })

    return NextResponse.json({ profile, user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      name,
      phone,
      location,
      linkedin,
      website,
      resumeText,
      resumeFileName,
      skills,
      desiredRole,
      desiredSalary,
      workType,
      experience,
      education,
    } = body

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      })
    }

    // Upsert profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(linkedin !== undefined && { linkedin }),
        ...(website !== undefined && { website }),
        ...(resumeText !== undefined && { resumeText }),
        ...(resumeFileName !== undefined && { resumeFileName }),
        ...(skills !== undefined && { skills }),
        ...(desiredRole !== undefined && { desiredRole }),
        ...(desiredSalary !== undefined && { desiredSalary }),
        ...(workType !== undefined && { workType }),
        ...(experience !== undefined && { experience }),
        ...(education !== undefined && { education }),
      },
      create: {
        userId,
        phone: phone || null,
        location: location || null,
        linkedin: linkedin || null,
        website: website || null,
        resumeText: resumeText || null,
        resumeFileName: resumeFileName || null,
        skills: skills || null,
        desiredRole: desiredRole || null,
        desiredSalary: desiredSalary || null,
        workType: workType || null,
        experience: experience || null,
        education: education || null,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
