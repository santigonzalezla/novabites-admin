'use client';

import styles from './requestcard.module.css';
import { StoreRequest } from '@/interfaces/interfaces';
import { enumValueToLabel } from '@/lib/enumUtils';
import { formatDateShort } from '@/lib/dateUtils';
import RequestStatusActions from '@/app/components/requests/requeststatusactions/RequestStatusActions';
import { RequestStatus } from '@/interfaces/enums';
import { useState } from 'react';

interface RequestCardListProps {
    requests: StoreRequest[];
    onRefresh?: () => void;
}

const RequestCardList = ({ requests, onRefresh }: RequestCardListProps) =>
{
    const handleStatusUpdate = async () =>
    {
        if (onRefresh) await onRefresh();
    };

    if (!requests || requests.length === 0)
    {
        return (
            <div className={styles.emptyState}>
                <p>No hay solicitudes para mostrar.</p>
            </div>
        );
    }

    return (
        <div className={styles.cardList}>
            {requests.map((req) => (
                <div key={req.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.idBlock}>
                            <span className={styles.idLabel}>Solicitud</span>
                            <span className={styles.idValue}>#{req.numId}</span>
                        </div>
                        <div className={styles.typeBadge}>
                            {enumValueToLabel(req.type)}
                        </div>
                    </div>

                    <div className={styles.cardBody}>
                        <div className={styles.row}>
                            <span className={styles.fieldLabel}>Origen:</span>
                            <span className={styles.fieldValue}>{req.requestingStore?.name || req.requestingStoreId}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.fieldLabel}>Destino:</span>
                            <span className={styles.fieldValue}>{req.targetStore?.name || req.targetStoreId}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.fieldLabel}>Fecha:</span>
                            <span className={styles.fieldValue}>{formatDateShort(req.requestedDate)}</span>
                        </div>
                        {Array.isArray(req.details) && (
                            <div className={styles.row}>
                                <span className={styles.fieldLabel}>Items:</span>
                                <span className={styles.fieldValue}>{req.details.length}</span>
                            </div>
                        )}
                    </div>

                    {Array.isArray(req.details) && req.details.length > 0 && (
                        <DetailsToggle details={req.details} />
                    )}

                    <div className={styles.cardFooter}>
                        <RequestStatusActions
                            currentStatus={req.status as RequestStatus}
                            requestId={req.id}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const DetailsToggle = ({ details }: { details: any[] }) =>
{
    const [open, setOpen] = useState(false);

    return (
        <div className={styles.detailsSection}>
            <button className={styles.detailsToggle} onClick={() => setOpen(!open)}>
                {open ? 'Ocultar detalles' : 'Ver detalles'}
            </button>
            {open && (
                <div className={styles.detailsPanel}>
                    {details.map((d, idx) => (
                        <div key={idx} className={styles.detailRow}>
                            <span className={styles.detailName}>{d.product?.name || d.productId}</span>
                            <span className={styles.detailQty}>x{d.requestedQuantity}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RequestCardList;
