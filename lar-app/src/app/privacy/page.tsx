import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-8">Chính Sách Bảo Mật</h1>
        
        <div className="prose prose-gray max-w-none bg-white rounded-xl p-8 shadow-sm">
          <p className="text-muted-foreground mb-6">
            Cập nhật lần cuối: 08/12/2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Giới thiệu</h2>
            <p>
              LAR ("chúng tôi", "của chúng tôi") cam kết bảo vệ quyền riêng tư của bạn. Chính sách Bảo mật 
              này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin cá nhân của bạn 
              khi bạn sử dụng dịch vụ LAR.
            </p>
            <p>
              Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý với các thực tiễn được mô tả trong 
              Chính sách Bảo mật này.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Thông tin chúng tôi thu thập</h2>
            
            <h3 className="text-lg font-medium mb-2">2.1. Thông tin bạn cung cấp</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Thông tin tài khoản:</strong> Họ tên, email, số điện thoại, tên công ty.</li>
              <li><strong>Thông tin thanh toán:</strong> Thông tin thẻ tín dụng (được xử lý an toàn qua Stripe).</li>
              <li><strong>Thông tin doanh nghiệp:</strong> Tên, địa chỉ, danh mục kinh doanh của các địa điểm bạn quản lý.</li>
              <li><strong>Nội dung:</strong> Các mẫu phản hồi, cài đặt tùy chỉnh, phản hồi đã chỉnh sửa.</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">2.2. Thông tin từ bên thứ ba</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Google Business Profile:</strong> Đánh giá khách hàng, thông tin địa điểm, phản hồi lịch sử.</li>
              <li><strong>Zalo OA:</strong> Tin nhắn, tương tác với khách hàng (khi bạn kết nối).</li>
              <li><strong>Đăng nhập mạng xã hội:</strong> Thông tin hồ sơ công khai khi bạn đăng nhập bằng Google.</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">2.3. Thông tin tự động thu thập</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dữ liệu sử dụng:</strong> Trang đã xem, thời gian sử dụng, hành động trong ứng dụng.</li>
              <li><strong>Thông tin thiết bị:</strong> Loại trình duyệt, hệ điều hành, địa chỉ IP.</li>
              <li><strong>Cookies:</strong> Để duy trì phiên đăng nhập và cải thiện trải nghiệm.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Cách chúng tôi sử dụng thông tin</h2>
            <p>Chúng tôi sử dụng thông tin thu thập để:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cung cấp, vận hành và cải thiện Dịch vụ.</li>
              <li>Tạo phản hồi AI phù hợp với ngữ cảnh doanh nghiệp của bạn.</li>
              <li>Gửi thông báo về đánh giá mới và hoạt động tài khoản.</li>
              <li>Xử lý thanh toán và quản lý đăng ký.</li>
              <li>Cung cấp hỗ trợ khách hàng.</li>
              <li>Phân tích xu hướng sử dụng để cải thiện sản phẩm.</li>
              <li>Phát hiện và ngăn chặn gian lận hoặc lạm dụng.</li>
              <li>Tuân thủ các nghĩa vụ pháp lý.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Chia sẻ thông tin</h2>
            <p>Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:</p>
            
            <h3 className="text-lg font-medium mb-2 mt-4">4.1. Nhà cung cấp dịch vụ</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>OpenAI / Google AI:</strong> Để xử lý phản hồi AI (dữ liệu được ẩn danh khi có thể).</li>
              <li><strong>Stripe:</strong> Xử lý thanh toán an toàn.</li>
              <li><strong>Vercel:</strong> Hosting và vận hành ứng dụng.</li>
              <li><strong>PostgreSQL providers:</strong> Lưu trữ dữ liệu.</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">4.2. Yêu cầu pháp lý</h3>
            <p>
              Chúng tôi có thể tiết lộ thông tin khi được yêu cầu bởi pháp luật, lệnh tòa án, 
              hoặc để bảo vệ quyền lợi hợp pháp của chúng tôi.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-4">4.3. Chuyển nhượng kinh doanh</h3>
            <p>
              Trong trường hợp sáp nhập, mua lại hoặc bán tài sản, thông tin có thể được chuyển giao 
              cho bên mới với cam kết bảo vệ tương đương.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Bảo mật dữ liệu</h2>
            <p>Chúng tôi áp dụng các biện pháp bảo mật sau:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Mã hóa:</strong> Tất cả dữ liệu được mã hóa khi truyền (HTTPS/TLS) và khi lưu trữ.</li>
              <li><strong>Xác thực:</strong> Hỗ trợ đăng nhập OAuth 2.0 an toàn.</li>
              <li><strong>Kiểm soát truy cập:</strong> Chỉ nhân viên được ủy quyền mới có quyền truy cập dữ liệu.</li>
              <li><strong>Giám sát:</strong> Hệ thống được giám sát 24/7 để phát hiện hoạt động bất thường.</li>
              <li><strong>Sao lưu:</strong> Dữ liệu được sao lưu định kỳ và lưu trữ an toàn.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Quyền của bạn</h2>
            <p>Theo quy định pháp luật Việt Nam, bạn có quyền:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Quyền truy cập:</strong> Yêu cầu xem thông tin cá nhân chúng tôi lưu trữ về bạn.</li>
              <li><strong>Quyền chỉnh sửa:</strong> Cập nhật hoặc sửa thông tin không chính xác.</li>
              <li><strong>Quyền xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu cá nhân.</li>
              <li><strong>Quyền phản đối:</strong> Từ chối một số hoạt động xử lý dữ liệu nhất định.</li>
              <li><strong>Quyền rút lui đồng ý:</strong> Hủy đăng ký nhận thông báo bất kỳ lúc nào.</li>
            </ul>
            <p className="mt-4">
              Để thực hiện các quyền này, vui lòng liên hệ: <strong>cuong.vhcc@gmail.com</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Lưu trữ dữ liệu</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dữ liệu tài khoản được lưu trữ trong suốt thời gian bạn sử dụng Dịch vụ.</li>
              <li>Sau khi xóa tài khoản, dữ liệu sẽ được xóa trong vòng 30 ngày.</li>
              <li>Một số dữ liệu có thể được giữ lại lâu hơn nếu pháp luật yêu cầu.</li>
              <li>Dữ liệu phân tích ẩn danh có thể được giữ lại để cải thiện Dịch vụ.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Cookies và Công nghệ theo dõi</h2>
            <p>Chúng tôi sử dụng cookies để:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies cần thiết:</strong> Duy trì phiên đăng nhập và bảo mật.</li>
              <li><strong>Cookies chức năng:</strong> Ghi nhớ tùy chọn của bạn.</li>
              <li><strong>Cookies phân tích:</strong> Hiểu cách bạn sử dụng Dịch vụ.</li>
            </ul>
            <p className="mt-4">
              Bạn có thể quản lý cookies thông qua cài đặt trình duyệt, nhưng việc tắt cookies 
              có thể ảnh hưởng đến một số chức năng.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Trẻ em</h2>
            <p>
              Dịch vụ của chúng tôi không dành cho người dưới 18 tuổi. Chúng tôi không cố ý thu thập 
              thông tin từ trẻ em. Nếu bạn phát hiện chúng tôi đã thu thập thông tin của trẻ em, 
              vui lòng liên hệ ngay để chúng tôi xử lý.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Thay đổi Chính sách</h2>
            <p>
              Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Các thay đổi quan trọng 
              sẽ được thông báo qua email hoặc thông báo trên Dịch vụ. Việc tiếp tục sử dụng Dịch vụ 
              sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận Chính sách mới.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Liên hệ</h2>
            <p>
              Nếu bạn có câu hỏi về Chính sách Bảo mật này hoặc muốn thực hiện các quyền của mình, 
              vui lòng liên hệ:
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
