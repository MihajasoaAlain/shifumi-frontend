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
    <div className="min-h-screen flex flex-col h-screen ">
      
      <div className="p-4 bg-linear-to-b from-white to-slate-100">
        <Button buttomProps={{ text: "Back", action: handleClick }} />
      </div>
        {children}

    </div>
  );
}