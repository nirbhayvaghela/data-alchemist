import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function TooltipWrapper({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm shadow-md animate-fade-in"
        sideOffset={4}
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default TooltipWrapper;
