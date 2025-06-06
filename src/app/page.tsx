'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const travelPhotos = [
  '/images/travel1.jpg',
  '/images/travel2.jpg',
  '/images/travel3.jpg',
  '/images/travel4.jpg',
  '/images/travel5.jpg',
]

const slides = [
  {
    title: 'AI-Powered Travel Planning',
    description: 'Get personalized travel recommendations powered by advanced AI technology. From hidden gems to popular attractions, we help you discover the perfect destinations.',
    icon: '🎯',
  },
  {
    title: 'Smart Trip Management',
    description: 'Organize your entire journey in one place. Track bookings, manage documents, and collaborate with travel companions seamlessly.',
    icon: '📱',
  },
  {
    title: 'Real-time Travel Updates',
    description: 'Stay informed with live updates on flights, weather, and local events. Get instant notifications about changes that matter to your trip.',
    icon: '⚡',
  },
]

export default function WelcomeScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % travelPhotos.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    } else {
      setShowAuth(true)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Photo Carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhotoIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={travelPhotos[currentPhotoIndex]}
              alt="Travel destination"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {!showAuth ? (
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-2xl w-full text-center"
          >
            <div className="text-8xl mb-8">{slides[currentSlide].icon}</div>
            <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md mb-12">
              {slides[currentSlide].description}
            </p>

            <div className="flex justify-center items-center space-x-4">
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>
              )}
              <button
                onClick={nextSlide}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to True Travel AI
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sign in to start your journey
              </p>
            </div>

            <div className="space-y-6">
              <button
                onClick={() => handleSignIn('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Image
                  src="/google-icon.svg"
                  alt="Google"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span>Continue with Google</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/90 dark:bg-gray-800/90 text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign in with Email
              </button>
            </div>

            <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
} 