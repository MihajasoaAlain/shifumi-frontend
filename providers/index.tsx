"use client";
import type { ReactNode } from "react";
import Modal from "@/providers/Modal";
import ServiceWorker from "@/providers/ServiceWorker";

type Props = {
  children: ReactNode;
};
const Providers = ({ children }: Props) => {
  return (
    <>
      {children}
      <Modal />
      <ServiceWorker />
    </>
  );
};

export default Providers;
