'use client';

import { useState } from 'react';
import styles from './requeststatusactions.module.css';
import { RequestStatus } from '@/interfaces/enums';
import { useRequestStatus } from '@/hooks/useRequestStatus';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';

interface RequestStatusActionsProps {
    currentStatus: RequestStatus;
    requestId: string;
    onStatusUpdate: () => void;
}

const RequestStatusActions = ({ currentStatus, requestId, onStatusUpdate }: RequestStatusActionsProps) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState<any>(null);
    const { execute: patchExecute, isLoading: isPatchLoading } = useFetch(`/api/store-request/${requestId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        immediate: false
    });

    const handleStatusChange = async (newStatus: RequestStatus) =>
    {
        try
        {
            const result = await patchExecute({
                body: { status: newStatus }
            });

            if (!result) throw new Error('Error al actualizar el estado');

            toast.success('Estado actualizado', {
                description: `La solicitud ha sido actualizada correctamente`,
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });

            onStatusUpdate();
        }
        catch (e)
        {
            toast.error('Error al actualizar', {
                description: 'No se pudo actualizar el estado de la solicitud',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            throw e;
        }
    };

    const {
        availableActions,
        canModifyStatus,
        isProcessing,
        executeStatusChange,
        currentStatusLabel,
        currentStatusColor,
        isFinalStatus
    } = useRequestStatus({ currentStatus, onStatusChange: handleStatusChange });

    const handleActionClick = (action: any) =>
    {
        setSelectedAction(action);
        setShowConfirmModal(true);
    };

    const handleConfirm = async () =>
    {
        if (selectedAction)
        {
            await executeStatusChange(selectedAction.status);
            setShowConfirmModal(false);
            setSelectedAction(null);
        }
    };

    const handleCancel = () =>
    {
        setShowConfirmModal(false);
        setSelectedAction(null);
    };

    const isActionDisabled = isProcessing || isPatchLoading;

    if (isFinalStatus)
    {
        return (
            <div className={styles.finalStatus}>
                <div className={styles.statusBadge} style={{ background: currentStatusColor }}>
                    {currentStatusLabel}
                </div>
                <p className={styles.finalMessage}>
                    Esta solicitud ha finalizado y no puede ser modificada
                </p>
            </div>
        );
    }

    if (!canModifyStatus)
    {
        return (
            <div className={styles.noPermissions}>
                <div className={styles.statusBadge} style={{ background: currentStatusColor }}>
                    {currentStatusLabel}
                </div>
                <p className={styles.noPermissionsMessage}>
                    No tienes permisos para modificar esta solicitud
                </p>
            </div>
        );
    }

    return (
        <div className={styles.statusActions}>
            <div className={styles.currentStatus}>
                <span className={styles.label}>Estado:</span>
                <div className={styles.statusBadge} style={{ background: currentStatusColor }}>
                    {currentStatusLabel}
                </div>
            </div>

            <div className={styles.actionsContainer}>
                <span className={styles.actionsLabel}>Acciones Disponibles:</span>
                <div className={styles.actionButtons}>
                    {availableActions.map((action) => (
                        <button
                            key={action.status}
                            className={`${styles.actionButton} ${styles[action.variant]}`}
                            onClick={() => handleActionClick(action)}
                            disabled={isActionDisabled}
                        >
                            <span className={styles.actionIcon}>{action.icon}</span>
                            <span className={styles.actionLabel}>{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal de Confirmación */}
            {showConfirmModal && selectedAction && (
                <div className={styles.modalOverlay} onClick={handleCancel}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <span className={styles.modalIcon}>{selectedAction.icon}</span>
                            <h3>Confirmar Acción</h3>
                        </div>

                        <div className={styles.modalBody}>
                            <p className={styles.modalQuestion}>
                                ¿Estás seguro de que deseas <strong>{selectedAction.label.toLowerCase()}</strong> esta solicitud?
                            </p>
                            <p className={styles.modalDescription}>
                                {selectedAction.description}
                            </p>

                            {/*  Advertencia adicional según la acción */}
                            {selectedAction.variant === 'reject' && (
                                <div className={styles.warningBox}>
                                    <span className={styles.warningIcon}>⚠️</span>
                                    <p>Esta acción no se puede deshacer. La solicitud será rechazada permanentemente.</p>
                                </div>
                            )}

                            {selectedAction.variant === 'cancel' && (
                                <div className={styles.warningBox}>
                                    <span className={styles.warningIcon}>⚠️</span>
                                    <p>Esta acción no se puede deshacer. La solicitud será cancelada permanentemente.</p>
                                </div>
                            )}

                            {selectedAction.variant === 'approve' && (
                                <div className={styles.infoBox}>
                                    <span className={styles.infoIcon}>ℹ️</span>
                                    <p>Al aprobar, se procesará automáticamente la transferencia de stock según el tipo de solicitud.</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={handleCancel}
                                disabled={isActionDisabled}
                            >
                                Cancelar
                            </button>
                            <button
                                className={`${styles.confirmButton} ${styles[selectedAction.variant]}`}
                                onClick={handleConfirm}
                                disabled={isActionDisabled}
                            >
                                {isActionDisabled ? 'Procesando...' : selectedAction.label}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestStatusActions;