import React from "react";

interface ToggleZoomButtonProps {
  onToggle: () => void;
  isZoomEnabled: boolean;
}

const ToggleZoomButton: React.FC<ToggleZoomButtonProps> = ({
  onToggle,
  isZoomEnabled,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 border-2 rounded ${
        isZoomEnabled ? "border-green-500" : "border-gray-500"
      }`}
    >
      {isZoomEnabled ? "Disable Zoom" : "Enable Zoom"}
    </button>
  );
};

export default ToggleZoomButton;
