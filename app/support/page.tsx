'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'

interface Message {
  id: number
  content: string
  senderName: string
  timestamp: string
  isOwnMessage: boolean
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    content: 'Hello! I need help with my recent order. It has not arrived yet.',
    senderName: 'You',
    timestamp: '10:23 AM',
    isOwnMessage: true,
  },
  {
    id: 2,
    content: 'Hi there! I can help you with that. Could you please provide your order number?',
    senderName: 'Agent Sarah',
    timestamp: '10:25 AM',
    isOwnMessage: false,
  },
  {
    id: 3,
    content: 'Sure, my order number is #ORD-2847.',
    senderName: 'You',
    timestamp: '10:26 AM',
    isOwnMessage: true,
  },
]

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)

  function handleSendMessage(content: string) {
    const newMessage: Message = {
      id: messages.length + 1,
      content: content,
      senderName: 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwnMessage: true,
    }
    setMessages([...messages, newMessage])
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      
      <Header userRole="customer" userName="Alex Johnson" />

      {/* Conversation area */}
      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto bg-white shadow-sm overflow-hidden">
        
        {/* Ticket info bar */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">Support Conversation</h2>
          <p className="text-xs text-gray-400 mt-0.5">Ticket #2847 · Open</p>
        </div>

        <MessageList messages={messages} />
        
        <MessageInput onSendMessage={handleSendMessage} />

      </div>
    </div>
  )
}