"use client";
import type { ReactNode } from "react";
import Modal from "@/providers/Modal";
import ServiceWorker from "@/providers/ServiceWorker";
import InstallPrompt from "@/providers/InstallPrompt";

type Props = {
  children: ReactNode;
};
const Providers = ({ children }: Props) => {
  return (
    <>
      {children}
      <Modal />
      <ServiceWorker />
      <InstallPrompt />
    </>
  );
};

export default Providers;
