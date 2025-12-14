'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle, XCircle, ArrowLeft, Camera } from 'lucide-react'
import Link from 'next/link'

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isProcessing = useRef(false)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(console.error)
        }
        try {
          scannerRef.current.clear()
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])

  const startScanning = async () => {
    if (isScanning) return

    try {
        // Ensure element exists
        if (!document.getElementById("reader")) return;

        const scanner = new Html5Qrcode("reader")
        scannerRef.current = scanner
        isProcessing.current = false
        
        await scanner.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
                onScanSuccess(decodedText)
            },
            (errorMessage) => {
                // ignore errors
            }
        )
        setIsScanning(true)
    } catch (err) {
        console.error("Error starting scanner", err)
        toast({
            title: "Lỗi Camera",
            description: "Không thể khởi động camera. Vui lòng cấp quyền truy cập.",
            variant: "destructive"
        })
    }
  }

  const stopScanning = async () => {
      if (scannerRef.current && isScanning) {
          try {
              await scannerRef.current.stop()
              setIsScanning(false)
          } catch (err) {
              console.error("Error stopping scanner", err)
          }
      }
  }

  const onScanSuccess = (decodedText: string) => {
    if (isProcessing.current) return
    
    isProcessing.current = true
    setScanResult(decodedText)
    stopScanning()
    handleConfirm(decodedText)
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
          variant: "default"
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
    isProcessing.current = false
    // Wait for UI to render "reader" div then start
    setTimeout(() => {
        startScanning()
    }, 100)
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/dashboard">
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
            </Button>
        </Link>
        <h1 className="text-2xl font-bold">Quét mã QR</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Quét mã đổi quà</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!scanResult ? (
            <div className="space-y-4">
                <div id="reader" className="w-full overflow-hidden rounded-lg bg-black min-h-[300px]"></div>
                {!isScanning && (
                    <Button onClick={startScanning} className="w-full" variant="outline">
                        <Camera className="mr-2 h-4 w-4" />
                        Bật Camera
                    </Button>
                )}
                <p className="text-center text-sm text-muted-foreground">
                    Hướng camera về phía mã QR của khách hàng
                </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              {loading ? (
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              ) : resultData?.success ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              )}
              
              <div className="text-lg font-medium">
                {loading ? 'Đang xử lý...' : resultData?.message}
              </div>
              
              {!loading && (
                <Button onClick={resetScanner} className="w-full">
                  Quét tiếp
                </Button>
              )}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc nhập mã thủ công
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã đổi quà..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <Button 
              onClick={() => handleConfirm(manualCode)}
              disabled={!manualCode || loading}
            >
              Xác nhận
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
