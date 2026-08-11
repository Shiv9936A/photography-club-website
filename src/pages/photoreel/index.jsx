import React, { useState } from "react";

import Photos from "../../components/photoReels/Photos";
import Reels from "../../components/photoReels/Reels";
import PrivateGallery from "../../components/photoReels/PrivateGallery";
import Tab from "../../components/photoReels/Tab";

const PhotoReels = () => {
  const [activeTab, setActiveTab] = useState("Photos");
  const token = localStorage.getItem("authToken");
  let user = null;

  try {
    if (token) {
      user = JSON.parse(atob(token.split(".")[1]));
    }
  } catch (error) {
    console.error("Invalid token:", error);
  }

  const isNitk = user?.isNitk === true;

  const renderTabContent = () => {
    if (activeTab === "Photos") {
      return <Photos />;
    }

    if (activeTab === "Reels") {
      return <Reels />;
    }

    if (activeTab === "Private" && isNitk) {
      return <PrivateGallery />;
    }

    return <Photos />;
  };

  return (
    <>
      {/* Header Section */}

      <section className="text-center py-12">
        <h1 className="text-5xl font-medium">Photography Feed</h1>

        <p className="text-gray-500 mt-4 text-lg">
          Explore amazing shots and stories from our talented photographers
        </p>
      </section>

      {/* Tabs */}
      <div className="mt-11">
        <Tab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isNitk={isNitk}
        />
      </div>

      {/* Content */}
      <div>{renderTabContent()}</div>
    </>
  );
};

export default PhotoReels;
