'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import TicketCard from '@/components/dashboard/TicketCard'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import { getSocket } from '@/lib/socket'

interface Message {
  id: string
  content: string
  sender?: {
    id: string
    name: string | null
    role: string
  }
  createdAt: string
}

interface Ticket {
  id: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string | null
    email: string
  }
  messages: Message[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [selectedTicketMessages, setSelectedTicketMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const currentRoomRef = useRef<string | null>(null)
  const loadingTicketRef = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return

    fetchTickets()

    const socket = getSocket()
    socket.off('message-received')
    socket.on('message-received', (message: Message) => {
      if (loadingTicketRef.current) return
      setSelectedTicketMessages((prev) => {
        const safePrev = Array.isArray(prev) ? prev : []
        const exists = safePrev.some((m) => m.id === message.id)
        if (exists) return safePrev
        return [...safePrev, message]
      })
    })

    return () => {
      socket.off('message-received')
    }
  }, [status])

  async function fetchTickets() {
    try {
      const response = await fetch('/api/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      setLoading(false)
    }
  }

  async function handleSelectTicket(ticketId: string) {
    console.log('Selecting ticket:', ticketId)
    setSelectedTicketId(ticketId)
    setSelectedTicketMessages([])
    loadingTicketRef.current = true

    const socket = getSocket()
    if (currentRoomRef.current) {
      socket.emit('leave-ticket', currentRoomRef.current)
    }
    currentRoomRef.current = ticketId

    try {
      const response = await fetch(`/api/tickets/${ticketId}`)
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Data received:', JSON.stringify(data).slice(0, 200))
        console.log('Messages count:', data.messages?.length)
        const messages = data.messages || []
        setSelectedTicketMessages(messages)
        loadingTicketRef.current = false
        socket.emit('join-ticket', ticketId)
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error)
      loadingTicketRef.current = false
      socket.emit('join-ticket', ticketId)
    }
  }

  async function handleSendMessage(content: string) {
    if (!selectedTicketId || !session?.user) return
    setSending(true)

    try {
      const response = await fetch(
        `/api/tickets/${selectedTicketId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }
      )

      if (response.ok) {
        const newMessage = await response.json()
        const safeMessage = {
          ...newMessage,
          sender: newMessage.sender || {
            id: session.user.id,
            name: session.user.name || 'Agent',
            role: 'AGENT',
          },
        }

        setSelectedTicketMessages((prev) => {
          const safePrev = Array.isArray(prev) ? prev : []
          return [...safePrev, safeMessage]
        })

        const socket = getSocket()
        socket.emit('send-message', {
          ticketId: selectedTicketId,
          message: safeMessage,
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  async function handleResolveTicket() {
    if (!selectedTicketId) return

    try {
      const response = await fetch(`/api/tickets/${selectedTicketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      })

      if (response.ok) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicketId
              ? { ...t, status: 'RESOLVED' as const }
              : t
          )
        )
      }
    } catch (error) {
      console.error('Failed to resolve ticket:', error)
    }
  }

  function formatMessages(messages: Message[]) {
    const safeMessages = Array.isArray(messages) ? messages : []
    return safeMessages.map((msg) => ({
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

  function getTicketPreview(ticket: Ticket) {
    if (!ticket.messages || ticket.messages.length === 0) return 'No messages yet'
    return ticket.messages[0].content
  }

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId)

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        userRole="agent"
        userName={session.user.name || session.user.email || 'Agent'}
      />

      <div className="flex flex-1 overflow-hidden">

        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">My Tickets</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {tickets.length} assigned to you
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-400 text-sm">No tickets yet</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticketNumber={`#${ticket.id.slice(0, 8)}`}
                  customerName={ticket.customer.name || ticket.customer.email}
                  preview={getTicketPreview(ticket)}
                  status={ticket.status.toLowerCase() as 'open' | 'in_progress' | 'resolved'}
                  urgency="medium"
                  timestamp={new Date(ticket.updatedAt).toLocaleTimeString(
                    [], { hour: '2-digit', minute: '2-digit' }
                  )}
                  isSelected={selectedTicketId === ticket.id}
                  onClick={() => handleSelectTicket(ticket.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {selectedTicket.customer.name || selectedTicket.customer.email}
                  </h2>
                  <p className="text-xs text-gray-400">
                    #{selectedTicket.id.slice(0, 8)} · {selectedTicket.status}
                  </p>
                </div>
                {selectedTicket.status !== 'RESOLVED' && (
                  <button
                    onClick={handleResolveTicket}
                    className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>

              <MessageList messages={formatMessages(selectedTicketMessages)} />
              <MessageInput onSendMessage={handleSendMessage} disabled={sending} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                Select a ticket to view the conversation
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}