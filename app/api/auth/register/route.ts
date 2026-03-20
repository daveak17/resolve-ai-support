import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Read the JSON body from the request
    const body = await request.json()
    const { name, email, password } = body

    // Validate that all fields are provided
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash the password before storing it
    // The number 12 is the "salt rounds" - how many times to hash
    // Higher = more secure but slower. 12 is the industry standard.
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: 'CUSTOMER',
      },
    })

    // Return success (never return the password hash)
    return NextResponse.json(
      { message: 'Account created successfully', userId: user.id },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}