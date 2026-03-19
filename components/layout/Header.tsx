interface HeaderProps {
  userRole: 'customer' | 'agent'
  userName: string
}

export default function Header({ userRole, userName }: HeaderProps) {
  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      
      {/* Logo / Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">R</span>
        </div>
        <span className="text-gray-900 font-semibold text-lg">Resolve</span>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {userRole === 'agent' ? 'Agent' : 'Support'}
        </span>
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-600 text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-gray-700 font-medium">{userName}</span>
      </div>

    </header>
  )
}