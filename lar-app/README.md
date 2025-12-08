# LAR - Local AI Responder
## AI Danh Tiếng Việt - Quản lý danh tiếng địa phương cho SME Việt Nam

### 🎯 Tổng quan

LAR (Local AI Responder) là ứng dụng SaaS giúp các doanh nghiệp vừa và nhỏ (SME) Việt Nam tự động hóa việc quản lý và phản hồi đánh giá khách hàng trên Google Business Profile và Zalo OA.

### ✨ Tính năng chính

#### 1. Connect & Monitor (Kết nối & Giám sát)
- Tích hợp Google Business Profile
- Tích hợp Zalo Official Account
- Theo dõi đánh giá real-time
- Phân tích cảm xúc tự động (Positive/Neutral/Negative)

#### 2. AI-Generated Replies (Phản hồi AI)
- Tự động tạo phản hồi cá nhân hóa
- 5 giọng điệu: Friendly, Professional, Empathetic, Concise, Formal
- Hệ thống phê duyệt trước khi đăng
- Hỗ trợ tiếng Việt tự nhiên

#### 3. Local Performance Reporting (Báo cáo hiệu suất)
- Dashboard phân tích tổng quan
- Xu hướng đánh giá theo thời gian
- Phân tích từ khóa phổ biến
- Tỷ lệ phản hồi và điểm trung bình

#### 4. Tính năng bổ sung
- Phát hiện review ảo (AI Review Seeding Detection)
- Thông báo qua Zalo ZNS khi có đánh giá mới
- Quản lý đa địa điểm

### 💰 Mô hình giá Freemium

| Gói | Giá | Tính năng |
|-----|-----|-----------|
| **Free** | $0/tháng | 1 địa điểm, 10 phản hồi AI/tháng |
| **Essential** | $19/tháng | 5 địa điểm, phản hồi không giới hạn, Zalo OA |
| **Professional** | $49/tháng | Không giới hạn, phát hiện review ảo, hỗ trợ ưu tiên |

### 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4o-mini / Google Gemini 1.5 Flash
- **Charts**: Recharts

### 📁 Cấu trúc thư mục

```
lar-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── reviews/       # Review management
│   │   │   ├── businesses/    # Business management
│   │   │   ├── locations/     # Location management
│   │   │   ├── analytics/     # Analytics endpoints
│   │   │   └── subscription/  # Subscription management
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Dashboard pages
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # UI components (Button, Card, etc.)
│   │   ├── layout/            # Layout components
│   │   ├── reviews/           # Review components
│   │   └── analytics/         # Analytics components
│   └── lib/
│       ├── prisma.ts          # Prisma client
│       ├── auth.ts            # Auth configuration
│       ├── ai.ts              # AI/LLM integration
│       ├── google-business.ts # GBP API client
│       ├── zalo-oa.ts         # Zalo OA API client
│       └── utils.ts           # Utility functions
├── .env.example               # Environment variables template
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

### 🚀 Bắt đầu

#### 1. Cài đặt dependencies

```bash
cd lar-app
npm install
```

#### 2. Cấu hình môi trường

```bash
cp .env.example .env
# Chỉnh sửa file .env với các API keys của bạn
```

#### 3. Khởi tạo database

```bash
npm run db:generate
npm run db:push
```

#### 4. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### 🔑 Cấu hình API Keys

#### OpenAI
1. Đăng ký tại [OpenAI Platform](https://platform.openai.com/)
2. Tạo API key và thêm vào `OPENAI_API_KEY`

#### Google Business Profile
1. Tạo project trong [Google Cloud Console](https://console.cloud.google.com/)
2. Bật Google My Business API
3. Tạo OAuth credentials

#### Zalo OA
1. Đăng ký tại [Zalo for Developers](https://developers.zalo.me/)
2. Tạo ứng dụng và lấy App ID, Secret
3. Kết nối với Zalo Official Account

### 📊 Chi phí API ước tính

| Service | Use Case | Chi phí |
|---------|----------|---------|
| GPT-4o-mini | Tạo phản hồi | ~$0.0002/phản hồi |
| Gemini 1.5 Flash | Alternative LLM | ~$0.0001/phản hồi |
| DataForSEO | Lấy reviews (Standard Queue) | $1.5/1000 profiles |

### 🎯 Roadmap

- [x] MVP: Phản hồi AI cho GBP
- [x] Phân tích cảm xúc
- [x] Dashboard analytics
- [ ] Tích hợp Zalo OA đầy đủ
- [ ] Local SEO Audit
- [ ] CRM Lite
- [ ] Mobile app

### 📄 License

MIT License

### 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Issue hoặc Pull Request.

---

Được phát triển với ❤️ cho SME Việt Nam
