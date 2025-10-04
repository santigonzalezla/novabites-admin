'use client';

import styles from './supplycontent.module.css';
import Image from 'next/image';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Supplier, Supply } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { UnitType } from '@/interfaces/enums';
import { toast } from 'sonner';

interface SupplyContentProps {
    setData: (id: string, name: string) => void;
}

const SupplyContent = ({ setData }: SupplyContentProps) =>
{
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(true);
    const [formData, setFormData] = useState<Supply>();
    const [defaultData, setDefaultData] = useState<Supply>()
    const supplyId = pathname.split('/').pop();
    const [modifiedFields, setModifiedFields] = useState<Partial<Supply>>();
    const { data, error, execute } = useFetch<Supply>(`/api/supply/${supplyId}`);
    const { data: supplierData, error: supplierError } = useFetch<Supplier>(`/api/supplier`);
    const { data: patchData, error: patchError, execute: patchExecute } = useFetch<Supply>(`/api/supply/${supplyId}`, {
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
            console.error('Error al cargar los datos del suministro:', error);
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
            console.error('Error al procesar los datos del suministro:', error);
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
            if (isValueChanged(defaultData[name as keyof Supply], value, name))
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

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        const unit = e.target.value as UnitType;

        if (formData)
        {
            const updatedFormData = { ...formData, unit: unit };
            setFormData(updatedFormData);
        }

        // Manejar modifiedFields
        if (defaultData)
        {
            if (defaultData.unit !== unit)
            {
                setModifiedFields((prev) => ({ ...prev, unit: unit }));
            }
            else
            {
                setModifiedFields(prev => {
                    const { unit: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    }

    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        const supplierId = e.target.value;
        const selectedSupplier = supplierData && Object.values(supplierData).find((supplier: any) => supplier.id === supplierId);

        if (formData && selectedSupplier)
        {
            const updatedFormData = { ...formData, supplier: selectedSupplier };
            setFormData(updatedFormData);
        }

        // Manejar modifiedFields
        if (defaultData)
        {
            if (defaultData.supplier?.id !== supplierId)
            {
                setModifiedFields((prev) => ({ ...prev, supplierId: supplierId }));
            }
            else
            {
                setModifiedFields(prev => {
                    const { supplierId: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    }

    const isValueChanged = (originalValue: any, newValue: any, fieldPath: string) =>
    {
        if (!defaultData) return false;

        return defaultData[fieldPath as keyof Supply] !== newValue;
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
                    toast.success('Insumo actualizado exitosamente!', {
                        description: "El insumo ha sido actualizado.",
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
        catch (e)
        {
            console.error('Error al guardar los cambios:', e);
            toast.error(`Error al guardar los cambios: ${e}`, {
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
                            <h2 className={styles.sectionTitle}>Detalles del Insumo</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>
                                        Nombre:
                                    </span>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        placeholder="Product name"
                                        value={formData?.name || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Precio:</span>
                                    <input
                                        type="text"
                                        name="price"
                                        id="price"
                                        placeholder="Price"
                                        value={`${formData?.price}`|| ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Unidad:</span>
                                    <select
                                        id="unit"
                                        name="unit"
                                        disabled={isDisabled}
                                        value={formData?.unit || ''}
                                        onChange={handleUnitChange}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    >
                                        {Object.values(UnitType).map((unit) => (
                                            <option key={unit} value={unit}>
                                                {unit}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </div>

                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles del Proveedor</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>ID Proveedor:</span>
                                    <select
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                        disabled={isDisabled}
                                        value={formData?.supplier?.id || ''}
                                        onChange={handleSupplierChange}
                                        name="supplierId"
                                        id="supplierId"
                                    >
                                        {supplierData && Object.values(supplierData).map((supplier: Supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.numId}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Nombre:</span>
                                    <input
                                        type="text"
                                        value={formData?.supplier?.name || ''}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Teléfono:</span>
                                    <input
                                        type="text"
                                        placeholder="Contact Number"
                                        value={formData?.supplier?.phone || ''}
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
                            <div className={styles.stockLabel}>Opening Stock</div>
                            <div className={styles.stockNumber}>40</div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Remaining Stock</div>
                            <div className={styles.stockNumber}>34</div>
                        </div>
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

export default SupplyContent;