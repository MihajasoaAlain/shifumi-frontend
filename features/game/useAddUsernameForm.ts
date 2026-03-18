import UsernameForm from "@/components/Modal";
import { createGame, joinGame } from "@/lib/api";
import useCreateUsernameStore from "@/store/game/username";
import { useModalStore } from "@/store/Modal/useModal";
import { useRouter } from "next/navigation";
import { createElement } from "react";

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
      console.error("Error joining game:", error);
    }
  };

  const openCreateUsernameModal = () => {
    openModal({
      children: createElement(UsernameForm, {
        title: "Créer une partie",
        description: "Choisis le pseudo qui sera affiché dans la partie.",
        onSubmit: handleCreateGame,
        submitLabel: "Créer la partie",
        initialValue: username,
      }),
    });
  };

  const openJoinUsernameModal = () => {
    openModal({
      children: createElement(UsernameForm, {
        title: "Choisir ton username",
        description: "Ton username sera conservé pour rejoindre une partie.",
        onSubmit: setUsername,
        submitLabel: "Enregistrer",
        initialValue: username,
      }),
    });
  };

  return { username, openCreateUsernameModal, openJoinUsernameModal };
};

export default useAddUsernameForm;
