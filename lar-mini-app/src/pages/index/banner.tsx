import React, { FC, useEffect, useState } from "react";
import { Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Box, Text } from "zmp-ui";
import { getBanners, Banner as BannerType } from "services/api";

export const Banner: FC = () => {
  const [banners, setBanners] = useState<BannerType[]>([]);

  useEffect(() => {
    getBanners().then(setBanners);
  }, []);

  if (banners.length === 0) {
    return null;
  }

  return (
    <Box className="bg-white" pb={2}>
      <Swiper
        modules={[Pagination]}
        pagination={{
          clickable: true,
        }}
        autoplay
        loop
        cssMode
      >
        {banners.map((banner, i) => (
          <SwiperSlide key={i} className="px-4">
            <Box
              className="w-full rounded-lg aspect-[2.5/1] bg-cover bg-center bg-skeleton relative overflow-hidden"
              style={{ backgroundImage: `url(${banner.image})` }}
            >
              <Box className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <Text size="small" className="text-white font-bold">{banner.title}</Text>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
