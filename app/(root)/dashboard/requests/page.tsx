'use client';

import styles from './page.module.css';
import mockData from "@/app/components/shared/data/mockData.json";
import { Create, Download, Upload } from '@/app/components/svg';
import { useEffect, useState } from 'react';
import GenericFilter, { filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';
import { StoreRequest } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';
import withAuth from '@/hoc/withAuth';
import { Role } from '@/interfaces/enums';
import { useAuth } from '@/context/AuthContext';
import RequestCardList from '@/app/components/requests/requestcard/RequestCardList';

interface RequestConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const Requests = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [requestsData, setRequestsData] = useState<StoreRequest[]>([]);
    const [filteredData, setFilteredData] = useState<StoreRequest[]>([]);
    const [config, setConfig] = useState<RequestConfig>({columns: []});
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const { user } = useAuth();
    const { isLoading, error, execute } = useFetch<StoreRequest[]>('/api/store-request', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/store-request/export', {
        immediate: false
    });

    const filterConfig = [
        { field: 'client.name', placeholder: 'Nombre', label: 'nombre' },
        { field: 'deliveryDate', placeholder: 'Fecha', label: 'fecha' },
        { field: 'status', placeholder: 'Estado', label: 'estado' }
    ]

    useEffect(() =>
    {
        // En un caso real, aquí harías un fetch de los datos
        const fetchRequest = async () =>
        {
            const requests = await execute();

            if (requests)
            {
                setRequestsData(requests);
                const filtered = filterItems(requests, currentFilters);
                setFilteredData(filtered);
            }
        }

        fetchRequest();
        setConfig(mockData.storeRequest.config);
    }, []);

    const handleFilterChange = (filters: Record<string, string>) =>
    {
        setCurrentFilters(filters);
        const filtered = filterItems(requestsData, filters);
        setFilteredData(filtered);
    };

    // Función para resetear filtros
    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setFilteredData(requestsData); // Mostrar todos los datos sin filtrar
    };

    const refreshRequests = async () =>
    {
        const requests = await execute();
        if (requests)
        {
            setRequestsData(requests);
            const filtered = filterItems(requests, currentFilters);
            setFilteredData(filtered);
        }
    };

    const isCourier = user?.role === Role.COURIER;

    return (
        <div className={`${styles.orders} ${isCourier ? styles.courier : ''}`}>
            <div className={styles.ordersTop}>
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
                        domain="store-request"
                    />
                </div>
            </div>
            {isCourier ? (
                <RequestCardList
                    requests={filteredData}
                    onRefresh={refreshRequests}
                />
            ) : (
                <GenericDataTable
                    data={filteredData}
                    config={config}
                />
            )}
        </div>
    );
}

export default withAuth(Requests, { allowedRoles: [Role.ADMIN, Role.COURIER, Role.MANAGER, Role.MANUFACTURER] });