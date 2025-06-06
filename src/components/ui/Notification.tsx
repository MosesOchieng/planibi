'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface NotificationProps {
  message: string
  type: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
}

export default function Notification({ message, type, isVisible, onClose }: NotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50"
        >
          <div
            className={`flex items-center p-4 rounded-lg shadow-lg ${
              type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            {type === 'success' ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-500" />
            )}
            <p
              className={`ml-3 text-sm font-medium ${
                type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message}
            </p>
            <button
              onClick={onClose}
              className={`ml-4 text-sm font-medium ${
                type === 'success' ? 'text-green-600' : 'text-red-600'
              } hover:opacity-75`}
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 