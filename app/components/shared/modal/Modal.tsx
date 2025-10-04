import styles from './modal.module.css';
import { ReactNode, MouseEvent } from 'react';

interface ModalProps {
    children: ReactNode;
    onClose: () => void;
}

const Modal = ({ children, onClose  }: ModalProps) =>
{
    const handleOverlayClick = () =>
    {
        onClose();
    };

    const handleContentClick = (e: MouseEvent) =>
    {
        e.stopPropagation();
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div onClick={handleContentClick} className={styles.modalContent}>
                {children}
            </div>
        </div>
    );
}

export default Modal;