import React, { FC, useEffect, useState } from "react";
import { ListRenderer } from "components/list-renderer";
import { Box, Header, Page, Text, Sheet, Icon } from "zmp-ui";
import { Divider } from "components/divider";
import { getNotifications, Notification, markNotificationAsRead } from "services/api";
import { getUserInfo } from "zmp-sdk/apis";

const NotificationDetailSheet: FC<{ visible: boolean; onClose: () => void; notification: Notification | null }> = ({ visible, onClose, notification }) => {
  if (!notification) return null;

  return (
    <Sheet visible={visible} onClose={onClose} autoHeight title="Chi tiết thông báo">
      <Box className="p-4 flex flex-col space-y-4 max-h-[75vh] overflow-y-auto">
        {notification.image && (
          <img 
            src={notification.image} 
            alt={notification.title} 
            className="w-full h-48 object-cover rounded-lg" 
          />
        )}
        <Box>
          <Text.Title className="font-bold text-lg mb-2">{notification.title}</Text.Title>
          <Text size="small" className="text-gray-500 mb-4">
            {new Date(notification.createdAt).toLocaleString()}
          </Text>
          <Text className="text-gray-700 whitespace-pre-wrap">
            {notification.content}
          </Text>
        </Box>
      </Box>
    </Sheet>
  );
};

const NotificationList: FC<{ setUnreadCount: (count: number) => void }> = ({ setUnreadCount }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { userInfo } = await getUserInfo({});
        const data = await getNotifications(userInfo.id);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error(error);
        // Fallback to global notifications if user info fails
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    };
    fetchData();
  }, [setUnreadCount]);

  const handleItemClick = (item: Notification) => {
    setSelectedNotification(item);
    
    if (!item.isRead) {
      // Optimistic update
      const updatedNotifications = notifications.map(n => 
        n.id === item.id ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.isRead).length);
      
      // Call API
      markNotificationAsRead(item.id);
    }
  };

  return (
    <Box className="bg-background">
      <ListRenderer
        noDivider
        items={notifications}
        renderLeft={(item) => (
          <Box className="relative">
            <img 
              className="w-12 h-12 rounded-full object-cover" 
              src={item.image || "https://larai.vn/images/banner-lar.png"} 
            />
            {!item.isRead && (
              <Box className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </Box>
        )}
        renderRight={(item) => (
          <Box key={item.id} className="flex-1">
            <Text.Header className={`${!item.isRead ? 'font-bold text-black' : 'font-normal text-gray-600'}`}>
              {item.title}
            </Text.Header>
            <Text
              size="small"
              className={`overflow-hidden whitespace-nowrap text-ellipsis ${!item.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}
            >
              {item.content}
            </Text>
            <Text size="xxSmall" className="text-gray-400 mt-1">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </Box>
        )}
        onClick={handleItemClick}
      />
      <NotificationDetailSheet 
        visible={!!selectedNotification} 
        onClose={() => setSelectedNotification(null)} 
        notification={selectedNotification} 
      />
    </Box>
  );
};

const NotificationPage: FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <Page>
      <Header 
        title={`Thông báo ${unreadCount > 0 ? `(${unreadCount})` : ''}`} 
        showBackIcon={false} 
      />
      <Divider />
      <NotificationList setUnreadCount={setUnreadCount} />
    </Page>
  );
};

export default NotificationPage;
