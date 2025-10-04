'use client';

import styles from './suppliercontent.module.css';
import Image from 'next/image';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CategoryProduct, Product, Supplier } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';

interface SupplierContentProps {
    setData: (id: string, name: string) => void;
}

const SupplierContent = ({ setData }: SupplierContentProps) =>
{
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(true);
    const [formData, setFormData] = useState<Supplier>();
    const [defaultData, setDefaultData] = useState<Supplier>()
    const supplierId = pathname.split('/').pop();
    const [modifiedFields, setModifiedFields] = useState<Partial<Supplier>>();
    const { data, error, execute } = useFetch<Supplier>(`/api/supplier/${supplierId}`);
    const { data: patchData, error: patchError, execute: patchExecute } = useFetch<Supplier>(`/api/supplier/${supplierId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        immediate: false
    });

    useEffect(() =>
    {
        if (error)
        {
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }

        try
        {
            if (data)
            {
                setData(String(data.numId), data.name);
                setFormData(data);
                setDefaultData(data);
                setModifiedFields({});
            }
        }
        catch (error)
        {
            console.error('Error al procesar los datos del proveedor:', error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
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
            if (isValueChanged(defaultData[name as keyof Supplier], value, name))
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

        return defaultData[fieldPath as keyof Supplier] !== newValue;
    }

    const handleSaveChanges = async () =>
    {
        try
        {
            if (modifiedFields)
            {
                await patchExecute({ body: modifiedFields });

                setIsDisabled(!isDisabled);

                if (!patchError)
                {
                    toast.success('Proveedor actualizado exitosamente!', {
                        description: "El proveedor ha sido actualizado correctamente.",
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                    setDefaultData(formData);
                    setModifiedFields({});
                }
            }
            else
            {
                console.log('No hay cambios para guardar');
            }
        }
        catch (error)
        {
            console.error('Error al guardar los cambios:', error);
            toast.error(`Error al guardar los cambios: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
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
                            <h2 className={styles.sectionTitle}>Detalles del Proveedor</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>Nombre:</span>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Supplier name"
                                        value={formData?.name || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>
                                        N° Identificación:
                                    </span>
                                    <input
                                        type="text"
                                        name="docId"
                                        id="docId"
                                        placeholder="Identifación del Proveedor"
                                        value={formData?.docId || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Dirección:</span>
                                    <input
                                        type="text"
                                        name="address"
                                        id="address"
                                        placeholder="Dirección"
                                        value={formData?.address || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles de Contacto</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>Nombre de Contacto:</span>
                                    <input
                                        type="text"
                                        name="contactName"
                                        id="contactName"
                                        placeholder="Contact name"
                                        value={formData?.contactName || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>


                                <div className={styles.detailLabel}>
                                    <span>Teléfono:</span>
                                    <input
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        placeholder="Teléfono"
                                        value={formData?.phone || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Email:</span>
                                    <input
                                        type="text"
                                        name="email"
                                        id="email"
                                        placeholder="Email"
                                        value={formData?.email || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
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
                                <button className={styles.saveButton} onClick={() => handleSaveChanges()}>Guardar Cambios</button>
                            </div>
                        )}
                    </div>
                    <div className={styles.productImage}>
                        <Image
                            src="/placeholder.svg?height=200&width=150"
                            alt="Maggi product"
                            width={150}
                            height={200}
                            className={styles.image}
                        />
                    </div>
                    <div className={styles.stockSummary}>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Status</div>
                            <div className={styles.stockNumber}>Low Stock</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default SupplierContent;