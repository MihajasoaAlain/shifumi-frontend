import UsernameForm from "@/components/Modal";
import { createGame, joinGame } from "@/lib/api";
import useCreateUsernameStore from "@/store/game/username";
import { useModalStore } from "@/store/Modal/useModal";
import { useRouter } from "next/navigation";
import { createElement } from "react";

type JoinSessionPayload = {
  username: string;
  gameId: string;
};

const useAddUsernameForm = () => {
  const router = useRouter();
  const openModal = useModalStore((state) => state.openModal);
  const { username, setUsername } = useCreateUsernameStore();

  const handleCreateGame = async (nextUsername: string) => {
    setUsername(nextUsername);

    try {
      const game = await createGame();
      await joinGame(game.id, { username: nextUsername });
      router.push(`/game/${game.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const handleJoinGame = async ({ username: nextUsername, gameId }: JoinSessionPayload) => {
    setUsername(nextUsername);

    try {
      await joinGame(gameId, { username: nextUsername });
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  const openCreateUsernameModal = () => {
    openModal({
      children: createElement(UsernameForm, {
        title: "Creer une partie",
        description: "Choisis le pseudo qui sera affiche dans la partie.",
        submitLabel: "Creer la partie",
        initialValue: username,
        mode: "create",
        onCreateSubmit: handleCreateGame,
      }),
    });
  };

  const openJoinUsernameModal = () => {
    openModal({
      children: createElement(UsernameForm, {
        title: "Rejoindre une partie",
        description: "Choisis ton pseudo puis selectionne une partie en attente.",
        submitLabel: "Rejoindre",
        initialValue: username,
        mode: "join",
        onJoinSubmit: handleJoinGame,
      }),
    });
  };

  return { username, openCreateUsernameModal, openJoinUsernameModal };
};

export default useAddUsernameForm;
