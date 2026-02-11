import React, { useState, useRef, ChangeEvent } from "react";
import ProgressBar from "./ProgressBar";

const Loader: React.FC = () => {
  // State to manage load progress percentage
  const [loadProgress, setLoadProgress] = useState<number>(0);

  // State to manage metadata of the loaded file
  const [metaData, setMetaData] = useState<string | null>(null);

  // State to manage if data has been loaded successfully
  const [isDataLoadComplete, setIsDataLoadComplete] = useState<boolean>(false);

  // State to track if it's the first render
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // State to manage the number of items being loaded
  const [loadItemCount, setLoadItemCount] = useState<number>(0);

  // State to manage the number of received load errors
  const [loadErrorCount, setLoadErrorCount] = useState<number>(0);

  // State to manage the number of received load aborts
  const [loadAbortCount, setLoadAbortCount] = useState<number>(0);

  // Ref for the file input element
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handler for load start event
  const handleLoadStart = () => {
    // Reset flags when loading starts
    setLoadItemCount(0);
    setLoadAbortCount(0);
    setLoadErrorCount(0);
    setIsInitialLoad(true);
    setLoadProgress(0);
    setIsDataLoadComplete(false);
  };

  // Handler for load progress event
  const handleLoadProgress = (e: ProgressEvent<FileReader>) => {
    if (e.lengthComputable) {
      const progress = (e.loaded / e.total) * 100;
      setLoadProgress(progress);
    }
  };

  // Handler for load event
  const handleLoad = (e: ProgressEvent<FileReader>) => {
    if (e.target?.result) {
      setMetaData(e.target.result as string);
      setIsDataLoadComplete(true);
    }
  };

  // Handler for load end event
  const handleLoadEnd = () => {
    if (loadErrorCount > 0) {
      setLoadProgress(0);
      alert("Received errors during load. Check log for details.");
    } else if (loadAbortCount > 0) {
      setLoadProgress(0);
      alert("Load was aborted.");
    } else if (loadProgress === 100) {
      alert("File loaded successfully.");
    }
  };

  // Handler for file input change event
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onprogress = handleLoadProgress;
      reader.onloadstart = handleLoadStart;
      reader.onload = handleLoad;
      reader.onloadend = handleLoadEnd;
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "block", margin: "20px 0" }}
      />
      <ProgressBar progress={loadProgress} />
      {isDataLoadComplete && <div>Metadata: {metaData}</div>}
    </div>
  );
};

export default Loader;
