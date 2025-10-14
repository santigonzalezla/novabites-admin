'use client';

import styles from './clientcontent.module.css';
import Image from 'next/image';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useState } from 'react';
import UserOrdersTable from '@/app/components/users/userorderstable/UserOrdersTable';
import mockData from '@/app/components/shared/data/mockData.json';
import ClientOrderTable from '@/app/components/clients/clientordertable/ClientOrderTable';
import { usePathname } from 'next/navigation';
import { Client, Supplier } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { TypeId } from '@/interfaces/enums';

interface ClientProps {
    setData: (id: string, name: string) => void;
}

interface ClientOrder {
    id: string;
    orderName: string;
    address: string;
    total: string;
}

interface ClientOrderConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const ClientContent = ({ setData }: ClientProps) =>
{
    const [clientOrderData, setClientOrderData] = useState<ClientOrder[]>([]);
    const [config, setConfig] = useState<ClientOrderConfig>({columns: []});
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(true);
    const [formData, setFormData] = useState<Client>();
    const [defaultData, setDefaultData] = useState<Client>()
    const clientId = pathname.split('/').pop();
    const [modifiedFields, setModifiedFields] = useState<Partial<Client>>();
    const { data, error, execute } = useFetch<Client>(`/api/client/${clientId}`);
    const { data: patchData, error: patchError, execute: patchExecute } = useFetch<Client>(`/api/client/${clientId}`, {
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
            setData(String(data.numId), data.name);
            setFormData(data);
            setDefaultData(data);
            setModifiedFields({});
        }
        setClientOrderData(mockData.clientOrders.data as ClientOrder[]);
        setConfig(mockData.clientOrders.config);
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
            if (isValueChanged(defaultData[name as keyof Client], value, name))
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

        return defaultData[fieldPath as keyof Client] !== newValue;
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
                            <h2 className={styles.sectionTitle}>Detalles del Cliente</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>N° Documento:</span>
                                    <div className={styles.idList}>
                                        <select
                                            name="typeId"
                                            id="typeId"
                                            value={formData?.typeId || 'CC'}
                                            onChange={handleChange}
                                            className={styles.idSelect}
                                            disabled={isDisabled}
                                        >
                                            {Object.values(TypeId).map((typeId) => (
                                                <option key={typeId} value={typeId}>
                                                    {typeId}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            name="docId"
                                            id="docId"
                                            placeholder="N° Documento Cliente"
                                            value={formData?.docId || ''}
                                            onChange={handleChange}
                                            disabled={isDisabled}
                                            className={`${styles.docIdInput} ${isDisabled ? styles.disabled : styles.detailValue}`}
                                        />
                                    </div>
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Nombre:</span>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Nombre Cliente"
                                        value={formData?.name || ''}
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
                                    <span>Teléfono:</span>
                                    <input
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        placeholder=">Teléfono"
                                        value={formData?.phone || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Email</span>
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

                    <div className={styles.tableSection}>
                        <h2 className={styles.sectionTitle}>Ordenes Recientes</h2>
                        <div className={styles.detailsGrid}>
                            <ClientOrderTable data={clientOrderData} config={config} />
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

export default ClientContent;