import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tickets/my-ticket
// Returns the most recent open ticket for the logged-in customer
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the most recent ticket for this customer
    const ticket = await prisma.ticket.findFirst({
      where: {
        customerId: session.user.id,
        status: { not: 'CLOSED' },
      },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Return null if no ticket found - that is fine
    return NextResponse.json(ticket)

  } catch (error) {
    console.error('GET /api/tickets/my-ticket error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}