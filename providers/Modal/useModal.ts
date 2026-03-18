import { ModalState, useModalStore } from '@/store/Modal/useModal';

const useModal =() => {
  const isOpen     = useModalStore((state: ModalState) => state.isOpen);
  const className  = useModalStore((state: ModalState) => state.className);
  const children   = useModalStore((state: ModalState) => state.children);
  const closeModal = useModalStore((state: ModalState) => state.closeModal);

  return {
    isOpen,
    className,
    children,
    closeModal,
  }
}

export default useModal