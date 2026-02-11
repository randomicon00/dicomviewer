"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  RenderingEngine,
  Enums,
  init as initCornerstone,
} from "@cornerstonejs/core";
import {
  init as initTools,
  addTool,
  ZoomTool,
  PanTool,
  WindowLevelTool,
  StackScrollMouseWheelTool,
  ToolGroupManager,
  Enums as ToolEnums,
} from "@cornerstonejs/tools";
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import dicomParser from "dicom-parser";
import DragDrop from "./DropZone/DragDrop";
import ToolsMenu from "./ToolsMenu";

interface DicomViewerProps {
  dicomFile?: File;
  resetFileState?: () => void;
}

const TOOL_GROUP_ID = 'MAIN_TOOL_GROUP';
const VIEWPORT_ID = 'viewport-1';

// Initialize Cornerstone - use singleton pattern
let renderingEngine: RenderingEngine | null = null;
let isCornerStoneInitialized = false;
let initializationPromise: Promise<void> | null = null;

const initializeCornerstone = async (): Promise<void> => {
  if (isCornerStoneInitialized) {
    return Promise.resolve();
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      await initCornerstone();
      
      // Initialize DICOM loader
      (cornerstoneDICOMImageLoader.external as any).cornerstone = await import("@cornerstonejs/core");
      cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
      
      cornerstoneDICOMImageLoader.webWorkerManager.initialize({
        maxWebWorkers: navigator.hardwareConcurrency || 1,
        startWebWorkersOnDemand: true,
        taskConfiguration: {
          decodeTask: {
            initializeCodecsOnStartup: false,
            strict: false,
          },
        },
      });

      try {
        initTools();
      } catch (e) {
        console.log("Tools already initialized");
      }

      const toolsToAdd = [ZoomTool, PanTool, WindowLevelTool, StackScrollMouseWheelTool];
      toolsToAdd.forEach(tool => {
        try {
          addTool(tool);
        } catch (e) {}
      });

      let toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
      if (!toolGroup) {
        toolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);
      }

      const toolNames = [ZoomTool.toolName, PanTool.toolName, WindowLevelTool.toolName, StackScrollMouseWheelTool.toolName];
      toolNames.forEach(toolName => {
        try {
          toolGroup?.addTool(toolName);
        } catch (e) {}
      });

      try {
        toolGroup?.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
        });
        toolGroup?.setToolActive(StackScrollMouseWheelTool.toolName);
      } catch (e) {}

      if (!renderingEngine) {
        renderingEngine = new RenderingEngine('myRenderingEngine');
      }

      isCornerStoneInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Cornerstone:", error);
      throw error;
    }
  })();

  return initializationPromise;
};

const DicomViewer: React.FC<DicomViewerProps> = ({ dicomFile, resetFileState }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Fit image to viewport
  const fitImageToViewport = useCallback((viewport: any) => {
    if (!viewport) return;
    
    // Reset camera to center and fit image
    viewport.resetCamera();
    viewport.setZoom(0.8);
    viewport.render();
  }, []);

  useEffect(() => {
    initializeCornerstone()
      .then(() => setIsInitialized(true))
      .catch((error) => {
        console.error("Failed to initialize Cornerstone:", error);
        setError("Failed to initialize DICOM viewer");
      });

    const handleResetViewport = () => {
      const viewport = renderingEngine?.getViewport(VIEWPORT_ID);
      if (viewport) {
        fitImageToViewport(viewport);
      }
    };

    window.addEventListener('resetViewport', handleResetViewport);
    return () => window.removeEventListener('resetViewport', handleResetViewport);
  }, [fitImageToViewport]);

  // Handle window resize
  useEffect(() => {
    if (!imageLoaded) return;

    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const viewport = renderingEngine?.getViewport(VIEWPORT_ID);
        if (viewport && elementRef.current) {
          // Resize the viewport
          (viewport as any).resize();
          // Reset camera to ensure image stays centered
          viewport.resetCamera();
          viewport.setZoom(0.8);
          viewport.render();
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [imageLoaded]);

  const handleFileChange = (file: File) => {
    loadDICOMFile(file);
  };

  const loadDICOMFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!renderingEngine) {
        throw new Error("DICOM viewer not initialized yet.");
      }

      const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file);

      let element = elementRef.current;
      let attempts = 0;
      while (!element && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        element = elementRef.current;
        attempts++;
      }

      if (!element) {
        throw new Error("Canvas element not available");
      }

      const viewportInput = {
        viewportId: VIEWPORT_ID,
        type: Enums.ViewportType.STACK,
        element,
        defaultOptions: {
          background: [0, 0, 0] as [number, number, number],
        },
      };

      renderingEngine.enableElement(viewportInput);

      const toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
      toolGroup?.addViewport(VIEWPORT_ID, 'myRenderingEngine');

      const imageLoadObject = await cornerstoneDICOMImageLoader.wadouri.loadImage(imageId);
      const image = await imageLoadObject.promise;

      // Extract metadata
      try {
        const dicomData = dicomParser.parseDicom(new Uint8Array(await file.arrayBuffer()));
        const extractedMetadata: any = {};

        if (dicomData.elements) {
          Object.keys(dicomData.elements).forEach(tag => {
            const element = dicomData.elements[tag];
            if (element && element.length > 0) {
              try {
                let value = '';
                const vr = element.vr;
                const binaryTags = ['7FE00010', '50003000', '00291000', '00286100'];
                const isBinaryTag = binaryTags.some(bt =>
                  tag.toUpperCase().includes(bt) || (vr && ['OB', 'OW', 'OF', 'OD', 'UN'].includes(vr))
                );

                if (isBinaryTag || element.length > 1000) {
                  value = `[Binary Data - ${element.length} bytes]`;
                } else {
                  try {
                    let stringValue = dicomData.string(tag) || dicomData.text(tag);
                    if (stringValue) {
                      stringValue = stringValue
                        .replace(/[\u00FE\u00FF]/g, '')
                        .replace(/[\u0000]/g, '')
                        .trim();
                      value = stringValue || 'N/A';
                    } else {
                      value = 'N/A';
                    }
                  } catch {
                    value = 'N/A';
                  }
                }

                if (value && value !== 'N/A' && value !== '') {
                  extractedMetadata[tag] = { value, vr: vr || 'UN' };
                }
              } catch (e) {}
            }
          });
        }
        setMetadata(extractedMetadata);
      } catch (metadataError) {
        console.warn("Could not extract metadata:", metadataError);
      }

      const viewport = renderingEngine.getViewport(VIEWPORT_ID);
      if (viewport) {
        (viewport as any).setStack([imageId]);
        fitImageToViewport(viewport);
        setImageLoaded(true);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error loading DICOM:", error);
      setError(`Failed to load DICOM image: ${error.message}`);
      setIsLoading(false);
    }
  }, [fitImageToViewport]);

  useEffect(() => {
    if (dicomFile && isInitialized) {
      loadDICOMFile(dicomFile);
    }
  }, [dicomFile, isInitialized, loadDICOMFile]);

  const handleToolChange = (toolName: string) => {
    const toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
    if (!toolGroup) return;

    toolGroup.setToolPassive(ZoomTool.toolName);
    toolGroup.setToolPassive(PanTool.toolName);
    toolGroup.setToolPassive(WindowLevelTool.toolName);

    switch (toolName) {
      case 'zoom':
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
        });
        break;
      case 'pan':
        toolGroup.setToolActive(PanTool.toolName, {
          bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
        });
        break;
      default:
        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
        });
    }

    setActiveTool(toolName);
  };

  return (
    <div className="w-full flex flex-col" role="main" aria-label="DICOM Viewer Application">
      {imageLoaded && (
        <div className="mb-4 flex justify-center">
          <ToolsMenu setActiveTool={handleToolChange} activeTool={activeTool} metadata={metadata} />
        </div>
      )}

      <div 
        ref={containerRef}
        className="w-full relative h-[55vh] min-h-[280px] sm:h-[60vh] sm:min-h-[400px]"
      >
        <div 
          className="absolute inset-0 flex items-center justify-center" 
          aria-label="DICOM Image Viewer"
        >
          {/* Cornerstone canvas element - centered */}
          <div
            ref={elementRef}
            id="dicom-viewport-container"
            className={`relative w-full h-full rounded-lg border-2 border-dashed ${imageLoaded ? 'bg-black border-transparent' : 'bg-transparent border-gray-400'}`}
            aria-label="DICOM Image Display Area"
          />

          {/* Overlay content */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center" aria-live="polite">
              {isLoading && (
                <div className="text-center text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
                  <p>Loading DICOM image...</p>
                </div>
              )}
              {error && (
                <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg border-2 border-dashed border-red-300" role="alert">
                  <p className="font-semibold mb-2">Error Loading Image</p>
                  <p>{error}</p>
                </div>
              )}
              {!isLoading && !error && (
                <DragDrop onFileUpload={handleFileChange} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DicomViewer;
