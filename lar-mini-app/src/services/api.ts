import { CONFIG } from "../config";

export interface Location {
  id: string;
  name: string;
  address: string;
  businessId: string;
  googlePlaceId?: string;
}

export interface ReviewData {
  locationId: string;
  rating: number;
  content: string;
  zaloUserId: string;
  zaloUserName?: string;
  zaloPhone?: string;
  zaloAvatar?: string;
}

export interface CustomerInfo {
  points: number;
  level: string;
  transactions: any[];
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  isRead: boolean;
}

export const getLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/locations`);
    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
};

export const submitReview = async (data: ReviewData) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to submit review");
    }
    return result;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

export const getCustomerInfo = async (zaloId: string): Promise<CustomerInfo> => {
  try {
    // Add timestamp to prevent caching
    const response = await fetch(`${CONFIG.API_BASE_URL}/customer?zaloId=${zaloId}&t=${Date.now()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch customer info");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching customer info:", error);
    return { points: 0, level: "MEMBER", transactions: [] };
  }
};

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/banners`);
    if (!response.ok) throw new Error("Failed to fetch banners");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  pointsRequired: number;
  location?: { name: string };
  quantity: number;
  startTime?: string;
  endTime?: string;
}

export const getRewards = async (locationId?: string): Promise<Reward[]> => {
  try {
    const url = locationId 
      ? `${CONFIG.API_BASE_URL}/rewards?locationId=${locationId}`
      : `${CONFIG.API_BASE_URL}/rewards`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch rewards");
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return [];
  }
};

export const redeemReward = async (zaloId: string, rewardId: string) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/rewards/redeem`, { // This is actually request-redemption now
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zaloId, rewardId }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to request redemption");
    return result.data; // Returns { redemptionId, code, pointsRequired }
  } catch (error) {
    console.error("Error requesting redemption:", error);
    throw error;
  }
};

export const checkRedemptionStatus = async (redemptionId: string) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/rewards/status?id=${redemptionId}`);
    const data = await response.json();
    return data.data?.status;
  } catch (error) {
    return null;
  }
};

export const getUserReviews = async (zaloId: string) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/reviews?zaloId=${zaloId}`);
    if (!response.ok) throw new Error("Failed to fetch user reviews");
    const data = await response.json();
    return data.data.reviews || [];
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }
};

export interface Redemption {
  id: string;
  code: string;
  status: string;
  pointsSpent: number;
  createdAt: string;
  reward: {
    name: string;
    image: string;
  };
}

export const getRedemptionHistory = async (zaloId: string): Promise<Redemption[]> => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/rewards/history?zaloId=${zaloId}`);
    if (!response.ok) throw new Error("Failed to fetch redemption history");
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching redemption history:", error);
    return [];
  }
};

export const getNotifications = async (zaloId?: string): Promise<Notification[]> => {
  try {
    const url = zaloId 
      ? `${CONFIG.API_BASE_URL}/notifications?zaloId=${zaloId}`
      : `${CONFIG.API_BASE_URL}/notifications`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch notifications");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    await fetch(`${CONFIG.API_BASE_URL}/notifications/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};



export const getMyRedemptions = async (zaloId: string): Promise<Redemption[]> => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/rewards/history?zaloId=${zaloId}`);
    if (!response.ok) throw new Error("Failed to fetch redemptions");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching redemptions:", error);
    return [];
  }
};

