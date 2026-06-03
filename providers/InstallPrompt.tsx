"use client";

import { useEffect } from "react";
import Button from "@/components/Button";
import { useModalStore } from "@/store/Modal/useModal";

// Événement non standard (Chrome/Edge/Android) — absent des types DOM par défaut.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "shifumi-install-dismissed";

const setDismissed = () => {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
  }
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); 
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
    setDismissed();
  });
}


const InstallPrompt = () => {
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const accept = async () => {
      if (!deferredPrompt) return;
      closeModal();
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice; 
      deferredPrompt = null;
    };

    const ask = () => {
      if (!deferredPrompt || installed) return;
    
      setDismissed();
      openModal({
        children: (
          <div className="card flex flex-col items-center gap-5 p-6 text-center text-[var(--secondary)]">
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
                  action: closeModal,
                  className: "text-[var(--secondary)]/70",
                }}
              />
            </div>
          </div>
        ),
      });
    };

    let timer = 0;
    const schedule = () => {
 
      timer = window.setTimeout(ask, 1500);
    };


    if (deferredPrompt) schedule();

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      schedule();
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, [openModal, closeModal]);

  return null;
};

export default InstallPrompt;
