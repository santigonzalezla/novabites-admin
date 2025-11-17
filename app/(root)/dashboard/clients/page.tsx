'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import mockData from "@/app/components/shared/data/mockData.json";
import GenericFilter, { filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import { Create, Download, Upload } from '@/app/components/svg';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';
import { Client, Order } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';
import withAuth from '@/hoc/withAuth';
import { Role } from '@/interfaces/enums';

interface ClientConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const Clients = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [clientsData, setClientsData] = useState<Client[]>([]);
    const [filteredData, setFilteredData] = useState<Client[]>([]);
    const [config, setConfig] = useState<ClientConfig>({columns: []});
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const { isLoading, error, execute } = useFetch<Client[]>('/api/client', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/client/export', {
        immediate: false
    });

    const filterConfig = [
        { field: 'name', placeholder: 'Nombre', label: 'nombre' },
        { field: 'email', placeholder: 'Email', label: 'email' }
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
            const fetchClients = async () =>
            {
                const clients = await execute();

                if (clients)
                {
                    setClientsData(clients);
                    const filtered = filterItems(clients, currentFilters);
                    setFilteredData(filtered);
                }
            }

            fetchClients();
            setConfig(mockData.clients.config);
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
        const filtered = filterItems(clientsData, filters);
        setFilteredData(filtered);
    };

    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setFilteredData(clientsData);
    };

    return (
        <div className={styles.clients}>
            <div className={styles.clientsTop}>
                <GenericFilter
                    filterConfig={filterConfig}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                />
                <div className={styles.topButtons}>
                    <DownloadButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="client"
                    />
                </div>
            </div>
            <GenericDataTable
                data={filteredData}
                config={config}
            />
        </div>
    );
}

export default withAuth(Clients, { allowedRoles: [Role.ADMIN, Role.MANAGER] });