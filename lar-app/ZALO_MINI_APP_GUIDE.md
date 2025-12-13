# Hướng dẫn phát triển Zalo Mini App cho LAR

Tài liệu này hướng dẫn cách xây dựng Frontend cho Zalo Mini App để kết nối với hệ thống LAR Backend đã xây dựng.

## 1. Chuẩn bị môi trường

1.  **Cài đặt Node.js**: Phiên bản 16 trở lên.
2.  **Cài đặt Zalo Mini App CLI**:
    ```bash
    npm install -g zmp-cli
    ```
3.  **Tải Zalo Mini App Studio**: [Download tại đây](https://mini.zalo.me/docs/getting-started/zalo-mini-app-studio).

## 2. Khởi tạo dự án

Mở terminal và chạy lệnh sau để tạo dự án mới:

```bash
zmp init lar-mini-app
```

Chọn template: **React** (hoặc TypeScript nếu bạn quen thuộc).

## 3. Cấu trúc dự án & Cài đặt Dependencies

Di chuyển vào thư mục dự án:
```bash
cd lar-mini-app
npm install
npm install axios recoil zmp-ui zmp-sdk
```

## 4. Cấu hình kết nối API

Tạo file `.env` trong thư mục gốc của Mini App:

```env
VITE_API_BASE_URL=https://your-domain.com/api/mini-app
```
*(Thay `https://your-domain.com` bằng domain thực tế của bạn hoặc ngrok URL nếu đang test local)*

## 5. Triển khai Code (Ví dụ mẫu)

### 5.1. API Service (`src/services/api.js`)

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const getLocations = async (search = '') => {
  const response = await axios.get(`${API_URL}/locations`, {
    params: { search }
  });
  return response.data.data;
};

export const getLocationDetails = async (id) => {
  const response = await axios.get(`${API_URL}/locations/${id}`);
  return response.data.data;
};

export const submitReview = async (data) => {
  const response = await axios.post(`${API_URL}/reviews`, data);
  return response.data;
};
```

### 5.2. Trang chủ - Danh sách địa điểm (`src/pages/index.jsx`)

```jsx
import React, { useEffect, useState } from 'react';
import { Page, Header, Input, List, Item, Text, useNavigate } from 'zmp-ui';
import { getLocations } from '../services/api';

const HomePage = () => {
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async (search = '') => {
    try {
      const data = await getLocations(search);
      setLocations(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Page>
      <Header title="LAR - Tìm kiếm địa điểm" />
      <div className="p-4">
        <Input.Search 
          placeholder="Tìm kiếm cửa hàng..." 
          onSearch={(val) => loadLocations(val)} 
        />
      </div>
      <List>
        {locations.map((loc) => (
          <Item 
            key={loc.id} 
            title={loc.name}
            subTitle={loc.address}
            onClick={() => navigate(`/location/${loc.id}`)}
            suffix={<Text className="text-blue-500">{loc.rating}⭐</Text>}
          />
        ))}
      </List>
    </Page>
  );
};

export default HomePage;
```

### 5.3. Trang chi tiết & Gửi đánh giá (`src/pages/detail.jsx`)

```jsx
import React, { useEffect, useState } from 'react';
import { Page, Header, Text, Button, Box, Icon, useSnackbar } from 'zmp-ui';
import { useParams } from 'react-router-dom';
import { getLocationDetails, submitReview } from '../services/api';
import { getUserInfo } from 'zmp-sdk/apis';

const DetailPage = () => {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    if (id) loadDetail();
  }, [id]);

  const loadDetail = async () => {
    const data = await getLocationDetails(id);
    setLocation(data);
  };

  const handleRate = async (rating) => {
    try {
      const { userInfo } = await getUserInfo({});
      await submitReview({
        locationId: id,
        rating: rating,
        content: "Đánh giá từ Zalo Mini App",
        zaloUserId: userInfo.id,
        zaloUserName: userInfo.name,
        zaloPhone: userInfo.phone // Cần xin quyền lấy sđt
      });
      openSnackbar({ text: "Cảm ơn bạn đã đánh giá!", type: "success" });
      loadDetail(); // Reload để thấy review mới
    } catch (error) {
      openSnackbar({ text: "Lỗi khi gửi đánh giá", type: "error" });
    }
  };

  if (!location) return <Page><Text>Loading...</Text></Page>;

  return (
    <Page>
      <Header title={location.name} />
      <Box p={4}>
        <Text size="xLarge" bold>{location.name}</Text>
        <Text className="text-gray-500 mb-4">{location.address}</Text>
        
        <div className="flex items-center gap-2 mb-4">
          <Text size="xxLarge" bold className="text-yellow-500">{location.rating}</Text>
          <Text>({location.reviewCount} đánh giá)</Text>
        </div>

        <Text bold className="mb-2">Gửi đánh giá của bạn:</Text>
        <div className="flex gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button key={star} size="small" onClick={() => handleRate(star)}>
              {star}⭐
            </Button>
          ))}
        </div>

        <Text bold size="large" className="mb-2">Đánh giá gần đây</Text>
        {location.reviews.map((review) => (
          <Box key={review.id} className="border-b py-2">
            <Text bold>{review.author}</Text>
            <Text>{review.content}</Text>
            <Text size="small" className="text-gray-400">{review.date}</Text>
            {review.reply && (
              <Box className="bg-gray-100 p-2 mt-2 rounded">
                <Text size="small" bold>Phản hồi từ cửa hàng:</Text>
                <Text size="small">{review.reply.content}</Text>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Page>
  );
};

export default DetailPage;
```

## 6. Chạy thử nghiệm

1.  Chạy lệnh:
    ```bash
    zmp start
    ```
2.  Quét mã QR bằng ứng dụng Zalo trên điện thoại để xem kết quả.

## 7. Lưu ý quan trọng

*   **Quyền truy cập**: Để lấy số điện thoại người dùng (`userInfo.phone`), Mini App cần được cấp quyền này trong trang quản lý Zalo Mini App.
*   **Domain Whitelist**: Bạn cần thêm domain API (`your-domain.com`) vào danh sách **Domain Whitelist** trong phần cài đặt của Zalo Mini App.
*   **Zalo OA**: Đảm bảo Zalo OA đã được kết nối trong LAR Dashboard để nhận thông báo ZNS.
