import React, { useEffect } from "react";
import classnames from "classnames";
import { XCircleIcon } from "@heroicons/react/16/solid";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  children,
  title = "DICOM Tags",
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 transition-opacity" />

      <div className="absolute inset-0 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
        <div
          className={classnames(
            "relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-xl transition-all",
            "sm:h-[80dvh] sm:max-h-[900px] sm:max-w-5xl sm:rounded-lg sm:border sm:border-gray-300"
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2
              className="text-base sm:text-lg text-gray-900 font-semibold leading-6"
              id="modal-title"
            >
              {title}
            </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <XCircleIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-4">{children}</div>
      </div>
    </div>
    </div>
  );
};

export default Dialog;
