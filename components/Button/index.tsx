"use client";

import { useRouter } from "next/navigation";

export default function ButtonPlay() {
  const router = useRouter();
  

  const handleClick = () => {
    router.push("/game");
  }
  return (
    <>
   <button className="button" onClick={handleClick}>
      Play Game
    </button>
    </>
  );
}