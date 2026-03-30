import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

interface Message {
  id: string | number
  content: string
  senderName: string
  timestamp: string
  isOwnMessage: boolean
}

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-sm">
            No messages yet. Start the conversation.
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              senderName={message.senderName}
              timestamp={message.timestamp}
              isOwnMessage={message.isOwnMessage}
            />
          ))}
          {/* This empty div sits at the bottom and we scroll to it */}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  )
}