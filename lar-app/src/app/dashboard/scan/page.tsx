'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const { toast } = useToast()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Initialize scanner only if not already initialized
    if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        )
        
        scanner.render(onScanSuccess, onScanFailure)
        scannerRef.current = scanner
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode scanner. ", error)
        })
        scannerRef.current = null
      }
    }
  }, [])

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    if (decodedText !== scanResult) {
      setScanResult(decodedText)
      handleConfirm(decodedText)
      // Pause scanning
      if (scannerRef.current) {
        try {
            scannerRef.current.pause(true)
        } catch (e) {
            console.error("Error pausing scanner", e)
        }
      }
    }
  }

  const onScanFailure = (error: any) => {
    // handle scan failure, usually better to ignore and keep scanning.
  }

  const handleConfirm = async (code: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/mini-app/rewards/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResultData({ success: true, message: 'Đổi quà thành công!' })
        toast({
          title: "Thành công",
          description: "Đã xác nhận đổi quà.",
          variant: "default" // Changed from "success" to "default" as "success" might not be a valid variant in shadcn/ui default setup
        })
      } else {
        setResultData({ success: false, message: data.error || 'Lỗi xác nhận' })
        toast({
          title: "Lỗi",
          description: data.error || "Không thể xác nhận mã.",
          variant: "destructive"
        })
      }
    } catch (error) {
      setResultData({ success: false, message: 'Lỗi kết nối' })
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi kết nối.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setResultData(null)
    setManualCode('')
    if (scannerRef.current) {
        try {
            scannerRef.current.resume()
        } catch (e) {
            console.error("Error resuming scanner", e)
            // If resume fails, maybe re-render?
            // For now, let's assume it works or the user can refresh.
        }
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Quét mã đổi quà</CardTitle>
        </CardHeader>
        <CardContent>
          {!resultData ? (
            <>
              <div id="reader" className="w-full mb-4 overflow-hidden rounded-lg"></div>
              
              <div className="flex gap-2 mt-4">
                <Input 
                  placeholder="Nhập mã thủ công" 
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <Button onClick={() => handleConfirm(manualCode)} disabled={!manualCode || loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Xác nhận'}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              {resultData.success ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              <h3 className="text-xl font-bold mb-2">
                {resultData.success ? 'Thành công!' : 'Thất bại!'}
              </h3>
              <p className="text-gray-600 mb-6">{resultData.message}</p>
              <Button onClick={resetScanner} className="w-full">
                Quét tiếp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
