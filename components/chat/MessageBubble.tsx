interface MessageBubbleProps {
  content: string
  senderName: string
  timestamp: string
  isOwnMessage: boolean
}

export default function MessageBubble({
  content,
  senderName,
  timestamp,
  isOwnMessage,
}: MessageBubbleProps) {
  return (
    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} mb-4`}>
      
      {/* Sender name */}
      <span className="text-xs text-gray-500 mb-1 px-1">
        {senderName}
      </span>

      {/* Message bubble */}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed">{content}</p>
      </div>

      {/* Timestamp */}
      <span className="text-xs text-gray-400 mt-1 px-1">
        {timestamp}
      </span>

    </div>
  )
}