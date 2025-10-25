'use client';

import styles from './storecontent.module.css';
import Image from 'next/image';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CategoryProduct, Product, Store, Supplier, User } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { Role, TypeContract, TypeStore } from '@/interfaces/enums';
import { toast } from 'sonner';

interface StoreContentProps {
    setData: (id: string, name: string) => void;
}

const StoreContent = ({ setData }: StoreContentProps) =>
{
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(true);
    const [formData, setFormData] = useState<Store>();
    const [defaultData, setDefaultData] = useState<Store>();
    const storeId = pathname.split('/').pop();
    const [modifiedFields, setModifiedFields] = useState<Partial<Store>>();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isLoading, error, execute } = useFetch<Store>(`/api/store/${storeId}`);
    const { data: managerData, error: managerError, execute: managerExecute } = useFetch<User>(`/api/user/`);

    useEffect(() =>
    {
        if (error || managerError)
        {
            console.error("Error al cargar los datos:", error || managerError);
            toast.error(`Error al cargar los datos: ${error || managerError}`, {
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
                const store = await execute();

                if (store)
                {
                    setData(String(store.numId), store.name);
                    setFormData(store);
                    setDefaultData(store);
                    setModifiedFields({});
                }
            }

            fetchData();
        }
        catch (error)
        {
            console.error("Error al procesar los datos:", error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, []);

    const handleDisable = async () =>
    {
        setIsDisabled(!isDisabled);

        if (!isDisabled)
        {
            if (defaultData) setFormData(defaultData);

            setModifiedFields({});
            setSelectedImage(null);
            setPreviewImage(null);
        }
        else
        {
            if (formData)
            {
                const newFetch = await execute();

                if (newFetch)
                {
                    setFormData(newFetch);
                    setDefaultData(newFetch);
                }
            }
        }
    }

    const handleImageClick = () =>
    {
        if (!isDisabled && fileInputRef.current) fileInputRef.current.click();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = event.target.files?.[0];

        if (file)
        {
            if (!file.type.startsWith('image/'))
            {
                toast.error("Por favor selecciona un archivo de imagen válido", {
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                return;
            }

            if (file.size > 5 * 1024 * 1024)
            {
                toast.error("La imagen debe ser menor a 5MB", {
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                return;
            }

            setSelectedImage(file);
            setModifiedFields((prev) => ({ ...prev, imageFile: true }));

            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target?.result as string);
            reader.readAsDataURL(file);

            toast.success("Imagen seleccionada correctamente", {
                description: "La imagen se actualizará cuando guardes los cambios",
                duration: 2000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) =>
    {
        const { name, value } = e.target;

        if (formData) setFormData({ ...formData, [name]: value });

        if (defaultData)
        {
            if (isValueChanged(value, name))
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

    const isValueChanged = (newValue: any, fieldPath: string) =>
    {
        if (!defaultData) return false;

        return defaultData[fieldPath as keyof Store] !== newValue;
    }

    const handleSaveChanges = async () =>
    {
        try
        {
            const hasFieldChanges = modifiedFields && Object.keys(modifiedFields).length > 0;
            const hasImageChange = selectedImage !== null;

            if (hasFieldChanges || hasImageChange)
            {
                const formDataToSend = new FormData();

                if (modifiedFields)
                {
                    Object.keys(modifiedFields).forEach(key =>
                    {
                        if (key !== 'imageFile')
                        {
                            const value = modifiedFields[key as keyof Store];
                            if (value !== undefined && value !== null) formDataToSend.append(key, String(value));
                        }
                    });
                }

                if (selectedImage) formDataToSend.append('image', selectedImage);

                const updatedStore = await execute({
                    method: 'PATCH',
                    body: formDataToSend,
                    isFormData: true
                }, `/api/store/${storeId}`);

                if (updatedStore && !error)
                {
                    setIsDisabled(true);

                    toast.success("Tienda actualizada correctamente", {
                        description: "La tienda ha sido actualizada con éxito.",
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });

                    const updatedData = updatedStore;
                    setFormData(updatedData);
                    setDefaultData(updatedData);
                    setData(String(updatedData.numId), updatedData.name);
                    setModifiedFields({});
                    setSelectedImage(null);
                    setPreviewImage(null);
                }
                else
                {
                    toast.error("Error al actualizar la tienda", {
                        description: "Por favor, inténtalo de nuevo más tarde.",
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                }
            }
            else
            {
                console.log('No hay cambios para guardar');
            }
        }
        catch (e)
        {
            console.error("Error al guardar los cambios:", e);
            toast.error(`Error al guardar los cambios: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const transformValue = (value: TypeStore) =>
    {
        switch (value)
        {
            case TypeStore.DISTRIBUTION:
                return 'Distribución';
            case TypeStore.NORMAL:
                return 'Estandar';
            case TypeStore.PRINCIPAL:
                return 'Principal';
            default:
                return value;
        }
    }

    return (
        <div className={styles.productcontent}>
            <div className={styles.detailsContainer}>
                <div className={styles.detailsContainerLeft}>
                    <div className={styles.containerLeftSection}>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles de la Sucursal</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>Nombre:</span>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Store name"
                                        value={formData?.name || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Tipo:</span>
                                    <select
                                        id="type"
                                        name="type"
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                        disabled={isDisabled}
                                        value={formData?.type || ''}
                                        onChange={handleChange}
                                    >
                                        {Object.values(TypeStore).map((typeStore) => (
                                            <option key={typeStore} value={typeStore}>
                                                {transformValue(typeStore)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Store Details</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>Dirección:</span>
                                    <input
                                        type="text"
                                        name="address"
                                        id="address"
                                        placeholder="Store address"
                                        value={formData?.address || ''}
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
                                        placeholder="Store phone"
                                        value={formData?.phone || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.tableSection}>
                        <h2 className={styles.sectionTitle}>Manager Information</h2>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailLabel}>
                                <span>ID Gerente:</span>
                                <select
                                    id="managerId"
                                    name="managerId"
                                    className={isDisabled ? styles.disabled : styles.detailValue}
                                    disabled={isDisabled}
                                    value={formData?.managerId || ''}
                                    onChange={handleChange}
                                >
                                    {managerData && Object.values(managerData).map((manager) => (
                                        ((manager.role === Role.MANAGER) && (
                                            <option key={manager.id} value={manager.id}>
                                                {manager?.numId}
                                            </option>
                                        ))
                                    ))}
                                </select>
                            </div>


                            <div className={styles.detailLabel}>
                                <span>Nombre:</span>
                                <input
                                    type="text"
                                    name="manager.name"
                                    id="manager.name"
                                    placeholder="Manager Name"
                                    value={
                                        managerData && formData?.managerId
                                            ? Object.values(managerData).find(manager => manager.id === formData?.managerId)?.name || ''
                                            : ''
                                    }
                                    disabled
                                    className={isDisabled ? styles.disabled : styles.detailValue}
                                />
                            </div>

                            <div className={styles.detailLabel}>
                                <span>Email:</span>
                                <input
                                    type="text"
                                    name="manager.email"
                                    id="manager.email"
                                    placeholder="Manager Email"
                                    value={
                                        managerData && formData?.managerId
                                            ? Object.values(managerData).find(manager => manager.id === formData?.managerId)?.email || ''
                                            : ''
                                    }
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
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <div
                        className={`${styles.productImage} ${!isDisabled ? styles.productImageSelector : ''}`}
                        onClick={handleImageClick}
                        style={{ cursor: !isDisabled ? 'pointer' : 'default' }}
                    >
                        <Image
                            src={previewImage || formData?.imageUrl || '/placeholder.jpg'}
                            alt="Store Image"
                            width={150}
                            height={200}
                            className={`${styles.image} ${!isDisabled ? styles.imageDisabled : ''}`}
                        />
                        {!isDisabled && (
                            <div className={styles.imageOverlay}>
                                <span>Click para cambiar imagen</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.stockSummary}>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Ventas (Mes)</div>
                            <div className={styles.stockNumber}>$12.003,40</div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Pedidos (Mes)</div>
                            <div className={styles.stockNumber}>34</div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Status</div>
                            <div className={styles.stockNumber}>Pending</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default StoreContent;