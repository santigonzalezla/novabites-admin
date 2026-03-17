'use client';

import { ReactNode, useState } from 'react';
import styles from './manufacturertabs.module.css';
import CustomOrdersTable from '../customorderstable/CustomOrdersTable';
import { CustomOrder, StoreRequest } from '@/interfaces/interfaces';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';

interface ManufacturerTabsProps {
    requestsData: StoreRequest[];
    requestsConfig: any;
    ordersData?: CustomOrder[];
    onRefreshRequests?: () => void;
}

type TabType = 'orders' | 'requests';

const ManufacturerTabs = ({ requestsData, requestsConfig, ordersData = [], onRefreshRequests }: ManufacturerTabsProps) =>
{
    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [visibleOrdersCount, setVisibleOrdersCount] = useState(ordersData.length);
    const pendingRequestsCount = requestsData.filter((request) => String(request.status).toUpperCase() === 'PENDING').length;

    const tabButtons: ReactNode = (
        <div className={styles.tabsHeader}>
            <button
                className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('orders')}
            >
                <span>Produccion</span>
            </button>
            <button
                className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
                onClick={() => setActiveTab('requests')}
            >
                <span>Solicitudes</span>
                <span className={styles.tabBadge}>{pendingRequestsCount}</span>
            </button>
        </div>
    );

    return (
        <div className={styles.tabsContainer}>
            <div className={styles.tabsTopRow}>
                {tabButtons}
            </div>
            <div className={styles.tabContent}>
                {activeTab === 'orders' && (
                    <CustomOrdersTable
                        orders={ordersData}
                        onVisibleCountChange={setVisibleOrdersCount}
                    />
                )}
                {activeTab === 'requests' && (
                    <div className={styles.requestsView}>
                        <GenericDataTable
                            data={requestsData}
                            config={requestsConfig}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManufacturerTabs;