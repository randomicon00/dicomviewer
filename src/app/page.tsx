"use client"

import { useState } from "react";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";

const DicomViewer = dynamic(() => import("@/components/DicomViewer"), {
  ssr: false,
});

export default function Home() {
  const [dicomFile, setDicomFile] = useState<File | undefined>(undefined);

  const resetFileState = () => {
    setDicomFile(undefined);
  };

  return (
    <main className="h-full">
      <div className="min-h-screen bg-white">
        <div className="w-full py-8">
          <div className="text-center mb-8 px-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              DICOM Medical Image Viewer
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Professional medical imaging viewer supporting DICOM files with advanced tools for zoom, pan, and windowing
            </p>
          </div>
          
          <div className="w-full px-2 sm:px-4">
            <DicomViewer dicomFile={dicomFile} resetFileState={resetFileState} />
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
