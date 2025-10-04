'use client';

import styles from './requestcontent.module.css';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { StoreRequest } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { RequestStatus } from '@/interfaces/enums';

interface RequestContentProps {
    setId: (id: string) => void;
}

const RequestContent = ({ setId }: RequestContentProps) =>
{
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(true);
    const [formData, setFormData] = useState<StoreRequest>();
    const [defaultData, setDefaultData] = useState<StoreRequest>()
    const requestId = pathname.split('/').pop();
    const [modifiedFields, setModifiedFields] = useState<Partial<StoreRequest>>();
    const { data, error, execute } = useFetch<StoreRequest>(`/api/store-request/${requestId}`);
    const { error: patchError, execute: patchExecute } = useFetch<StoreRequest>(`/api/store-request/${requestId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        immediate: false
    });

    useEffect(() =>
    {
        if (data)
        {
            console.log(data);
            setId(String(data.numId));
            setFormData(data);
            setDefaultData(data);
            setModifiedFields({});
        }
    }, [data]);

    const handleDisable = async () =>
    {
        setIsDisabled(!isDisabled);

        if (!isDisabled)
        {
            // Si estamos cancelando la edición, restaurar datos originales
            if (defaultData) setFormData(defaultData);

            setModifiedFields({});
        }
        else
        {
            // Si estamos empezando a editar, obtener datos frescos
            if (data)
            {
                const newFetch = await execute();

                if (newFetch)
                {
                    setFormData(newFetch);
                    setDefaultData(newFetch); // Actualizar también defaultData
                }
            }
        }
    }

    const handleChange = (e: { target: { name: any; value: any; }; }) =>
    {
        const { name, value } = e.target;

        if (formData) setFormData({
            ...formData, [name]: value
        });

        if (defaultData)
        {
            if (isValueChanged(defaultData[name as keyof StoreRequest], value, name))
            {
                setModifiedFields((prev) => ({
                    ...prev,
                    [name]: value
                }));
            }
            else
            {
                setModifiedFields(prev =>
                {
                    const { [name]: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    }

    const transformText = (status: RequestStatus):string =>
    {
        switch (status)
        {
            case RequestStatus.PENDING:
                return "Pendiente";
            case RequestStatus.APPROVED:
                return "Aprobado";
            case RequestStatus.REJECTED:
                return "Rechazado";
            case RequestStatus.IN_PROGRESS:
                return "En Progreso";
            case RequestStatus.COMPLETED:
                return "Completado";
            case RequestStatus.CANCELED:
                return "Cancelado";
            default:
                return status;
        }
    }

    const handleStatusChange = (e: { target: { name: any; value: any; }; }) =>
    {
        const { name, value } = e.target;

        if (formData) setFormData({ ...formData, [name]: value });

        if (defaultData)
        {
            if (isValueChanged(defaultData[name as keyof StoreRequest], value, name))
            {
                setModifiedFields((prev) => ({ ...prev, [name]: value }));
            }
            else
            {
                setModifiedFields(prev =>
                {
                    const { [name]: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    }

    const isValueChanged = (originalValue: any, newValue: any, fieldPath: string) =>
    {
        if (!defaultData) return false;

        return defaultData[fieldPath as keyof StoreRequest] !== newValue;
    }

    const handleSaveChanges = async () =>
    {
        if (modifiedFields)
        {
            await patchExecute({ body: modifiedFields });

            setIsDisabled(!isDisabled);

            if (!patchError)
            {
                setDefaultData(formData);
                setModifiedFields({});
            }
        }
        else
        {
            console.log('No hay cambios para guardar');
        }
    }

    return (
        <div className={styles.productcontent}>
            <div className={styles.detailsContainer}>
                <div className={styles.detailsContainerLeft}>
                    <div className={styles.containerLeftSection}>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles de la Orden</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>Estado:</span>
                                    <select
                                        id="status"
                                        name="status"
                                        disabled={isDisabled}
                                        value={formData?.status || ''}
                                        onChange={handleStatusChange}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    >
                                        {Object.values(RequestStatus).map((status) => (
                                            <option key={status} value={status}>
                                                {transformText(status)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>
                                        Usuario:
                                    </span>
                                    <input
                                        id="user.name"
                                        type="text"
                                        name="user.name"
                                        placeholder="Nombre de Usuario"
                                        value={formData?.requestingUser?.name || ''}
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
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
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
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
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
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
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
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
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
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
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
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
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
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
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.sideContent}>
                    <div>
                        {isDisabled ? (
                            <button className={styles.editButton} onClick={() => handleDisable()}>
                                <Edit />
                                Editar Campos
                            </button>
                        ) : (
                            <div className={styles.actionButtons}>
                                <button className={styles.cancelButton} onClick={() => handleDisable()}>Cancelar</button>
                                <button className={styles.saveButton} onClick={() => handleSaveChanges()}>Guardar</button>
                            </div>
                        )}
                    </div>
                    <div className={styles.stockSummary}>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>ID User</div>
                            <div className={styles.stockNumber}>40</div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Creation Date</div>
                            <div className={styles.stockNumber}>
                                {formData?.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Update Date</div>
                            <div className={styles.stockNumber}>
                                {formData?.updatedAt ? new Date(formData.updatedAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Fecha de Creación</div>
                            <div className={styles.stockNumber}>
                                {formData?.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default RequestContent;