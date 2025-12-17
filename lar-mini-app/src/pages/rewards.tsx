import React, { useEffect, useState } from "react";
import { Page, Header, Tabs, Box, Text, Button, Modal, useSnackbar } from "zmp-ui";
import { getRewards, getMyRedemptions, redeemReward, getCustomerInfo, checkRedemptionStatus, Reward, Redemption } from "../services/api";
import { useRecoilValue } from "recoil";
import { userState } from "../state";
import { QRCodeSVG } from "qrcode.react";

const CountdownTimer = ({ endTime }: { endTime: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        return "Đã kết thúc";
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      let text = "Hết hạn sau: ";
      if (days > 0) text += `${days}d `;
      text += `${hours}h ${minutes}m`;
      return text;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(interval);
  }, [endTime]);

  return <Text size="xxSmall" className="text-red-500 mb-1 block">{timeLeft}</Text>;
};

const RewardsPage = () => {
  const user = useRecoilValue(userState);
  const { openSnackbar } = useSnackbar();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<Redemption[]>([]);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [qrData, setQrData] = useState<{ code: string; redemptionId: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Polling for redemption status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrData) {
      interval = setInterval(async () => {
        const status = await checkRedemptionStatus(qrData.redemptionId);
        if (status === 'COMPLETED') {
          clearInterval(interval);
          setQrData(null);
          openSnackbar({ text: "Đổi quà thành công!", type: "success" });
          loadData(); // Refresh points and list
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [qrData]);

  const loadData = async () => {
    if (user.id) {
      const [rewardsData, redemptionsData, customerData] = await Promise.all([
        getRewards(),
        getMyRedemptions(user.id),
        getCustomerInfo(user.id)
      ]);
      setRewards(rewardsData);
      setMyRedemptions(redemptionsData);
      setCustomerPoints(customerData.points);
    }
  };

  const handleRedeem = async () => {
    if (!selectedReward || !user.id) return;
    setLoading(true);
    try {
      const data = await redeemReward(user.id, selectedReward.id);
      setConfirmModalVisible(false);
      setQrData({ code: data.code, redemptionId: data.redemptionId });
      loadData(); // Refresh data
    } catch (error) {
      console.error(error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white">
      <Header title="Đổi quà" showBackIcon={false} />
      <Tabs id="rewards-tab">
        <Tabs.Tab key="list" label="Danh sách quà">
          <Box p={4}>
            <Box className="mb-4 p-4 bg-primary rounded-lg flex justify-between items-center">
              <Text className="font-bold text-white">Điểm của bạn:</Text>
              <Text className="font-bold text-xl text-white">{customerPoints}</Text>
            </Box>
            {rewards.map((reward) => (
              <Box key={reward.id} className="flex gap-4 mb-4 border p-4 rounded-lg">
                <img src={reward.image || "https://via.placeholder.com/80"} alt={reward.name} className="w-20 h-20 object-cover rounded" />
                <Box className="flex-1">
                  <Text.Title size="small">{reward.name}</Text.Title>
                  <Text size="xxSmall" className="text-gray-500 mb-1">{reward.pointsRequired} điểm</Text>
                  <Text size="xxSmall" className="text-gray-500 mb-1">Còn lại: {reward.quantity}</Text>
                  {reward.endTime && <CountdownTimer endTime={reward.endTime} />}
                  <Button 
                    size="small" 
                    disabled={customerPoints < reward.pointsRequired}
                    onClick={() => {
                      setSelectedReward(reward);
                      setConfirmModalVisible(true);
                    }}
                  >
                    Đổi ngay
                  </Button>
                </Box>
              </Box>
            ))}
            {rewards.length === 0 && <Text className="text-center text-gray-500">Chưa có quà nào.</Text>}
          </Box>
        </Tabs.Tab>
        <Tabs.Tab key="my-rewards" label="Quà của tôi">
          <Box p={4}>
            {myRedemptions.map((redemption) => (
              <Box key={redemption.id} className="mb-4 border p-4 rounded-lg flex flex-col items-center">
                <Text.Title size="small" className="mb-2">{redemption.reward.name}</Text.Title>
                {redemption.status === 'PENDING' ? (
                  <>
                    <QRCodeSVG value={redemption.code} size={150} />
                    <Text size="small" className="mt-2 font-bold">{redemption.code}</Text>
                    <Text size="xxSmall" className="text-gray-500 mt-1">Đưa mã này cho nhân viên để xác nhận</Text>
                  </>
                ) : (
                  <Text className={redemption.status === 'COMPLETED' ? 'text-green-500' : 'text-red-500'}>
                    {redemption.status === 'COMPLETED' ? 'Đã sử dụng' : redemption.status}
                  </Text>
                )}
              </Box>
            ))}
            {myRedemptions.length === 0 && <Text className="text-center text-gray-500">Bạn chưa đổi quà nào.</Text>}
          </Box>
        </Tabs.Tab>
      </Tabs>

      <Modal
        visible={confirmModalVisible}
        title="Xác nhận đổi quà"
        onClose={() => setConfirmModalVisible(false)}
        actions={[
          {
            text: "Hủy",
            onClick: () => setConfirmModalVisible(false),
          },
          {
            text: "Đồng ý",
            highLight: true,
            onClick: handleRedeem,
            loading: loading
          },
        ]}
      >
        <Box>
          <Text>Bạn có chắc chắn muốn đổi {selectedReward?.pointsRequired} điểm để lấy "{selectedReward?.name}" không?</Text>
        </Box>
      </Modal>

      <Modal
        visible={!!qrData}
        title="Mã đổi quà"
        onClose={() => setQrData(null)}
        description="Vui lòng đưa mã QR này cho nhân viên để xác nhận đổi quà."
      >
        <Box className="flex flex-col items-center justify-center p-4">
          {qrData && (
            <>
              <QRCodeSVG value={qrData.code} size={200} />
              <Text className="mt-4 font-bold text-xl tracking-widest">{qrData.code}</Text>
              <Text size="small" className="text-gray-500 mt-2">Đang chờ xác nhận...</Text>
            </>
          )}
        </Box>
      </Modal>
    </Page>
  );
};

export default RewardsPage;
