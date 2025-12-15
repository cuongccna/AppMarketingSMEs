import React, { useState } from "react";
import { Box, Text, Button, Input, useSnackbar, Icon } from "zmp-ui";
import { getUserInfo } from "zmp-sdk/apis";
import { openWebview } from "zmp-sdk";
import { submitReview } from "services/api";

interface ReviewSectionProps {
  locationId: string;
  locationName: string;
  onReviewSuccess?: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ locationId, locationName, onReviewSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { openSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    if (rating === 0) {
      openSnackbar({
        text: "Vui lòng chọn số sao đánh giá",
        type: "warning",
      });
      return;
    }

    // Ưu tiên chuyển hướng ngay lập tức nếu 5 sao
    if (rating === 5) {
      openWebview({
        url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`,
      });
    }

    setSubmitting(true);
    try {
      const { userInfo } = await getUserInfo({});
      
      await submitReview({
        locationId,
        rating,
        content: comment,
        zaloUserId: userInfo.id,
        zaloUserName: userInfo.name,
        zaloAvatar: userInfo.avatar,
      });
      
      openSnackbar({
        text: "Cảm ơn bạn đã gửi đánh giá!",
        type: "success",
        duration: 3000,
      });

      // Nếu không phải 5 sao thì mới reset form ngay (5 sao thì người dùng đang ở trang khác)
      if (rating !== 5) {
        setRating(0);
        setComment("");
      } else {
        // Reset sau một khoảng thời gian để khi quay lại form đã sạch
        setTimeout(() => {
          setRating(0);
          setComment("");
        }, 2000);
      }
      
      // Wait a bit for backend to process points
      setTimeout(() => {
        if (onReviewSuccess) {
          onReviewSuccess();
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      openSnackbar({
        text: "Có lỗi xảy ra, vui lòng thử lại",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="mx-4 mb-4 mt-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
      <Text.Title size="normal" className="mb-2 font-bold text-center">
        Đánh giá {locationName}
      </Text.Title>
      
      <Box className="flex justify-center mb-4 gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <div 
            key={star} 
            onClick={() => setRating(star)}
            className="cursor-pointer transition-transform active:scale-90"
          >
            <Icon
              icon={star <= rating ? "zi-star-solid" : "zi-star"}
              className={star <= rating ? "text-yellow-400" : "text-gray-300"}
              style={{ fontSize: 28, color: star <= rating ? '#FADB14' : '#E0E0E0' }}
            />
          </div>
        ))}
      </Box>

      <Box className="mb-4">
        <Input.TextArea
          placeholder="Chia sẻ cảm nhận của bạn về dịch vụ..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          showCount
          maxLength={200}
          rows={3}
        />
      </Box>

      <Button 
        fullWidth 
        onClick={handleSubmit} 
        disabled={rating === 0 || submitting}
        loading={submitting}
        size="large"
      >
        Gửi đánh giá
      </Button>
    </Box>
  );
};
