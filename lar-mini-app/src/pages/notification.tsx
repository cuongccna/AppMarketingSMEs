import React, { FC, useEffect, useState } from "react";
import { ListRenderer } from "components/list-renderer";
import { Box, Header, Page, Text } from "zmp-ui";
import { Divider } from "components/divider";
import { getNotifications, Notification } from "services/api";
import { getUserInfo } from "zmp-sdk/apis";

const NotificationList: FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { userInfo } = await getUserInfo({});
        const data = await getNotifications(userInfo.id);
        setNotifications(data);
      } catch (error) {
        console.error(error);
        // Fallback to global notifications if user info fails
        getNotifications().then(setNotifications);
      }
    };
    fetchData();
  }, []);

  return (
    <Box className="bg-background">
      <ListRenderer
        noDivider
        items={notifications}
        renderLeft={(item) => (
          <img 
            className="w-10 h-10 rounded-full object-cover" 
            src={item.image || "https://stc-zmp.zadn.vn/templates/zaui-coffee/dummy/banner-1.webp"} 
          />
        )}
        renderRight={(item) => (
          <Box key={item.id}>
            <Text.Header>{item.title}</Text.Header>
            <Text
              size="small"
              className="text-gray overflow-hidden whitespace-nowrap text-ellipsis"
            >
              {item.content}
            </Text>
          </Box>
        )}
      />
    </Box>
  );
};

const NotificationPage: FC = () => {
  return (
    <Page>
      <Header title="Thông báo" showBackIcon={false} />
      <Divider />
      <NotificationList />
    </Page>
  );
};

export default NotificationPage;
