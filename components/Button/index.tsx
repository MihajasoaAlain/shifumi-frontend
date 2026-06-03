"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps {
  text: string;
  icon?: ReactNode;
  action?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  className?: string;
}

export default function Button({ buttomProps }: { buttomProps: ButtonProps }) {
  return (
    <button
      type={buttomProps.type ?? "button"}
      className={["button", buttomProps.className].filter(Boolean).join(" ")}
      onClick={buttomProps.action}
      disabled={buttomProps.disabled}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {buttomProps.icon}
        {buttomProps.text}
      </span>
    </button>
  );
}
