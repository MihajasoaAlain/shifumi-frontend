import Button from "@/components/Button";
import Backdrop from "@/components/Backdrop";
import React from "react";
import useAddUsernameForm from "./useAddUsernameForm";
import { useRouter } from "next/navigation";

const Game = () => {
  const { username, openCreateUsernameModal, openJoinUsernameModal } = useAddUsernameForm();
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10">
      <Backdrop glyphs />

      <div className="card hero-fade w-full max-w-md p-8 flex flex-col items-center">
        <span
          className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[var(--primary)] bg-[var(--background)]/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]/80"
        >
          Salle de jeu
        </span>

        <h1
          className="font-display text-5xl sm:text-6xl font-black text-[var(--secondary)] leading-none"
          style={{ textShadow: "2px 2px 0 rgba(218,160,109,0.55)" }}
        >
          SHIFUMI
        </h1>

        <div className="mt-3 flex items-center gap-3 text-3xl select-none" aria-hidden>
          <span>🪨</span>
          <span>📄</span>
          <span>✂️</span>
        </div>

        {username && (
          <h2 className="mt-4 font-display text-lg italic text-[var(--secondary)]/80">
            Salut, {username} !
          </h2>
        )}

        <div className="w-full flex flex-col gap-4 mt-8">
          <Button
            buttomProps={{
              text: "➕  Créer une salle",
              action: () => openCreateUsernameModal(),
              className: "w-full text-lg py-3",
            }}
          />

          <Button
            buttomProps={{
              text: "🎮  Rejoindre une partie",
              action: () => openJoinUsernameModal(),
              className: "w-full text-lg py-3",
            }}
          />

          <Button
            buttomProps={{
              text: "← Retour",
              action: () => router.back(),
              className: "w-full py-3 text-[var(--secondary)]/70",
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default Game;
