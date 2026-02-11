import React, { useState } from "react";

import ToolButton from "./ToolButton";
import Dialog from "./Dialog";
import TagsList from "./TagsList";

import {
  MagnifyingGlassPlusIcon,
  HandRaisedIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";
interface ToolsMenuProps {
  setActiveTool: (tool: string) => void;
  activeTool: string | null;
  metadata?: any;
}

const ToolsMenu: React.FC<ToolsMenuProps> = ({ setActiveTool, activeTool, metadata }) => {
  const [isTagsOpen, setIsTagsOpen] = useState<boolean>(false);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        <div className="relative z-0 inline-flex shadow-sm rounded-md">
          <ToolButton
            isActive={activeTool === "windowing"}
            onClick={() => setActiveTool("windowing")}
            Icon={AdjustmentsHorizontalIcon}
            className="rounded-l-md"
            title="Window Level"
            aria-label="Window Level"
          />
          <ToolButton
            isActive={activeTool === "zoom"}
            onClick={() => setActiveTool("zoom")}
            Icon={MagnifyingGlassPlusIcon}
            title="Zoom"
            aria-label="Zoom"
          />
          <ToolButton
            isActive={activeTool === "pan"}
            onClick={() => setActiveTool("pan")}
            Icon={HandRaisedIcon}
            className="rounded-r-md"
            title="Pan"
            aria-label="Pan"
          />
        </div>
        <div className="relative z-0 inline-flex shadow-sm rounded-md">
          <ToolButton
            isActive={false}
            onClick={() => {
              // Reset viewport
              const event = new CustomEvent('resetViewport');
              window.dispatchEvent(event);
            }}
            Icon={ArrowsPointingInIcon}
            className="rounded-md"
            title="Reset View"
            aria-label="Reset View"
          />
        </div>
        <div className="relative z-0 inline-flex shadow-sm rounded-md">
          <ToolButton
            isActive={false}
            onClick={() => {
              // Refresh/reload
              window.location.reload();
            }}
            Icon={ArrowPathIcon}
            className="rounded-md"
            title="Refresh"
            aria-label="Refresh"
          />
        </div>
        <div className="relative z-0 inline-flex shadow-sm rounded-md">
          <ToolButton
            isActive={isTagsOpen}
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            Icon={DocumentTextIcon}
            className="rounded-md"
            title="DICOM Tags"
            aria-label="DICOM Tags"
          />
        </div>
      </div>

      <Dialog open={isTagsOpen} onClose={() => setIsTagsOpen(false)}>
        <TagsList data={metadata || {}} />
      </Dialog>
    </>
  );
};

export default ToolsMenu;
