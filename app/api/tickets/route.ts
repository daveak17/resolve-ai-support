import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tickets - fetch tickets for the logged-in agent
export async function GET(request: NextRequest) {
  try {
    // Get the current session to know who is asking
    const session = await auth()

    // If not logged in, reject the request
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch tickets assigned to this agent
    const tickets = await prisma.ticket.findMany({
      where: {
        assignedAgentId: session.user.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1, // Only get the first message as preview
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(tickets)

  } catch (error) {
    console.error('GET /api/tickets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

// POST /api/tickets - create a new ticket with first message
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, workspaceId } = body

    if (!content || !workspaceId) {
      return NextResponse.json(
        { error: 'Message content and workspaceId are required' },
        { status: 400 }
      )
    }

    // Find an available agent to assign using round-robin
    // For now we find any agent in the workspace
    const agent = await prisma.user.findFirst({
      where: {
        workspaceId,
        role: 'AGENT',
      },
    })

    // Create the ticket and first message together
    // Prisma lets us do this in one operation using nested creates
    const ticket = await prisma.ticket.create({
      data: {
        workspaceId,
        customerId: session.user.id,
        assignedAgentId: agent?.id,
        status: 'OPEN',
        messages: {
          create: {
            content,
            senderId: session.user.id,
          },
        },
      },
      include: {
        messages: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(ticket, { status: 201 })

  } catch (error) {
    console.error('POST /api/tickets error:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}