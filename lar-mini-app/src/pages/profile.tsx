import React, { FC, useEffect, useState } from "react";
import { Box, Header, Icon, Page, Text, Sheet, Avatar } from "zmp-ui";
import subscriptionDecor from "static/subscription-decor.svg";
import { ListRenderer } from "components/list-renderer";
import { useToBeImplemented } from "hooks";
import { getUserInfo, openPhone } from "zmp-sdk/apis";
import { getCustomerInfo, CustomerInfo, getUserReviews, getRewards, redeemReward, checkRedemptionStatus, Reward, getRedemptionHistory, Redemption } from "services/api";
import { Button, useSnackbar, Modal } from "zmp-ui";
import { QRCodeCanvas } from "qrcode.react";

const RewardsSheet: FC<{ visible: boolean; onClose: () => void; userInfo: any; customerPoints: number; onRedeemSuccess: () => void }> = ({ visible, onClose, userInfo, customerPoints, onRedeemSuccess }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{ code: string; redemptionId: string } | null>(null);
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getRewards()
        .then(setRewards)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [visible]);

  // Polling for status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrData) {
      interval = setInterval(async () => {
        const status = await checkRedemptionStatus(qrData.redemptionId);
        if (status === 'COMPLETED') {
          clearInterval(interval);
          setQrData(null);
          openSnackbar({ text: "Đổi quà thành công!", type: "success" });
          onRedeemSuccess();
          onClose();
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [qrData, onRedeemSuccess, onClose, openSnackbar]);

  const handleRedeem = async (reward: Reward) => {
    if (customerPoints < reward.pointsRequired) {
      openSnackbar({ text: "Bạn không đủ điểm để đổi quà này", type: "error" });
      return;
    }

    try {
      const data = await redeemReward(userInfo.id, reward.id);
      console.log("Redemption data:", data);
      setQrData({ code: data.code, redemptionId: data.redemptionId });
    } catch (error: any) {
      console.error("Redemption error:", error);
      openSnackbar({ text: error.message || "Đổi quà thất bại", type: "error" });
    }
  };

  return (
    <>
      <Sheet visible={visible} onClose={onClose} autoHeight title="Đổi quà">
        <Box className="p-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <Text className="text-center text-gray-500">Đang tải danh sách quà...</Text>
          ) : rewards.length === 0 ? (
            <Text className="text-center text-gray-500">Hiện chưa có quà tặng nào</Text>
          ) : (
            <Box className="grid grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <Box key={reward.id} className="border rounded-lg p-3 flex flex-col items-center text-center">
                  <div className="w-full aspect-square bg-gray-100 rounded-md mb-2 overflow-hidden">
                    {reward.image ? (
                      <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="zi-gift" className="text-gray-400 text-4xl m-auto h-full flex items-center justify-center" />
                    )}
                  </div>
                  <Text className="font-bold line-clamp-1">{reward.name}</Text>
                  <Text size="xxSmall" className="text-gray-500 mb-2">{reward.pointsRequired} điểm</Text>
                  <Button 
                    size="small" 
                    fullWidth 
                    disabled={customerPoints < reward.pointsRequired}
                    onClick={() => handleRedeem(reward)}
                  >
                    Đổi quà
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Sheet>

      <Modal
        visible={!!qrData}
        title="Mã đổi quà"
        onClose={() => setQrData(null)}
        description="Vui lòng đưa mã QR này cho nhân viên để xác nhận đổi quà."
      >
        <Box className="flex flex-col items-center justify-center p-4">
          {qrData && (
            <>
              <QRCodeCanvas value={qrData.code} size={200} />
              <Text className="mt-4 font-bold text-xl tracking-widest">{qrData.code}</Text>
              <Text size="small" className="text-gray-500 mt-2">Đang chờ xác nhận...</Text>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

const Subscription: FC<{ userInfo: any; customerInfo: CustomerInfo }> = ({ userInfo, customerInfo }) => {
  return (
    <Box className="m-4">
      <Box
        className="bg-green text-white rounded-xl p-4 space-y-2"
        style={{
          backgroundImage: `url(${subscriptionDecor})`,
          backgroundPosition: "right 8px center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Text.Title className="font-bold">{userInfo?.name || "Thành viên"}</Text.Title>
        <Text size="small">Hạng: {customerInfo.level} | Điểm: {customerInfo.points.toLocaleString()}</Text>
      </Box>
    </Box>
  );
};

const UserInfoSheet: FC<{ visible: boolean; onClose: () => void; userInfo: any; customerInfo: CustomerInfo }> = ({ visible, onClose, userInfo, customerInfo }) => {
  return (
    <Sheet visible={visible} onClose={onClose} autoHeight title="Thông tin tài khoản">
      <Box className="p-4 flex flex-col items-center space-y-4">
        <Avatar src={userInfo?.avatar || ""} size={80} />
        <Text.Title>{userInfo?.name}</Text.Title>
        <Box className="w-full space-y-2">
          <Box className="flex justify-between">
            <Text className="text-gray-500">ID:</Text>
            <Text>{userInfo?.id}</Text>
          </Box>
          <Box className="flex justify-between">
            <Text className="text-gray-500">Hạng thành viên:</Text>
            <Text className="font-bold text-green-600">{customerInfo.level}</Text>
          </Box>
          <Box className="flex justify-between">
            <Text className="text-gray-500">Điểm tích lũy:</Text>
            <Text className="font-bold text-green-600">{customerInfo.points}</Text>
          </Box>
        </Box>
      </Box>
    </Sheet>
  );
};

const ReviewHistorySheet: FC<{ visible: boolean; onClose: () => void; zaloId: string }> = ({ visible, onClose, zaloId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && zaloId) {
      setLoading(true);
      getUserReviews(zaloId)
        .then(setReviews)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [visible, zaloId]);

  return (
    <Sheet visible={visible} onClose={onClose} autoHeight title="Lịch sử đánh giá">
      <Box className="p-4 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <Text className="text-center text-gray-500">Đang tải...</Text>
        ) : reviews.length === 0 ? (
          <Text className="text-center text-gray-500">Chưa có đánh giá nào</Text>
        ) : (
          reviews.map((review, index) => (
            <Box key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <Box className="flex justify-between mb-1">
                <Text className="font-bold">{review.location?.name || "Địa điểm"}</Text>
                <Box className="flex text-yellow-500">
                  {[...Array(review.rating)].map((_, i) => (
                    <Icon key={i} icon="zi-star-solid" size={12} />
                  ))}
                </Box>
              </Box>
              <Text size="small" className="text-gray-600 mb-1">{review.content}</Text>
              <Text size="xxSmall" className="text-gray-400">{new Date(review.date).toLocaleDateString()}</Text>
            </Box>
          ))
        )}
      </Box>
    </Sheet>
  );
};

const PointHistorySheet: FC<{ visible: boolean; onClose: () => void; transactions: any[] }> = ({ visible, onClose, transactions }) => {
  return (
    <Sheet visible={visible} onClose={onClose} autoHeight title="Lịch sử tích điểm">
      <Box className="p-4">
        {transactions.length === 0 ? (
          <Text className="text-center text-gray-500">Chưa có giao dịch nào</Text>
        ) : (
          transactions.map((tx, index) => (
            <Box key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
              <Box>
                <Text className="font-medium">{tx.description || "Giao dịch"}</Text>
                <Text size="xxSmall" className="text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</Text>
              </Box>
              <Text className={`font-bold ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                {tx.amount > 0 ? "+" : ""}{tx.amount}
              </Text>
            </Box>
          ))
        )}
      </Box>
    </Sheet>
  );
};

const RedemptionHistorySheet: FC<{ visible: boolean; onClose: () => void; zaloId: string }> = ({ visible, onClose, zaloId }) => {
  const [history, setHistory] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && zaloId) {
      setLoading(true);
      getRedemptionHistory(zaloId)
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [visible, zaloId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-500';
      case 'PENDING': return 'text-yellow-500';
      case 'CANCELLED': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Thành công';
      case 'PENDING': return 'Đang chờ';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} autoHeight title="Lịch sử đổi quà">
      <Box className="p-4 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <Text className="text-center text-gray-500">Đang tải...</Text>
        ) : history.length === 0 ? (
          <Text className="text-center text-gray-500">Chưa có lịch sử đổi quà</Text>
        ) : (
          history.map((item) => (
            <Box key={item.id} className="mb-4 p-3 bg-gray-50 rounded-lg flex gap-3">
              <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0">
                 {item.reward.image ? (
                    <img src={item.reward.image} alt={item.reward.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon icon="zi-gift" className="text-gray-400 text-2xl m-auto h-full flex items-center justify-center" />
                  )}
              </div>
              <Box className="flex-1">
                <Text className="font-bold line-clamp-1">{item.reward.name}</Text>
                <Box className="flex justify-between items-center mt-1">
                  <Text size="small" className="text-gray-500">-{item.pointsSpent} điểm</Text>
                  <Text size="small" className={`font-medium ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </Text>
                </Box>
                <Text size="xxSmall" className="text-gray-400 mt-1">
                  {new Date(item.createdAt).toLocaleDateString()} - Mã: {item.code}
                </Text>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Sheet>
  );
};

const Personal: FC<{ userInfo: any; customerInfo: CustomerInfo; onRefresh: () => void }> = ({ userInfo, customerInfo, onRefresh }) => {
  const [historyVisible, setHistoryVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [rewardsVisible, setRewardsVisible] = useState(false);
  const [redemptionHistoryVisible, setRedemptionHistoryVisible] = useState(false);

  return (
    <Box className="m-4">
      <ListRenderer
        title="Cá nhân"
        items={[
          {
            left: <Icon icon="zi-user" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Thông tin tài khoản
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
            onClick: () => setInfoVisible(true)
          },
          {
            left: <Icon icon="zi-clock-2" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Lịch sử tích điểm
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
            onClick: () => setHistoryVisible(true)
          },
          {
            left: <Icon icon="zi-gift-solid" className="text-green-600" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Đổi quà
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
            onClick: () => setRewardsVisible(true)
          },
          {
            left: <Icon icon="zi-clock-1" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Lịch sử đổi quà
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
            onClick: () => setRedemptionHistoryVisible(true)
          },
        ]}
        renderLeft={(item) => item.left}
        renderRight={(item) => item.right}
      />
      <PointHistorySheet 
        visible={historyVisible} 
        onClose={() => setHistoryVisible(false)} 
        transactions={customerInfo.transactions} 
      />
      <UserInfoSheet
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
        userInfo={userInfo}
        customerInfo={customerInfo}
      />
      <RewardsSheet
        visible={rewardsVisible}
        onClose={() => setRewardsVisible(false)}
        userInfo={userInfo}
        customerPoints={customerInfo.points}
        onRedeemSuccess={onRefresh}
      />
      <RedemptionHistorySheet
        visible={redemptionHistoryVisible}
        onClose={() => setRedemptionHistoryVisible(false)}
        zaloId={userInfo?.id}
      />
    </Box>
  );
};

const ContactSheet: FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const handleCallHotline = () => {
    openPhone({ phoneNumber: "0987939605" });
  };

  return (
    <Sheet visible={visible} onClose={onClose} autoHeight title="Liên hệ và góp ý">
      <Box className="p-4 space-y-4">
        <Box className="flex items-center space-x-3" onClick={handleCallHotline}>
          <Box className="bg-green-100 p-2 rounded-full">
            <Icon icon="zi-call" className="text-green-600" />
          </Box>
          <Box>
            <Text className="font-medium">Hotline</Text>
            <Text size="small" className="text-gray-500">0987 939 605</Text>
          </Box>
        </Box>
        
        <Box className="flex items-center space-x-3">
          <Box className="bg-blue-100 p-2 rounded-full">
            <Icon icon="zi-at" className="text-blue-600" />
          </Box>
          <Box>
            <Text className="font-medium">Email</Text>
            <Text size="small" className="text-gray-500">cuong.vhcc@gmail.com</Text>
          </Box>
        </Box>

        <Box className="bg-gray-50 p-3 rounded-lg">
          <Text size="small" className="text-center text-gray-500">
            Mọi ý kiến đóng góp của bạn giúp chúng tôi cải thiện chất lượng dịch vụ tốt hơn.
          </Text>
        </Box>
      </Box>
    </Sheet>
  );
};

const Other: FC<{ userInfo: any }> = ({ userInfo }) => {
  const [reviewHistoryVisible, setReviewHistoryVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const notImplemented = useToBeImplemented();

  return (
    <Box className="m-4">
      <ListRenderer
        title="Khác"
        items={[
          {
            left: <Icon icon="zi-star" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Lịch sử đánh giá
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
            onClick: () => setReviewHistoryVisible(true)
          },
          {
            left: <Icon icon="zi-call" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Liên hệ và góp ý
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
            onClick: () => setContactVisible(true)
          },
        ]}
        renderLeft={(item) => item.left}
        renderRight={(item) => item.right}
      />
      <ReviewHistorySheet
        visible={reviewHistoryVisible}
        onClose={() => setReviewHistoryVisible(false)}
        zaloId={userInfo?.id}
      />
      <ContactSheet
        visible={contactVisible}
        onClose={() => setContactVisible(false)}
      />
    </Box>
  );
};

const ProfilePage: FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    points: 0,
    level: "MEMBER",
    transactions: []
  });

  const fetchData = async () => {
    try {
      const { userInfo } = await getUserInfo({});
      setUserInfo(userInfo);
      
      if (userInfo.id) {
        const data = await getCustomerInfo(userInfo.id);
        setCustomerInfo(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Page>
      <Header showBackIcon={false} title="Cá nhân" />
      <Subscription userInfo={userInfo} customerInfo={customerInfo} />
      <Personal userInfo={userInfo} customerInfo={customerInfo} onRefresh={fetchData} />
      <Other userInfo={userInfo} />
    </Page>
  );
};

export default ProfilePage;
