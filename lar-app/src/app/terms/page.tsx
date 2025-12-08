import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">LAR</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Điều Khoản Sử Dụng</h1>
        
        <div className="prose prose-gray max-w-none bg-white rounded-xl p-8 shadow-sm">
          <p className="text-muted-foreground mb-6">
            Cập nhật lần cuối: 08/12/2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Giới thiệu</h2>
            <p>
              Chào mừng bạn đến với LAR (Local AI Responder). Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, 
              bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này.
            </p>
            <p>
              LAR là nền tảng SaaS giúp các doanh nghiệp vừa và nhỏ (SME) tại Việt Nam quản lý và phản hồi 
              đánh giá khách hàng trên Google Business Profile và Zalo Official Account bằng công nghệ AI.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Định nghĩa</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>"Dịch vụ"</strong>: Tất cả các tính năng, công cụ và sản phẩm do LAR cung cấp.</li>
              <li><strong>"Người dùng"</strong>: Cá nhân hoặc tổ chức đăng ký và sử dụng Dịch vụ.</li>
              <li><strong>"Nội dung"</strong>: Bao gồm văn bản, hình ảnh, dữ liệu và các thông tin khác được tạo ra hoặc chia sẻ thông qua Dịch vụ.</li>
              <li><strong>"AI"</strong>: Công nghệ trí tuệ nhân tạo được sử dụng để tạo phản hồi tự động.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Điều kiện sử dụng</h2>
            <p>Để sử dụng Dịch vụ, bạn phải:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Từ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp.</li>
              <li>Cung cấp thông tin chính xác và đầy đủ khi đăng ký tài khoản.</li>
              <li>Có quyền hợp pháp để quản lý các trang Google Business Profile hoặc Zalo OA mà bạn kết nối.</li>
              <li>Tuân thủ tất cả các luật pháp và quy định hiện hành tại Việt Nam.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Quyền và trách nhiệm của Người dùng</h2>
            <h3 className="text-lg font-medium mb-2">4.1. Quyền của Người dùng</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Truy cập và sử dụng Dịch vụ theo gói đăng ký đã chọn.</li>
              <li>Được hỗ trợ kỹ thuật theo chính sách của từng gói dịch vụ.</li>
              <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân bất kỳ lúc nào.</li>
            </ul>
            
            <h3 className="text-lg font-medium mb-2">4.2. Trách nhiệm của Người dùng</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bảo mật thông tin đăng nhập và chịu trách nhiệm cho mọi hoạt động dưới tài khoản của mình.</li>
              <li>Không sử dụng Dịch vụ cho mục đích bất hợp pháp hoặc vi phạm quyền của bên thứ ba.</li>
              <li>Đảm bảo nội dung phản hồi được phê duyệt trước khi đăng công khai.</li>
              <li>Không cố gắng can thiệp, phá hoại hoặc truy cập trái phép vào hệ thống.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Phản hồi AI và Trách nhiệm</h2>
            <p>
              Các phản hồi được tạo bởi AI chỉ mang tính chất gợi ý. Người dùng có trách nhiệm:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Xem xét và chỉnh sửa phản hồi AI trước khi công khai nếu cần.</li>
              <li>Đảm bảo phản hồi phù hợp với chính sách của doanh nghiệp và pháp luật.</li>
              <li>Chịu trách nhiệm hoàn toàn về nội dung được đăng công khai.</li>
            </ul>
            <p className="mt-4">
              LAR không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng phản hồi AI 
              mà không được kiểm tra hoặc chỉnh sửa phù hợp.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Thanh toán và Hoàn tiền</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Các gói trả phí được tính theo chu kỳ hàng tháng.</li>
              <li>Thanh toán được xử lý tự động vào ngày gia hạn.</li>
              <li>Người dùng có thể hủy đăng ký bất kỳ lúc nào. Dịch vụ sẽ tiếp tục đến hết chu kỳ đã thanh toán.</li>
              <li>Yêu cầu hoàn tiền sẽ được xem xét trong vòng 7 ngày kể từ ngày thanh toán.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Quyền sở hữu trí tuệ</h2>
            <p>
              Tất cả quyền sở hữu trí tuệ liên quan đến Dịch vụ, bao gồm nhưng không giới hạn ở phần mềm, 
              giao diện, thuật toán và thương hiệu, thuộc về LAR hoặc các bên cấp phép của chúng tôi.
            </p>
            <p className="mt-4">
              Người dùng giữ quyền sở hữu đối với dữ liệu kinh doanh và nội dung của mình.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Giới hạn trách nhiệm</h2>
            <p>
              LAR cung cấp Dịch vụ "nguyên trạng" và không đưa ra bất kỳ bảo đảm nào về tính liên tục, 
              chính xác hoặc phù hợp cho mục đích cụ thể. Trong mọi trường hợp, trách nhiệm của LAR 
              không vượt quá số tiền Người dùng đã thanh toán trong 12 tháng gần nhất.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Chấm dứt</h2>
            <p>
              LAR có quyền đình chỉ hoặc chấm dứt tài khoản của Người dùng nếu:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vi phạm Điều khoản sử dụng này.</li>
              <li>Sử dụng Dịch vụ cho mục đích bất hợp pháp.</li>
              <li>Không thanh toán phí dịch vụ đúng hạn.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Thay đổi Điều khoản</h2>
            <p>
              LAR có quyền cập nhật Điều khoản sử dụng này. Chúng tôi sẽ thông báo cho Người dùng 
              về các thay đổi quan trọng qua email hoặc thông báo trên Dịch vụ.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Liên hệ</h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ:
            </p>
            <ul className="list-none mt-4 space-y-2">
              <li><strong>Email:</strong> cuong.vhcc@gmail.com</li>
              <li><strong>Hotline:</strong> 0987 939 605</li>
              <li><strong>Địa chỉ:</strong> TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 LAR - Local AI Responder. Được phát triển cho SME Việt Nam.
        </div>
      </footer>
    </div>
  )
}
