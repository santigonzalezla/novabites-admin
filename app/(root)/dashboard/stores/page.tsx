'use client';

import styles from './page.module.css';
import { Create, Download } from '@/app/components/svg';
import StoreItem from '@/app/components/stores/storeitem/StoreItem';
import mockData from '@/app/components/shared/data/mockData.json';
import { ReactNode, useEffect, useState } from 'react';
import GenericForm from '@/app/components/shared/genericform/GenericForm';
import Modal from '@/app/components/shared/modal/Modal';
import { useFetch } from '@/hooks/useFetch';
import { Store, User } from '@/interfaces/interfaces';
import { Role } from '@/interfaces/enums';
import { toast } from 'sonner';

interface InputConfig {
    fieldTypes: Record<string, string>;
    selectOptions: Record<string, string[] | { value: string; label: string; }[]>;
    labelTranslations: Record<string, string>;
    placeholderTranslations: Record<string, string>;
}

const Stores = () =>
{
    const [storeData, setStoreData] = useState<Store[]>([]);
    const [inputConfig, setInputConfig] = useState<InputConfig>({
        fieldTypes: {},
        selectOptions: {},
        labelTranslations: {},
        placeholderTranslations: {}
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isLoading, error, execute } = useFetch<Store[]>('/api/store', {
        immediate: false
    });
    const { execute: executeManagers } = useFetch<User[]>(`/api/user?role=${Role.MANAGER}`, {
        immediate: false
    });

    useEffect(() =>
    {
        if (error)
        {
            console.error("Error al cargar los datos:", error);
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
                const stores = await execute();

                if (stores) setStoreData(stores);

                const managersData = await executeManagers();

                if (managersData)
                {
                    const baseConfig = mockData.stores.inputConfig;
                    const mangerOptions = managersData.map((store) => ({
                        value: store.id,
                        label: store.name
                    }));

                    setInputConfig({
                        ...baseConfig,
                        selectOptions: {
                            ...baseConfig.selectOptions,
                            'managerId': mangerOptions
                        }
                    });
                }
            }

            fetchData();
            setInputConfig(mockData.stores.inputConfig);
        }
        catch (error)
        {
            console.error("Error al cargar los datos:", error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, []);

    const handleOverlayClick = () => setIsModalOpen(false);

    const handleSubmit = async (formData: Record<string, any>, file?: File | null) =>
    {
        const formDataToSend = new FormData();

        formDataToSend.append('name', formData.name);
        formDataToSend.append('type', formData.type);
        formDataToSend.append('available', formData.available === 'ACTIVE' ? 'true' : 'false');

        if (formData.phone) formDataToSend.append('phone', formData.phone);
        if (formData.address) formDataToSend.append('address', formData.address);
        if (formData.managerId) formDataToSend.append('managerId', formData.managerId);

        if (file) formDataToSend.append('image', file);

        try
        {
            const newStore = await execute({
                method: 'POST',
                body: formDataToSend,
                isFormData: true
            });

            if (newStore && !error)
            {
                setIsModalOpen(false);

                toast.success("Tienda creada correctamente", {
                    description: "La tienda ha sido creada con éxito.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const stores = await execute();

                if (stores) setStoreData(stores);
            }
        }
        catch (error)
        {
            console.error("Error al crear la tienda:", error);
            toast.error(`Error al crear la tienda: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const columns = [
        { key: 'name'},
        { key: 'phone' },
        { key: 'address' },
        { key: 'type' },
        { key: 'managerId' },
        { key: 'available' }
    ];

    const createStore = (): ReactNode =>
    {
        return (
            <GenericForm
                type={"Tienda"}
                columns={columns}
                onSubmit={handleSubmit}
                onClose={handleOverlayClick}
                inputConfig={inputConfig}
            />
        );
    }

    return (
        <div className={styles.stores}>
            <div className={styles.storesTop}>
                <div className={styles.topButtons}>
                    <button className={styles.create} onClick={() => setIsModalOpen(prevState => !prevState)}>
                        <Create />Añadir Sucursal
                    </button>
                </div>
            </div>
            <div className={styles.storesContainer}>
                {storeData.map((store) => (
                    <StoreItem
                        key={store.id}
                        store={store}
                    />
                ))}
            </div>
            {isModalOpen && (
                <Modal children={createStore()} onClose={handleOverlayClick} />
            )}
        </div>
    );
}

export default Stores;