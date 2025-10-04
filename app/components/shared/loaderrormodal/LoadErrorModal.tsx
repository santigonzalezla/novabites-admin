import { useEffect } from 'react';
import styles from './loaderrormodal.module.css';

interface ErrorItem {
    row: number;
    errors: string[];
}

interface UploadResult {
    totalRows: number;
    created: number;
    failed: number;
    errors: ErrorItem[];
}

interface LoadErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    uploadResult?: UploadResult;
}

export const LoadErrorModal = ({ isOpen, onClose, uploadResult }: LoadErrorModalProps) =>
{

    useEffect(() =>
    {
        const handleEscape = (e: KeyboardEvent) =>
        {
            if (e.key === 'Escape' && isOpen) onClose();
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ''}`} onClick={handleOverlayClick}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <div className={styles.icon}>⚠</div>
                    <h2>Errores en el Procesamiento</h2>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.errorSummary}>
                        <p><strong>Total de filas procesadas:</strong> {uploadResult?.totalRows}</p>
                        <p><strong>Registros creados:</strong> {uploadResult?.created}</p>
                        <p><strong>Registros con errores:</strong> {uploadResult?.failed}</p>
                    </div>

                    {uploadResult?.errors.map((error, index) => (
                        <div key={index} className={styles.errorItem}>
                            <div className={styles.errorRow}>Fila {error.row}</div>
                            <ul className={styles.errorMessages}>
                                {error.errors.map((msg, msgIndex) => (
                                    <li key={msgIndex}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.btnAccept} onClick={onClose}>
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};