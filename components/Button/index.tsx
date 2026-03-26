"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps {
  text: string;
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
      {buttomProps.text}
    </button>
  );
}
