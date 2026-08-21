'use client';

import styles from './page.module.css';
import mockData from "@/app/components/shared/data/mockData.json";
import { Create, Download, Upload } from '@/app/components/svg';
import { useEffect, useState } from 'react';
import GenericFilter, { filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';
import { CustomOrder, PaginatedResponse, StoreRequest } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';
import withAuth from '@/hoc/withAuth';
import { Role } from '@/interfaces/enums';
import { useAuth } from '@/context/AuthContext';
import RequestCardList from '@/app/components/requests/requestcard/RequestCardList';
import ManufacturerTabs from '@/app/components/requests/manufacturertabs/ManufacturerTabs';

interface RequestConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const FILTER_TO_QUERY_PARAM: Record<string, string> = {
    'requestingStore.name': 'requestingStoreName',
    type: 'type',
    status: 'status',
};

const buildQueryString = (page: number, limit: number, filters: Record<string, string>) =>
{
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    Object.entries(filters).forEach(([field, value]) =>
    {
        const paramName = FILTER_TO_QUERY_PARAM[field];
        if (paramName && value && value.trim() !== '') params.set(paramName, value.trim());
    });

    return params.toString();
};

const Requests = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [requestsData, setRequestsData] = useState<StoreRequest[]>([]);
    const [filteredData, setFilteredData] = useState<StoreRequest[]>([]);
    const [customOrdersData, setCustomOrdersData] = useState<CustomOrder[]>([]);
    const [config] = useState<RequestConfig>(mockData.storeRequest.config);
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const [tablePage, setTablePage] = useState(1);
    const [tableResponse, setTableResponse] = useState<PaginatedResponse<StoreRequest> | null>(null);
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(false);
    const { isLoading, error, execute } = useFetch<PaginatedResponse<StoreRequest>>('/api/store-request', {
        immediate: false
    });
    const { isLoading: isTableLoading, execute: executeTable } = useFetch<PaginatedResponse<StoreRequest>>('/api/store-request', {
        immediate: false
    });
    const { error: customOrdersError, execute: executeCustomOrders } = useFetch<PaginatedResponse<CustomOrder>>('/api/custom-order', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/store-request/export', {
        immediate: false
    });

    const limit = config.itemsPerPage || 10;

    const filterConfig = [
        { field: 'requestingStore.name', placeholder: 'Tienda', label: 'tienda' },
        { field: 'type', placeholder: 'Tipo', label: 'tipo' },
        { field: 'status', placeholder: 'Estado', label: 'estado' }
    ]

    useEffect(() =>
    {
        const mq = window.matchMedia('(max-width: 768px)');
        const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
        handler(mq);
        const listener = (e: MediaQueryListEvent) => handler(e);
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }, []);

    useEffect(() =>
    {
        const fetchRequest = async () =>
        {
            const result = await execute({}, '/api/store-request?limit=500');
            const requests = result?.data || [];
            setRequestsData(requests);
            const filtered = filterItems(requests, currentFilters);
            setFilteredData(filtered);

            const customOrdersResult = await executeCustomOrders({}, '/api/custom-order?limit=500');
            setCustomOrdersData(customOrdersResult?.data || []);
        }

        fetchRequest();
    }, []);

    useEffect(() =>
    {
        const fetchTablePage = async () =>
        {
            const qs = buildQueryString(tablePage, limit, currentFilters);
            const result = await executeTable({}, `/api/store-request?${qs}`);

            if (result) setTableResponse(result);
        }

        fetchTablePage();
    }, [tablePage, currentFilters, limit]);

    const handleFilterChange = (filters: Record<string, string>) =>
    {
        setCurrentFilters(filters);
        setTablePage(1);
        const filtered = filterItems(requestsData, filters);
        setFilteredData(filtered);
    };

    // Función para resetear filtros
    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setTablePage(1);
        setFilteredData(requestsData); // Mostrar todos los datos sin filtrar
    };

    const refreshRequests = async () =>
    {
        const result = await execute({}, '/api/store-request?limit=500');
        const requests = result?.data || [];
        setRequestsData(requests);
        const filtered = filterItems(requests, currentFilters);
        setFilteredData(filtered);

        const qs = buildQueryString(tablePage, limit, currentFilters);
        const tableResult = await executeTable({}, `/api/store-request?${qs}`);
        if (tableResult) setTableResponse(tableResult);
    };

    const isCourier = user?.role === Role.COURIER;
    const isManufacturer = user?.role === Role.MANUFACTURER;

    return (
        <div className={`${styles.orders} ${isCourier ? styles.courier : ''} ${isManufacturer ? styles.manufacturer : ''}`}>
            {isManufacturer ? (
                <ManufacturerTabs
                    requestsData={filteredData}
                    requestsConfig={config}
                    ordersData={customOrdersData}
                    onRefreshRequests={refreshRequests}
                />
            ) : (
                <>
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
                    {(isCourier && isMobile) ? (
                        <RequestCardList
                            requests={filteredData}
                            onRefresh={refreshRequests}
                        />
                    ) : (
                        <GenericDataTable
                            data={tableResponse?.data ?? []}
                            config={config}
                            pagination={{
                                page: tablePage,
                                limit,
                                totalItems: tableResponse?.meta.total ?? 0,
                                totalPages: tableResponse?.meta.totalPages ?? 1,
                                onPageChange: setTablePage,
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default withAuth(Requests, { allowedRoles: [Role.ADMIN, Role.COURIER, Role.MANAGER, Role.MANUFACTURER] });
