export const dynamic = 'force-dynamic'
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
    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
    const { jobTitle, company, location, salary, status, jobUrl, notes, appliedAt } = body

    if (!jobTitle || !company) {
      return NextResponse.json({ error: 'Job title and company are required' }, { status: 400 })
    }

    const application = await prisma.application.create({
      data: {
        userId,
        jobTitle,
        company,
        location: location || null,
        salary: salary || null,
        status: status || 'saved',
        jobUrl: jobUrl || null,
        notes: notes || null,
        appliedAt: appliedAt ? new Date(appliedAt) : null,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
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
    const { id, jobTitle, company, location, salary, status, jobUrl, notes, appliedAt } = body

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.application.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...(jobTitle !== undefined && { jobTitle }),
        ...(company !== undefined && { company }),
        ...(location !== undefined && { location }),
        ...(salary !== undefined && { salary }),
        ...(status !== undefined && { status }),
        ...(jobUrl !== undefined && { jobUrl }),
        ...(notes !== undefined && { notes }),
        ...(appliedAt !== undefined && { appliedAt: appliedAt ? new Date(appliedAt) : null }),
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
  }

  try {
    // Verify ownership
    const existing = await prisma.application.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    await prisma.application.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 })
  }
}
