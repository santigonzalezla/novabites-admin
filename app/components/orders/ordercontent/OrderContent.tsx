'use client';

import styles from './ordercontent.module.css';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Order } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { StatusOrder } from '@/interfaces/enums';
import { formatEnumLabel } from '@/lib/enumUtils';
import { formatDateShort } from '@/lib/dateUtils';

interface OrderContentProps {
    setId: (id: string) => void;
}

const OrderContent = ({ setId }: OrderContentProps) =>
{
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(true);
    const [formData, setFormData] = useState<Order>();
    const [defaultData, setDefaultData] = useState<Order>()
    const orderId = pathname.split('/').pop();
    const [modifiedFields, setModifiedFields] = useState<Partial<Order>>();
    const { data, error, execute } = useFetch<Order>(`/api/order/${orderId}`);
    const { error: patchError, execute: patchExecute } = useFetch<Order>(`/api/order/${orderId}`, {
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
            if (isValueChanged(defaultData[name as keyof Order], value, name))
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

    const isValueChanged = (originalValue: any, newValue: any, fieldPath: string) =>
    {
        if (!defaultData) return false;

        return defaultData[fieldPath as keyof Order] !== newValue;
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
                                    <span>Precio Total:</span>
                                    <input
                                        type="text"
                                        name="totalPrice"
                                        id="totalPrice"
                                        placeholder="Price"
                                        value={`${formData?.totalPrice}`|| ''}
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Estado:</span>
                                    <input
                                        id="status"
                                        type="text"
                                        name="status"
                                        placeholder="Estado"
                                        value={formData?.status && formatEnumLabel(formData.status) || ''}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Usuario:</span>
                                    <input
                                        id="user.name"
                                        type="text"
                                        name="user.name"
                                        placeholder="Nombre de Usuario"
                                        value={formData?.user?.name || ''}
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles de la Sucursal</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>ID Sucursal:</span>
                                    <input
                                        id="store.id"
                                        type="text"
                                        name="store.id"
                                        placeholder="ID Tienda"
                                        value={formData?.store?.numId || ''}
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
                                        value={formData?.store?.name || ''}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.tableSection}>
                        <h2 className={styles.sectionTitle}>Detalles del Cliente</h2>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailLabel}>
                                <span>ID Cliente:</span>
                                <input
                                    id="client.id"
                                    type="text"
                                    name="client.id"
                                    placeholder="ID del Cliente"
                                    value={formData?.client?.numId || ''}
                                    onChange={handleChange}
                                    disabled
                                    className={isDisabled ? styles.disabled : styles.detailValue}
                                />
                            </div>
                            <div className={styles.detailLabel}>
                                <span>Nombre:</span>
                                <input
                                    id="client.name"
                                    type="text"
                                    name="client.name"
                                    placeholder="Nombre del Cliente"
                                    value={formData?.client?.name || ''}
                                    onChange={handleChange}
                                    disabled
                                    className={isDisabled ? styles.disabled : styles.detailValue}
                                />
                            </div>
                            <div className={styles.detailLabel}>
                                <span>Teléfono:</span>
                                <input
                                    id="client.phone"
                                    type="text"
                                    name="client.name"
                                    placeholder="Nombre del Cliente"
                                    value={formData?.client?.phone || ''}
                                    onChange={handleChange}
                                    disabled
                                    className={isDisabled ? styles.disabled : styles.detailValue}
                                />
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
                                {formData?.createdAt ? formatDateShort(formData.createdAt) : 'N/A'}
                            </div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Update Date</div>
                            <div className={styles.stockNumber}>
                                {formData?.updatedAt ? formatDateShort(formData.updatedAt) : 'N/A'}
                            </div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Fecha de Creación</div>
                            <div className={styles.stockNumber}>
                                {formData?.createdAt ? formatDateShort(formData.createdAt) : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default OrderContent;