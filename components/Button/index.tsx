"use client";

interface ButtonProps {
  text: string;
  action: () => void;
}

export default function Button({ buttomProps }: { buttomProps: ButtonProps }) {
  return (
    <button type="button" className="button" onClick={buttomProps.action}>
      {buttomProps.text}
    </button>
  );
}
