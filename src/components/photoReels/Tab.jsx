import React from "react";

const Tab = ({
    activeTab,
    setActiveTab,
    isNitk,
}) => {
    const getClass = (tab) =>
        `flex justify-center items-center px-6 py-2 font-medium text-sm border-2 rounded-full ${
            activeTab === tab
                ? "text-white bg-black border-black"
                : "text-black border-black hover:bg-black hover:text-white"
        }`;

    return (
        <div className="flex justify-center items-center gap-3 flex-wrap">

            <button
                onClick={() => setActiveTab("Photos")}
                className={getClass("Photos")}
            >
                📷 Photos
            </button>

            <button
                onClick={() => setActiveTab("Reels")}
                className={getClass("Reels")}
            >
                🎥 Reels
            </button>

            {isNitk && (
                <button
                    onClick={() => setActiveTab("Private")}
                    className={getClass("Private")}
                >
                    🔒 Private
                </button>
            )}

        </div>
    );
};

export default Tab;