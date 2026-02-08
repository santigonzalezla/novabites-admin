'use client';

import { useState } from 'react';
import styles from './manufacturertabs.module.css';
import CustomOrdersTable from '../customorderstable/CustomOrdersTable';
import { StoreRequest } from '@/interfaces/interfaces';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';

interface ManufacturerTabsProps {
    requestsData: StoreRequest[];
    requestsConfig: any;
    onRefreshRequests?: () => void;
}

type TabType = 'orders' | 'requests';

const ManufacturerTabs = ({ requestsData, requestsConfig, onRefreshRequests }: ManufacturerTabsProps) =>
{
    const [activeTab, setActiveTab] = useState<TabType>('orders');

    return (
        <div className={styles.tabsContainer}>
            <div className={styles.tabsHeader}>
                <button
                    className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Pedidos del Día
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Solicitudes
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'orders' && (
                    <CustomOrdersTable />
                )}
                {activeTab === 'requests' && (
                    <GenericDataTable
                        data={requestsData}
                        config={requestsConfig}
                    />
                )}
            </div>
        </div>
    );
};

export default ManufacturerTabs;