"use client";
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const handleClick = () => {
    window.history.back();
  };
  return (
    <>
      <div className="p-4 min-h-full border">
        <button className="button " onClick={handleClick}>
          Back
        </button>
        <div className="h-full">{children}</div>
      </div>
    </>
  );
}
