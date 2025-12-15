import React, { useEffect, useState } from "react";
import { Box, Text } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { userState } from "../../state";
import { getCustomerInfo, CustomerInfo } from "services/api";

interface LoyaltyCardProps {
  refreshKey?: number;
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ refreshKey }) => {
  const userInfo = useRecoilValue(userState);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    points: 0,
    level: "MEMBER",
    transactions: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (userInfo.id) {
        try {
          console.log("Fetching customer info for:", userInfo.id);
          const data = await getCustomerInfo(userInfo.id);
          console.log("Customer info received:", data);
          setCustomerInfo(data);
        } catch (error) {
          console.error("Failed to fetch customer info", error);
        }
      }
    };
    
    fetchData();
  }, [userInfo.id, refreshKey]);

  return (
    <Box
      className="mx-4 mt-4 mb-2 p-4 rounded-2xl text-white shadow-lg"
      style={{ background: "var(--zmp-primary-color)" }}
    >
      <Box className="flex justify-between items-start mb-2">
        <Text.Title className="font-bold" size="normal">LAR Member</Text.Title>
        <Text size="small" className="opacity-80">
          {customerInfo.level}
        </Text>
      </Box>
      
      <Box className="flex flex-col items-center justify-center py-2">
        <Text size="small" className="mb-1 opacity-90">
          Điểm tích lũy
        </Text>
        <Text size="xxLarge" className="font-bold leading-none">
          {customerInfo.points.toLocaleString()}
        </Text>
      </Box>

      <Box className="mt-2 pt-2 border-t border-white/20 flex justify-between text-sm">
        <Text>ID: {userInfo?.id || "..."}</Text>
        <Text>{userInfo?.name || "Khách hàng"}</Text>
      </Box>
    </Box>
  );
};
