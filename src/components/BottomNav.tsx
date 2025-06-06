'use client'

import { ChatBubbleLeftIcon, MapIcon } from '@heroicons/react/24/outline'

interface BottomNavProps {
  activeTab: 'chat' | 'planner'
  onTabChange: (tab: 'chat' | 'planner') => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === 'chat'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <ChatBubbleLeftIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Chat</span>
        </button>
        <button
          onClick={() => onTabChange('planner')}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === 'planner'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <MapIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Planner</span>
        </button>
      </div>
    </nav>
  )
} 