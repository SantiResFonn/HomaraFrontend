import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddings: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
  onClick,
}: Readonly<CardProps>) {
  const classes = `
    bg-bg-surface rounded-xl border border-border
    ${paddings[padding]}
    ${hover ? "card-hover cursor-pointer" : ""}
    ${onClick ? "cursor-pointer text-left w-full" : ""}
    ${className}
  `;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classes}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={classes}>
      {children}
    </div>
  );
}
