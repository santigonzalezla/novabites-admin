'use client';

import styles from './page.module.css';
import mockData from "@/app/components/shared/data/mockData.json";
import { useEffect, useState } from 'react';
import GenericFilter, { filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';
import { useFetch } from '@/hooks/useFetch';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';
import { CashClosing } from '@/interfaces/interfaces';
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

const CashClosings = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [cashClosingsData, setCashClosingsData] = useState<CashClosing[]>([]);
    const [filteredData, setFilteredData] = useState<CashClosing[]>([]);
    const [config, setConfig] = useState<CashClosingConfig>({ columns: [] });
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const { isLoading, error, execute } = useFetch<CashClosing[]>('/api/cash-closing', {
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

    useEffect(() =>
    {
        const fetchCashClosings = async () =>
        {
            const closings = await execute();

            if (closings)
            {
                setCashClosingsData(closings);
                const filtered = filterItems(closings, currentFilters);
                setFilteredData(filtered);
            }
        };

        fetchCashClosings();
        setConfig(mockData.cashClosing.config);
    }, []);

    const handleFilterChange = (filters: Record<string, string>) =>
    {
        setCurrentFilters(filters);
        const filtered = filterItems(cashClosingsData, filters);
        setFilteredData(filtered);
    };

    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setFilteredData(cashClosingsData);
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
                data={filteredData}
                config={config}
            />
        </div>
    );
}

export default withAuth(CashClosings, { allowedRoles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER] });