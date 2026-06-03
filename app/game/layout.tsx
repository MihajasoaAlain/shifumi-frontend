"use client";

import Button from "@/components/Button";
import { ArrowLeft } from "@/components/Svg";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const handleClick = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4">
        <Button
          buttomProps={{
            text: "Retour",
            icon: <ArrowLeft className="h-4 w-4" />,
            action: handleClick,
          }}
        />
      </div>
      {children}
    </div>
  );
}