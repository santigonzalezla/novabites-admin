'use client';

import styles from './page.module.css';
import mockData from "@/app/components/shared/data/mockData.json";
import { useEffect, useState } from 'react';
import GenericFilter from '@/app/components/shared/genericfilter/GenericFilter';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';
import { useFetch } from '@/hooks/useFetch';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';
import { CashClosing, PaginatedResponse } from '@/interfaces/interfaces';
import withAuth from '@/hoc/withAuth';
import { Role } from '@/interfaces/enums';

interface CashClosingConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const FILTER_TO_QUERY_PARAM: Record<string, string> = {
    'store.name': 'storeName',
    'user.name': 'userName',
    closingDate: 'closingDate',
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

const CashClosings = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [response, setResponse] = useState<PaginatedResponse<CashClosing> | null>(null);
    const [config] = useState<CashClosingConfig>(mockData.cashClosing.config);
    const [page, setPage] = useState(1);
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const { isLoading, error, execute } = useFetch<PaginatedResponse<CashClosing>>('/api/cash-closing', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/cash-closing/export', {
        immediate: false
    });

    const filterConfig = [
        { field: 'store.name', placeholder: 'Tienda', label: 'tienda' },
        { field: 'user.name', placeholder: 'Usuario', label: 'usuario' },
        { field: 'closingDate', placeholder: 'Fecha', label: 'fecha' }
    ];

    const limit = config.itemsPerPage || 10;

    useEffect(() =>
    {
        const fetchCashClosings = async () =>
        {
            const qs = buildQueryString(page, limit, currentFilters);
            const result = await execute({}, `/api/cash-closing?${qs}`);

            if (result) setResponse(result);
        };

        fetchCashClosings();
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
                        domain="store-request"
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

export default withAuth(CashClosings, { allowedRoles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER] });
