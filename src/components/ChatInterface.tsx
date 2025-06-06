'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid'
import { useDropzone } from 'react-dropzone'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setAttachments((prev) => [...prev, ...acceptedFiles])
    },
    maxSize: 5242880, // 5MB
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && attachments.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
      attachments: attachments.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      })),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setAttachments([])
    setIsLoading(true)

    // TODO: Implement AI response logic
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: 'I am your AI travel assistant. How can I help you plan your next adventure?',
      role: 'assistant',
      timestamp: new Date(),
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-white/10 rounded-lg p-2"
                      >
                        <PaperClipIcon className="w-4 h-4" />
                        <span className="text-xs truncate">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1"
              >
                <PaperClipIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <div
            {...getRootProps()}
            className={`flex-1 flex items-center space-x-4 rounded-lg border ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-800 px-4 py-2`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your next trip..."
              className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white"
            />
            <input {...getInputProps()} />
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  )
} 