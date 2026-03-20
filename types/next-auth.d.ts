import { DefaultSession } from "next-auth"

// This extends the built-in Auth.js types to include
// our custom fields (id and role)
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}