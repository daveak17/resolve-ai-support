'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string | null
    role: string
  }
  createdAt: string
}

interface Ticket {
  id: string
  status: string
  messages: Message[]
}

// This is the workspace ID for now - we will make this dynamic later
const WORKSPACE_ID = '125d4c7a-3376-4c08-aa3f-4c79345c4611'

export default function SupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
  if (status === 'authenticated') {
    fetchExistingTicket()
  }
}, [status])

async function fetchExistingTicket() {
  try {
    const response = await fetch('/api/tickets/my-ticket')
    if (response.ok) {
      const data = await response.json()
      if (data) {
        setTicket(data)
      }
    }
  } catch (error) {
    console.error('Failed to fetch ticket:', error)
  } finally {
    setLoading(false)
  }
}

  // Format messages for the MessageList component
  function formatMessages(messages: Message[]) {
    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderName: msg.sender?.name || 'Unknown',
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwnMessage: msg.sender?.id === session?.user?.id,
    }))
  }

  async function handleSendMessage(content: string) {
    if (!session?.user) return
    setSending(true)

    try {
      if (!ticket) {
        // No ticket yet - create a new one with this first message
        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            workspaceId: WORKSPACE_ID,
          }),
        })

        if (response.ok) {
          const newTicket = await response.json()
          setTicket(newTicket)
        }
      } else {
        // Ticket exists - add a message to it
        const response = await fetch(`/api/tickets/${ticket.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })

        if (response.ok) {
          const newMessage = await response.json()
          // Ensure the sender object exists to prevent crashes
          const safeMessage = {
            ...newMessage,
            sender: newMessage.sender || {
              id: session.user.id,
              name: session.user.name || 'You',
              role: 'CUSTOMER',
            },
          }
          setTicket({
            ...ticket,
            messages: [...ticket.messages, safeMessage],
          })
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (!session?.user) return null

  const formattedMessages = ticket ? formatMessages(ticket.messages) : []

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        userRole="customer"
        userName={session.user.name || session.user.email || 'You'}
      />

      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto bg-white shadow-sm overflow-hidden">

        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">
            Support Conversation
          </h2>
          {ticket ? (
            <p className="text-xs text-gray-400 mt-0.5">
              Ticket #{ticket.id.slice(0, 8)} · {ticket.status}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">
              Send a message to start a conversation
            </p>
          )}
        </div>

        <MessageList messages={formattedMessages} />

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sending}
        />

      </div>
    </div>
  )
}