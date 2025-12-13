import React, { useEffect, useState } from "react";
import { Box, Page, Text } from "zmp-ui";
import { Welcome } from "./welcome";
import { Banner } from "./banner";
import { LoyaltyCard } from "./loyalty-card";
import { ReviewSection } from "./review-section";
import { Divider } from "components/divider";
import { getLocations, Location } from "services/api";

const HomePage: React.FunctionComponent = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (error) {
        console.error("Failed to load locations");
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const selectedLocation = locations.length > 0 ? locations[0] : undefined;

  return (
    <Page className="relative flex-1 flex flex-col bg-white">
      <Welcome />
      <Box className="flex-1 overflow-auto">
        <LoyaltyCard />
        <Banner />
        <Divider />
        {loading ? (
           <Box className="p-4 text-center"><Text>Đang tải thông tin...</Text></Box>
        ) : selectedLocation ? (
           <ReviewSection locationId={selectedLocation.id} locationName={selectedLocation.name} />
        ) : (
           <Box className="p-4 text-center"><Text>Không tìm thấy địa điểm nào.</Text></Box>
        )}
      </Box>
    </Page>
  );
};

export default HomePage;
