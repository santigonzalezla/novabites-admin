'use client';

import styles from './page.module.css';
import GenericFilter, { filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import { Create, Download, Upload } from '@/app/components/svg';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';
import { ReactNode, useEffect, useState } from 'react';
import mockData from '@/app/components/shared/data/mockData.json';
import GenericForm from '@/app/components/shared/genericform/GenericForm';
import Modal from '@/app/components/shared/modal/Modal';
import withAuth from '@/hoc/withAuth';
import { Role } from '@/interfaces/enums';
import { User } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';

interface UserConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

interface InputConfig {
    fieldTypes: Record<string, string>;
    selectOptions: Record<string, string[]>;
    labelTranslations: Record<string, string>;
    placeholderTranslations: Record<string, string>;
}

const Users = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [usersData, setUsersData] = useState<User[]>([]);
    const [filteredData, setFilteredData] = useState<User[]>([]);
    const [config, setConfig] = useState<UserConfig>({columns: []});
    const [inputConfig, setInputConfig] = useState<InputConfig>({
        fieldTypes: {},
        selectOptions: {},
        labelTranslations: {},
        placeholderTranslations: {}
    });
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isLoading, error, execute } = useFetch<User[]>('/api/user', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/user/export', {
        immediate: false
    });

    const filterConfig = [
        { field: 'name', placeholder: 'Nombre', label: 'nombre' },
        { field: 'role', placeholder: 'Rol', label: 'rol' },
        { field: 'status', placeholder: 'Estado', label: 'estado' }
    ];

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
            const fetchUsers = async () =>
            {
                const users = await execute();

                if (users)
                {
                    setUsersData(users);
                    const filtered = filterItems(users, currentFilters);
                    setFilteredData(filtered);
                }
            }

            fetchUsers();
            setConfig(mockData.users.config);
            setInputConfig(mockData.users.inputConfig);
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

    const handleFilterChange = (filters: Record<string, string>) =>
    {
        setCurrentFilters(filters);
        const filtered = filterItems(usersData, filters);
        setFilteredData(filtered);
    };

    // Función para resetear filtros
    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setFilteredData(usersData); // Mostrar todos los datos sin filtrar
    };

    const handleOverlayClick = () =>
    {
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData: Record<string, any>, file?: File | null) =>
    {
        const formDataToSend = new FormData();

        formDataToSend.append('typeId', formData.typeId);
        formDataToSend.append('docId', formData.docId);
        formDataToSend.append('status', formData.available === 'Activo' ? 'ACTIVE' : 'INACTIVE');
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('role', formData.role);

        if (file) formDataToSend.append('image', file);

        try
        {
            console.log("Enviando datos del formulario:", formDataToSend);

            const newUser = await execute({
                method: 'POST',
                body: formDataToSend,
                isFormData: true
            });

            if (newUser && !error)
            {
                setIsModalOpen(false);

                toast.success("Usuario creado correctamente", {
                    description: "El usuario ha sido creado con éxito.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const users = await execute();

                if (users)
                {
                    setUsersData(users);
                    setFilteredData(users);
                }
            }
        }
        catch (error)
        {
            console.error("Error al crear el usuario:", error);
            toast.error(`Error al crear el usuario: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const columns = [
        { key: 'typeId'},
        { key: 'docId'},
        { key: 'name' },
        { key: 'email' },
        { key: 'phone' },
        { key: 'role' },
        { key: 'status' }
    ];

    const createUser = (): ReactNode =>
    {
        return (
            <GenericForm
                hasImage={true}
                type={"Usuario"}
                columns={columns}
                onSubmit={handleSubmit}
                onClose={handleOverlayClick}
                inputConfig={inputConfig}
            />
        );
    }

    return (
        <div className={styles.users}>
            <div className={styles.usersTop}>
                <GenericFilter
                    filterConfig={filterConfig}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                />
                <div className={styles.topButtons}>
                    <button className={styles.create} onClick={() => setIsModalOpen(prevState => !prevState)}>
                        <Create />
                    </button>
                    <DownloadButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="user"
                    />
                </div>
            </div>
            <GenericDataTable
                data={filteredData}
                config={config}
            />
            {isModalOpen && (
                <Modal children={createUser()} onClose={handleOverlayClick} />
            )}
        </div>
    );
}

export default withAuth(Users, { allowedRoles: [Role.ADMIN] });