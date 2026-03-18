'use client';
import styles from './Modal.module.scss';
import cn from '@/utils/cn';
import useModal from './useModal';

const Modal: React.FC = () => {
  const { 
    isOpen, 
    className, 
    children, 
    closeModal 
  } = useModal();

  if (!isOpen) return null; 

  return (
    <div
      className={cn(
        styles.modal,
        className
      )}
      onClick={closeModal} 
    >
      <div
        className={styles.modalBody}
        onClick={(e) => e.stopPropagation()} 
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
