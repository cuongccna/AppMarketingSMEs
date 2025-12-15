'use client'

import { useState, useEffect } from 'react'
import { X, Share, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIosDevice)

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    if (isStandalone) return

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen')
      if (!hasSeenPrompt) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show prompt for iOS users after a delay if not installed
    if (isIosDevice && !isStandalone) {
      const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen')
      if (!hasSeenPrompt) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_seen', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-10 fade-in">
      <div className="bg-white rounded-xl shadow-2xl border p-4 relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            L
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Cài đặt ứng dụng LAR</h3>
            <p className="text-sm text-gray-600 mt-1">
              Thêm vào màn hình chính để truy cập nhanh hơn và nhận thông báo.
            </p>
            
            {isIOS ? (
              <div className="mt-3 text-sm bg-gray-50 p-3 rounded-lg border">
                <p className="flex items-center gap-2 mb-1">
                  1. Nhấn vào nút chia sẻ <Share className="h-4 w-4" />
                </p>
                <p className="flex items-center gap-2">
                  2. Chọn "Thêm vào MH chính" <span className="border rounded px-1 text-xs">+</span>
                </p>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <Button onClick={handleInstall} size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Cài đặt ngay
                </Button>
                <Button onClick={handleDismiss} variant="outline" size="sm">
                  Để sau
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
