interface TicketCardProps {
  ticketNumber: string
  customerName: string
  preview: string
  status: 'open' | 'in_progress' | 'resolved'
  urgency: 'low' | 'medium' | 'high'
  timestamp: string
  isSelected: boolean
  onClick: () => void
}

const STATUS_STYLES = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
}

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

const URGENCY_STYLES = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-orange-100 text-orange-600',
  high: 'bg-red-100 text-red-600',
}

export default function TicketCard({
  ticketNumber,
  customerName,
  preview,
  status,
  urgency,
  timestamp,
  isSelected,
  onClick,
}: TicketCardProps) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-sm font-medium text-gray-900">{customerName}</span>
        <span className="text-xs text-gray-400">{timestamp}</span>
      </div>

      <p className="text-xs text-gray-500 mb-2 truncate">{preview}</p>

      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${URGENCY_STYLES[urgency]}`}>
          {urgency}
        </span>
        <span className="text-xs text-gray-400 ml-auto">{ticketNumber}</span>
      </div>
    </div>
  )
}