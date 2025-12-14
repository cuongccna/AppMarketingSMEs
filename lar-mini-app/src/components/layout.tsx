import React, { FC, Suspense } from "react";
import { Route, Routes } from "react-router";
import { Box, Spinner } from "zmp-ui";
import { Navigation } from "./navigation";
import HomePage from "pages/index";
import NotificationPage from "pages/notification";
import ProfilePage from "pages/profile";
import RewardsPage from "pages/rewards";
import { getSystemInfo } from "zmp-sdk";
import { ScrollRestoration } from "./scroll-restoration";
import { useHandlePayment } from "hooks";

if (import.meta.env.DEV) {
  document.body.style.setProperty("--zaui-safe-area-inset-top", "24px");
} else if (getSystemInfo().platform === "android") {
  const statusBarHeight =
    window.ZaloJavaScriptInterface?.getStatusBarHeight() ?? 0;
  const androidSafeTop = Math.round(statusBarHeight / window.devicePixelRatio);
  document.body.style.setProperty(
    "--zaui-safe-area-inset-top",
    `${androidSafeTop}px`
  );
}

export const Layout: FC = () => {
  useHandlePayment();

  return (
    <Box flex flexDirection="column" className="h-screen">
      <ScrollRestoration />
      <Box className="flex-1 flex flex-col overflow-hidden">
        <Suspense
          fallback={
            <Box className="flex-1 flex justify-center items-center">
              <Spinner visible />
            </Box>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/rewards" element={<RewardsPage />}></Route>
            <Route path="/notification" element={<NotificationPage />}></Route>
            <Route path="/profile" element={<ProfilePage />}></Route>
          </Routes>
        </Suspense>
      </Box>
      <Navigation />
    </Box>
  );
};
