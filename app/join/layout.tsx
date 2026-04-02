"use client";

import Button from "@/components/Button";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const handleClick = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen  flex flex-col">
      
      <div className="p-4">
        <Button buttomProps={{ text: "Back", action: handleClick }} />
      </div>

      <div className="flex-1 w-full">
        {children}
      </div>

    </div>
  );
}