import React from "react";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div
      className="relative overflow-hidden block h-1 z-0 bg-indigo-900"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="bg-blue-500 h-full"
        style={{
          width: `${progress}%`,
          transform: `translateX(${progress - 100}%)`,
        }}
      />
    </div>
  );
};

export default ProgressBar;
