'use client';

import styles from './page.module.css';
import mockData from "@/app/components/shared/data/mockData.json";
import { Create, Download, Upload } from '@/app/components/svg';
import { useEffect, useState } from 'react';
import GenericFilter, { filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';
import { Order } from '@/interfaces/interfaces';
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

const Orders = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [ordersData, setOrdersData] = useState<Order[]>([]);
    const [filteredData, setFilteredData] = useState<Order[]>([]);
    const [config, setConfig] = useState<OrderConfig>({columns: []});
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const { isLoading, error, execute } = useFetch<Order[]>('/api/order', {
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

    useEffect(() =>
    {
        const fetchOrders = async () =>
        {
            const orders = await execute();

            if (orders)
            {
                setOrdersData(orders);
                const filtered = filterItems(orders, currentFilters);
                setFilteredData(filtered);
            }
        }

        fetchOrders();
        setConfig(mockData.orders.config);
    }, []);

    const handleFilterChange = (filters: Record<string, string>) =>
    {
        setCurrentFilters(filters);
        const filtered = filterItems(ordersData, filters);
        setFilteredData(filtered);
    };

    // Función para resetear filtros
    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setFilteredData(ordersData); // Mostrar todos los datos sin filtrar
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
                data={filteredData}
                config={config}
            />
        </div>
    );
}

export default withAuth(Orders, { allowedRoles: [Role.ADMIN, Role.MANAGER] });