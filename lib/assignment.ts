import { prisma } from './prisma'

// Round-robin assignment using least-loaded strategy
// Finds the agent in the workspace with the fewest open tickets
// and returns their ID

export async function assignTicketToAgent(
  workspaceId: string
): Promise<string | null> {
  try {
    // Get all agents in this workspace
    const agents = await prisma.user.findMany({
      where: {
        workspaceId,
        role: 'AGENT',
      },
      select: {
        id: true,
        name: true,
        // Count how many open/in-progress tickets each agent has
        _count: {
          select: {
            assignedTickets: {
              where: {
                status: {
                  in: ['OPEN', 'IN_PROGRESS'],
                },
              },
            },
          },
        },
      },
    })

    // If no agents exist, return null
    if (agents.length === 0) {
      console.log('No agents found in workspace:', workspaceId)
      return null
    }

    // Find the agent with the fewest active tickets
    // This is the "least loaded" round-robin strategy
    const leastLoadedAgent = agents.reduce((prev, current) => {
      return prev._count.assignedTickets <= current._count.assignedTickets
        ? prev
        : current
    })

    console.log(
      `Assigning to ${leastLoadedAgent.name} ` +
      `(${leastLoadedAgent._count.assignedTickets} active tickets)`
    )

    return leastLoadedAgent.id

  } catch (error) {
    console.error('Assignment error:', error)
    return null
  }
}