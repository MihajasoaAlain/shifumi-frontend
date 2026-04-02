import Button from "@/components/Button";
import React from "react";
import useAddUsernameForm from "./useAddUsernameForm";
import { useRouter } from "next/navigation";

const Game = () => {
  const { username, openCreateUsernameModal, openJoinUsernameModal } = useAddUsernameForm();
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-around  bg-linear-to-b from-white to-slate-100">
      <div className="w-full max-w-md bg-slate-100 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-center text-slate-800">SHIFUMI  🪨</h1>
        {username && (
          <h2 className="text-lg mb-4 text-center text-black">Welcome, {username}!</h2>
        )}
        <div className="w-full flex flex-col gap-4 mt-6">
          <Button
            buttomProps={{
              text: "Create Room",
              action: () => openCreateUsernameModal(),
              className: "w-full text-lg py-3",
            }}
          />

          <Button
            buttomProps={{
              text: "Join Room",
              action: () => openJoinUsernameModal(),
              className: "w-full text-lg py-3",
            }}
          />

          <Button
            buttomProps={{
              text: "Quit",
              action: () => router.back(),
              className: "w-full text-lg py-3 bg-red-500 hover:bg-red-600 text-white",
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default Game;
