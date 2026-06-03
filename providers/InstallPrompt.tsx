"use client";

import { useEffect } from "react";
import Button from "@/components/Button";
import { useModalStore } from "@/store/Modal/useModal";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "shifumi-install-dismissed";


const InstallPrompt = () => {
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    let deferred: BeforeInstallPromptEvent | null = null;

    const remember = () => localStorage.setItem(DISMISS_KEY, "1");

    const accept = async () => {
      if (!deferred) return;
      closeModal();
      await deferred.prompt();
      await deferred.userChoice; 
      remember();
      deferred = null;
    };

    const later = () => {
      closeModal();
      remember();
    };

    const ask = () =>
      openModal({
        children: (
          <div className="flex flex-col items-center gap-5 p-6 text-center text-[var(--secondary)]">
            <h2 className="font-display text-xl font-semibold">
              Installer Shifumi&nbsp;?
            </h2>
            <p className="text-sm opacity-80">
              Ajoute le jeu à ton écran d&apos;accueil pour y jouer en plein
              écran, hors navigateur.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button buttomProps={{ text: "Installer", action: accept }} />
              <Button
                buttomProps={{
                  text: "Plus tard",
                  action: later,
                  className: "text-[var(--secondary)]/70",
                }}
              />
            </div>
          </div>
        ),
      });

    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); 
      deferred = e as BeforeInstallPromptEvent;
      window.setTimeout(ask, 1500);
    };

    const onInstalled = () => {
      remember();
      deferred = null;
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [openModal, closeModal]);

  return null;
};

export default InstallPrompt;
