import { create } from 'zustand';

export type ModalState = {
  isOpen: boolean;
  className: string;
  children: React.ReactNode | null;
  openModal: (props: { children: React.ReactNode; className?: string }) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  className: '',
  children: null,
  openModal: ({ children, className}) =>
    set({ isOpen: true, children, className}),
  closeModal: () => set({ isOpen: false, children: null, className: '' }),
}));
