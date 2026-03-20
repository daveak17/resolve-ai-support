import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Which database to use for storing sessions
  session: {
    strategy: "jwt",
  },

  // The pages Auth.js should use for login/logout
  pages: {
    signIn: "/login",
  },

  // The providers define HOW users can log in
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // This function runs when a user tries to log in
      async authorize(credentials) {
        // Make sure email and password were provided
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Look up the user in the database by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        // If no user found, return null (login fails)
        if (!user || !user.hashedPassword) {
          return null
        }

        // Compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        )

        // If passwords don't match, return null (login fails)
        if (!passwordMatch) {
          return null
        }

        // Login successful - return the user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],

  // Callbacks let us customize what happens during the auth flow
  callbacks: {
    // The jwt callback runs when a token is created or updated
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },

    // The session callback runs when a session is checked
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})