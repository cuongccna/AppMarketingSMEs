import React, { useEffect, useState } from "react";
import { Box, Text } from "zmp-ui";
import { getUserInfo } from "zmp-sdk/apis";
import { getCustomerInfo, CustomerInfo } from "services/api";

export const LoyaltyCard = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    points: 0,
    level: "MEMBER",
    transactions: []
  });

  useEffect(() => {
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
    
    fetchData();
  }, []);

  return (
    <Box
      className="m-4 p-6 rounded-2xl text-white shadow-lg"
      style={{ background: "var(--zmp-primary-color)" }}
    >
      <Box className="flex justify-between items-start mb-4">
        <Text.Title className="font-bold">LAR Member</Text.Title>
        <Text size="small" className="opacity-80">
          {customerInfo.level}
        </Text>
      </Box>
      
      <Box className="flex flex-col items-center justify-center py-4">
        <Text size="small" className="mb-1 opacity-90">
          Điểm tích lũy
        </Text>
        <Text size="xxxxLarge" className="font-bold leading-none">
          {customerInfo.points.toLocaleString()}
        </Text>
      </Box>

      <Box className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
        <Text>ID: {userInfo?.id || "..."}</Text>
        <Text>{userInfo?.name || "Khách hàng"}</Text>
      </Box>
    </Box>
  );
};
