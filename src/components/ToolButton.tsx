import React from "react";
import classnames from "classnames";

interface ToolButtonProps {
  isActive: boolean;
  onClick: () => void;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title?: string;
  className?: string;
  [key: string]: any; // allows for additional props
}

const ToolButton: React.FC<ToolButtonProps> = ({
  isActive,
  onClick,
  Icon,
  title,
  className,
  ...rest
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={classnames(
        `relative inline-flex min-h-11 min-w-11 items-center justify-center px-3 py-3 sm:px-2 sm:py-2 border text-sm font-medium ${isActive
          ? "bg-black text-gray-300 border-gray-500"
          : "bg-black text-gray-200 border-gray-500 hover:bg-gray-800"
        } focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500`,
        className
      )}
      {...rest}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};

export default ToolButton;
