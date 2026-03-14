'use client';

import styles from './requestcontent.module.css';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { StoreRequest } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { RequestStatus } from '@/interfaces/enums';
import { formatEnumLabel } from '@/lib/enumUtils';
import { formatDateInput } from '@/lib/dateUtils';
import { toast } from 'sonner';
import RequestStatusActions from '@/app/components/requests/requeststatusactions/RequestStatusActions';

interface RequestContentProps {
    setId: (id: string) => void;
}

const RequestContent = ({ setId }: RequestContentProps) =>
{
    const pathname = usePathname();
    const [formData, setFormData] = useState<StoreRequest>();
    const requestId = pathname.split('/').pop();
    const { data, error, execute } = useFetch<StoreRequest>(`/api/store-request/${requestId}`);

    useEffect(() =>
    {
        if (error)
        {
            console.error('Error al cargar los datos:', error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }
        try
        {
            const fetchData = async () =>
            {
                const product = await execute();

                if (product)
                {
                    setId(String(product.numId));
                    setFormData(product);
                }
            }

            fetchData();
        }
        catch (err)
        {
            console.error('Error al establecer los datos del producto:', err);
        }
    }, []);

    const handleStatusUpdate = async () =>
    {
        const updatedData = await execute();
        if (updatedData) setFormData(updatedData);
    };

    return (
        <div className={styles.productcontent}>
            <div className={styles.detailsContainer}>
                <div className={styles.detailsContainerLeft}>
                    <div className={styles.containerLeftSection}>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles de la Orden</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>
                                        Tipo de Solicitud:
                                    </span>
                                    <input
                                        id="type"
                                        type="text"
                                        name="type"
                                        placeholder="Tipo de Solicitud"
                                        value={formData?.type && formatEnumLabel(formData.type) || ''}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Fecha de Creación:</span>
                                    <input
                                        id="createdAt"
                                        type="text"
                                        name="createdAt"
                                        value={formData?.createdAt ? formatDateInput(formData.createdAt) : ''}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                                {formData?.approvedDate && (
                                    <div className={styles.detailLabel}>
                                        <span>Fecha de Aprobación:</span>
                                        <input
                                            id="approvedDate"
                                            type="text"
                                            name="approvedDate"
                                            value={formData?.approvedDate ? formatDateInput(formData.approvedDate) : 'Sin Aprobar'}
                                            disabled
                                            className={styles.disabled}
                                        />
                                    </div>
                                )}
                                {formData?.completedDate && (
                                    <div className={styles.detailLabel}>
                                        <span>Fecha de Finalización:</span>
                                        <input
                                            id="completedDate"
                                            type="text"
                                            name="completedDate"
                                            value={formData?.completedDate ? formatDateInput(formData.completedDate) : 'Sin Completar'}
                                            disabled
                                            className={styles.disabled}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles del Usuario</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>ID Usuario:</span>
                                    <input
                                        id="requestingUserId.numId"
                                        type="text"
                                        name="requestingUserId.numId"
                                        placeholder="ID del Usuario"
                                        value={formData?.requestingUser?.numId || ''}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>


                                <div className={styles.detailLabel}>
                                    <span>Nombre:</span>
                                    <input
                                        id="requestingUserId.name"
                                        type="text"
                                        name="requestingUserId.name"
                                        placeholder="Nombre"
                                        value={formData?.requestingUser?.name || ''}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Teléfono:</span>
                                    <input
                                        id="requestingUserId.phone"
                                        type="text"
                                        name="requestingUserId.name"
                                        placeholder="Teléfono"
                                        value={formData?.requestingUser?.phone || ''}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.containerLeftSection}>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles de la Sucursal</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>ID Sucursal:</span>
                                    <input
                                        id="requestingStore.id"
                                        type="text"
                                        name="requestingStore.id"
                                        placeholder="ID Tienda"
                                        value={formData?.requestingStore?.numId || ''}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Nombre:</span>
                                    <input
                                        id="store.name"
                                        type="text"
                                        name="store.name"
                                        placeholder="Nombre de la Tienda"
                                        value={formData?.requestingStore?.name || ''}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles del Aprobador</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>ID Sucursal:</span>
                                    <input
                                        id="store.id"
                                        type="text"
                                        name="store.id"
                                        placeholder="ID del Usuario"
                                        value={formData?.approvedByUser?.numId || ''}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Nombre:</span>
                                    <input
                                        id="store.name"
                                        type="text"
                                        name="store.name"
                                        placeholder="Nombre"
                                        value={formData?.approvedByUser?.name || ''}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.sideContent}>
                    <div className={styles.stockSummary}>
                        <div className={styles.statusSection}>
                            <RequestStatusActions
                                currentStatus={formData?.status || RequestStatus.PENDING}
                                requestId={requestId || ''}
                                onStatusUpdate={handleStatusUpdate}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default RequestContent;