'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import TicketCard from '@/components/dashboard/TicketCard'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'

const MOCK_TICKETS = [
  {
    id: 1,
    ticketNumber: '#2847',
    customerName: 'Alex Johnson',
    preview: 'My order has not arrived yet and it has been two weeks',
    status: 'open' as const,
    urgency: 'high' as const,
    timestamp: '10:23 AM',
  },
  {
    id: 2,
    ticketNumber: '#2846',
    customerName: 'Maria Santos',
    preview: 'I cannot log into my account after the recent update',
    status: 'in_progress' as const,
    urgency: 'medium' as const,
    timestamp: '9:45 AM',
  },
  {
    id: 3,
    ticketNumber: '#2845',
    customerName: 'James Wright',
    preview: 'How do I export my data to CSV format?',
    status: 'open' as const,
    urgency: 'low' as const,
    timestamp: 'Yesterday',
  },
  {
    id: 4,
    ticketNumber: '#2846',
    customerName: 'David Akoda',
    preview: 'How do know this is working?',
    status: 'resolved' as const,
    urgency: 'low' as const,
    timestamp: '12:30 PM',
  },
]

const MOCK_CONVERSATIONS: Record<number, { id: number; content: string; senderName: string; timestamp: string; isOwnMessage: boolean }[]> = {
  1: [
    { id: 1, content: 'My order has not arrived yet and it has been two weeks', senderName: 'Alex Johnson', timestamp: '10:23 AM', isOwnMessage: false },
    { id: 2, content: 'Hi Alex, I am sorry to hear that. Let me look into this right away.', senderName: 'You (Agent)', timestamp: '10:24 AM', isOwnMessage: true },
  ],
  2: [
    { id: 1, content: 'I cannot log into my account after the recent update', senderName: 'Maria Santos', timestamp: '9:45 AM', isOwnMessage: false },
  ],
  3: [
    { id: 1, content: 'How do I export my data to CSV format?', senderName: 'James Wright', timestamp: 'Yesterday', isOwnMessage: false },
  ],
  4: [
    { id: 1, content: 'How do know this is working?', senderName: 'David Akoda', timestamp: '12:30 PM', isOwnMessage: false },
  ],
}

export default function DashboardPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<number>(1)
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)

  const selectedTicket = MOCK_TICKETS.find((t) => t.id === selectedTicketId)
  const currentMessages = conversations[selectedTicketId] || []

  function handleSendMessage(content: string) {
    const newMessage = {
      id: currentMessages.length + 1,
      content,
      senderName: 'You (Agent)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwnMessage: true,
    }
    setConversations({
      ...conversations,
      [selectedTicketId]: [...currentMessages, newMessage],
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      
      <Header userRole="agent" userName="Sarah Chen" />

      <div className="flex flex-1 overflow-hidden">

        {/* Ticket list sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">My Tickets</h2>
            <p className="text-xs text-gray-400 mt-0.5">{MOCK_TICKETS.length} assigned to you</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_TICKETS.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticketNumber={ticket.ticketNumber}
                customerName={ticket.customerName}
                preview={ticket.preview}
                status={ticket.status}
                urgency={ticket.urgency}
                timestamp={ticket.timestamp}
                isSelected={selectedTicketId === ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
              />
            ))}
          </div>
        </div>

        {/* Conversation area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Ticket header */}
              <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {selectedTicket.customerName}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {selectedTicket.ticketNumber} · {selectedTicket.status}
                  </p>
                </div>
                <button className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors">
                  Mark Resolved
                </button>
              </div>

              <MessageList messages={currentMessages} />
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Select a ticket to view the conversation</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}