"use client";

import { FormEvent, useState } from "react";
import { useModalStore } from "@/store/Modal/useModal";

type CreateUsernameModalProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  initialValue?: string;
  onSubmit: (username: string) => void;
};

export default function CreateUsernameModal({
  title = "Choisir un username",
  description = "Entre le pseudo que tu veux utiliser pour la partie.",
  submitLabel = "Valider",
  initialValue = "",
  onSubmit,
}: CreateUsernameModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const [username, setUsername] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      return;
    }

    onSubmit(trimmedUsername);
    closeModal();
  };

  return (
    <form
      className="flex flex-col gap-5 rounded-[24px] border-2 border-dashed border-[var(--primary)] bg-[var(--background)] p-6 text-[var(--secondary)] shadow-[0_0_0_4px_#eaddca,2px_2px_4px_2px_rgba(0,0,0,0.5)]"
      onSubmit={handleSubmit}
    >
      <div className="flex justify-end">
        <button
          type="button"
          aria-label="Close modal"
          className="button flex h-8 w-8 items-center justify-center px-0 py-0 text-lg leading-none"
          onClick={closeModal}
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-[var(--secondary)]/80">{description}</p>
      </div>

      <input
        autoFocus
        className="input w-full"
        type="text"
        value={username}
        placeholder="Enter your username"
        onChange={(event) => setUsername(event.target.value)}
      />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="submit"
          className="button disabled:opacity-50"
          disabled={!username.trim()}   
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
