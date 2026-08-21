'use client';

import styles from './page.module.css';
import mockData from "@/app/components/shared/data/mockData.json";
import { Create, Download, Upload } from '@/app/components/svg';
import { useEffect, useState } from 'react';
import GenericFilter from '@/app/components/shared/genericfilter/GenericFilter';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';
import { Order, PaginatedResponse } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';
import withAuth from '@/hoc/withAuth';
import { Role } from '@/interfaces/enums';

interface OrderConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const FILTER_TO_QUERY_PARAM: Record<string, string> = {
    'client.name': 'clientName',
    deliveryDate: 'date',
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

const Orders = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [response, setResponse] = useState<PaginatedResponse<Order> | null>(null);
    const [config] = useState<OrderConfig>(mockData.orders.config);
    const [page, setPage] = useState(1);
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const { isLoading, error, execute } = useFetch<PaginatedResponse<Order>>('/api/order', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/order/upload', {
        immediate: false
    });

    const filterConfig = [
        { field: 'client.name', placeholder: 'Nombre', label: 'nombre' },
        { field: 'deliveryDate', placeholder: 'Fecha', label: 'fecha' },
        { field: 'status', placeholder: 'Estado', label: 'estado' }
    ]

    const limit = config.itemsPerPage || 10;

    useEffect(() =>
    {
        const fetchOrders = async () =>
        {
            const qs = buildQueryString(page, limit, currentFilters);
            const result = await execute({}, `/api/order?${qs}`);

            if (result) setResponse(result);
        }

        fetchOrders();
    }, [page, currentFilters, limit]);

    const handleFilterChange = (filters: Record<string, string>) =>
    {
        setCurrentFilters(filters);
        setPage(1);
    };

    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setPage(1);
    };

    return (
        <div className={styles.orders}>
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
                        domain="order"
                    />
                </div>
            </div>
            <GenericDataTable
                data={response?.data ?? []}
                config={config}
                pagination={{
                    page,
                    limit,
                    totalItems: response?.meta.total ?? 0,
                    totalPages: response?.meta.totalPages ?? 1,
                    onPageChange: setPage,
                }}
            />
        </div>
    );
}

export default withAuth(Orders, { allowedRoles: [Role.ADMIN, Role.MANAGER] });
