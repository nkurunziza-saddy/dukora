import type React from "react";

export function MobileResponsive({
  mobile,
  desktop,
  className = "",
}: {
  mobile: React.ReactNode;
  desktop?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="block md:hidden">{mobile}</div>
      <div className="hidden md:block">{desktop || mobile}</div>
    </div>
  );
}

export function AbbreviatedText({
  text,
  maxLength = 20,
  className = "",
}: {
  text: string;
  maxLength?: number;
  className?: string;
}) {
  return (
    <span className={className}>
      <span className="block md:hidden">
        {text.length > maxLength ? `${text.substring(0, maxLength)}...` : text}
      </span>
      <span className="hidden md:block">{text}</span>
    </span>
  );
}

export function EssentialContent({
  essential,
  additional,
  className = "",
}: {
  essential: React.ReactNode;
  additional?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="block md:hidden">{essential}</div>
      <div className="hidden md:flex items-center gap-2">
        {essential}
        {additional}
      </div>
    </div>
  );
}
