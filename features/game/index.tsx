import Button from "@/components/Button";
import React from "react";
import useAddUsernameForm from "./useAddUsernameForm";
import { useRouter } from "next/navigation";

const Game = () => {
  const { username, openCreateUsernameModal, openJoinUsernameModal } = useAddUsernameForm();
  const router = useRouter();
  const pushJoinPage = () => {
    router.push("/join");
  }

  return (
    <div className="p-4 flex-1 flex flex-col border">
      <h1 className="text-2xl font-bold mb-4 text-center p-2">SHIFUMI  🪨  </h1>
     {username && <h2 className="text-xl font-semibold mb-4 text-center p-2">Welcome, {username}!</h2>}

      <div className="flex-1 p-2 flex flex-col items-center justify-center gap-6 border">
        <Button
          buttomProps={{ text: "Create Room", action: () => openCreateUsernameModal() }}
        />
        <Button 
        buttomProps={{text: "Join Room", action: () => pushJoinPage(),
          }}
        />
      </div>
    </div>
  );
};

export default Game;
