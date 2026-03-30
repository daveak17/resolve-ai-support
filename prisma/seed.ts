import * as dotenv from 'dotenv'
dotenv.config()
import { PrismaClient } from '../app/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// We need to create the Prisma client manually here
// because the seed script runs outside of Next.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clean up existing data in the right order
  // (messages first because they depend on tickets and users)
  await prisma.message.deleteMany()
  await prisma.aIAnalysis.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.workspace.deleteMany()

  console.log('Cleared existing data')

  // Create the workspace
  const workspace = await prisma.workspace.create({
    data: {
      id: '125d4c7a-3376-4c08-aa3f-4c79345c4611',
      name: 'Acme Corp Support',
      slug: 'acme-corp',
    },
  })

  console.log('Created workspace:', workspace.name)

  // Hash passwords
  const agentPassword = await bcrypt.hash('agent123', 12)
  const customerPassword = await bcrypt.hash('customer123', 12)

  // Create agents
  const agent1 = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@acme.com',
      hashedPassword: agentPassword,
      role: 'AGENT',
      workspaceId: workspace.id,
    },
  })

  const agent2 = await prisma.user.create({
    data: {
      name: 'James Wilson',
      email: 'james@acme.com',
      hashedPassword: agentPassword,
      role: 'AGENT',
      workspaceId: workspace.id,
    },
  })

  console.log('Created agents:', agent1.name, agent2.name)

  // Create customers
  const customer1 = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      hashedPassword: customerPassword,
      role: 'CUSTOMER',
      workspaceId: workspace.id,
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@example.com',
      hashedPassword: customerPassword,
      role: 'CUSTOMER',
      workspaceId: workspace.id,
    },
  })

  console.log('Created customers:', customer1.name, customer2.name)

  // Create sample tickets with messages
  const ticket1 = await prisma.ticket.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer1.id,
      assignedAgentId: agent1.id,
      status: 'OPEN',
      messages: {
        create: {
          content: 'Hello, I need help with my recent order. It has not arrived yet.',
          senderId: customer1.id,
        },
      },
    },
  })

  const ticket2 = await prisma.ticket.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer2.id,
      assignedAgentId: agent2.id,
      status: 'IN_PROGRESS',
      messages: {
        create: {
          content: 'I cannot log into my account after the recent update.',
          senderId: customer2.id,
        },
      },
    },
  })

  const ticket3 = await prisma.ticket.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer1.id,
      assignedAgentId: agent1.id,
      status: 'OPEN',
      messages: {
        create: {
          content: 'How do I export my data to CSV format?',
          senderId: customer1.id,
        },
      },
    },
  })

  console.log('Created tickets:', ticket1.id, ticket2.id, ticket3.id)
  console.log('Seeding complete!')
  console.log('')
  console.log('Test accounts:')
  console.log('  Agent 1:    sarah@acme.com    / agent123')
  console.log('  Agent 2:    james@acme.com    / agent123')
  console.log('  Customer 1: alex@example.com  / customer123')
  console.log('  Customer 2: maria@example.com / customer123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    pool.end()
  })