"use client";
import type { ReactNode } from "react";
import Modal from "@/providers/Modal";

type Props = {
  children: ReactNode;
};
const Providers = ({ children }: Props) => {
  return (
    <>
      {children}
      <Modal />
    </>
  );
};

export default Providers;
