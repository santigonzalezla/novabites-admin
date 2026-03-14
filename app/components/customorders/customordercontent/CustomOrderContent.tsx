'use client';

import styles from './customordercontent.module.css';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CustomOrder } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { StatusOrder } from '@/interfaces/enums';
import { formatEnumLabel } from '@/lib/enumUtils';
import { formatDateShort, formatDateInput } from '@/lib/dateUtils';
import { toast } from 'sonner';

interface CustomOrderContentProps {
    setId: (id: string) => void;
}

const CustomOrderContent = ({ setId }: CustomOrderContentProps) =>
{
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(true);
    const [formData, setFormData] = useState<CustomOrder>();
    const [defaultData, setDefaultData] = useState<CustomOrder>()
    const orderId = pathname.split('/').pop();
    const [modifiedFields, setModifiedFields] = useState<Partial<CustomOrder>>();
    const { data, error, execute } = useFetch<CustomOrder>(`/api/custom-order/${orderId}`);
    const { error: patchError, execute: patchExecute } = useFetch<CustomOrder>(`/api/custom-order/${orderId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        immediate: false
    });

    useEffect(() =>
    {
        if (error || patchError)
        {
            console.error('Error al cargar los datos:', error || patchError);
            toast.error(`Error al cargar los datos: ${error || patchError}`, {
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
                const order = await execute();

                if (order)
                {
                    setId(String(order.numId));
                    setFormData(order);
                    setDefaultData(order);
                    setModifiedFields({});
                }
            }

            fetchData();
        }
        catch (err)
        {
            console.error('Error al establecer los datos del producto:', err);
        }
    }, []);

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
            if (isValueChanged(defaultData[name as keyof CustomOrder], value, name))
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

    const handleStatusChange = (e: { target: { name: any; value: any; }; }) =>
    {
        const { name, value } = e.target;

        if (formData) setFormData({ ...formData, [name]: value });

        if (defaultData)
        {
            if (isValueChanged(defaultData[name as keyof CustomOrder], value, name))
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

        if (fieldPath === 'deliveryDate')
        {
            const originalDate = defaultData.deliveryDate
                ? formatDateInput(defaultData.deliveryDate)
                : '';
            return originalDate !== newValue;
        }

        return defaultData[fieldPath as keyof CustomOrder] !== newValue;
    }

    const handleSaveChanges = async () =>
    {
        try
        {
            if (modifiedFields && Object.keys(modifiedFields).length > 0)
            {
                const updatedOrder = await patchExecute({ body: modifiedFields });

                if (!patchError)
                {
                    setDefaultData(formData);
                    setModifiedFields({});
                }

                if (updatedOrder)
                {
                    toast.success('Cambios guardados con éxito', {
                        description: 'Los cambios en la orden personalizada se han guardado correctamente.',
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                    setIsDisabled(true);
                }
                else
                {
                    toast.error('Error al guardar los cambios', {
                        description: 'Hubo un problema al guardar los cambios. Por favor, inténtalo de nuevo.',
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                }
            }
            else
            {
                console.log('No hay cambios para guardar');
                toast.warning('No hay cambios para guardar', {
                    description: 'No se han detectado cambios en la orden personalizada.',
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }
        catch (e)
        {
            console.error('Error al guardar los cambios:', e);
            toast.error('Error al guardar los cambios', {
                description: 'Hubo un problema al guardar los cambios. Por favor, inténtalo de nuevo.',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
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
                                        value={formData?.totalPrice != null ? `$${Number(formData.totalPrice).toLocaleString('es-CO')}` : ''}
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>


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
                                        {Object.values(StatusOrder).map((status) => (
                                            <option key={status} value={status}>
                                                {formatEnumLabel(status)}
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
                                        value={formData?.user?.name || ''}
                                        onChange={handleChange}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>
                                        Fecha de Entrega:
                                    </span>
                                    <input
                                        id="deliveryDate"
                                        type="date"
                                        name="deliveryDate"
                                        placeholder="Fecha de Entrega"
                                        value={formData?.deliveryDate ? formatDateInput(formData.deliveryDate) : ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
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
                                        value={formData?.store?.name || ''}
                                        onChange={handleChange}
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
                            <div className={styles.stockLabel}>Depósito</div>
                            <div className={styles.stockNumber}>
                                {formData?.depositAmount != null ? `$${Number(formData.depositAmount).toLocaleString('es-CO')}` : 'N/A'}
                            </div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Remanente</div>
                            <div className={styles.stockNumber}>
                                {formData?.remainingAmount != null ? `$${Number(formData.remainingAmount).toLocaleString('es-CO')}` : 'N/A'}
                            </div>
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
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CustomOrderContent;