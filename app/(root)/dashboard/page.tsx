'use client';

import styles from './page.module.css';
import { Bell, EarningsIcon, Order, Supplies } from '@/app/components/svg';
import StatsCard from '@/app/components/dashboard/statscard/StatsCard';
import NotificationCard from '@/app/components/dashboard/notificationcard/NotificationCard';
import ChartData from '@/app/components/dashboard/chart/ChartData';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useState } from 'react';
import StoreFilter from '@/app/components/dashboard/storefilter/StoreFilter';

const Dashboard = () =>
{
    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const { stats, isLoading, error } = useDashboardStats(selectedStoreId);

    const handleStoreChange = (storeId: string) =>
    {
        setSelectedStoreId(storeId);
    };

    const cards = [
        {
            link: 'inventory',
            title: 'Products',
            value: isLoading ? '...' : stats.totalProducts.toString(),
            relation: 11,
            icon: <Supplies />,
            color: 'FF4200'
        },
        {
            link: 'orders',
            title: 'Órdenes',
            value: isLoading ? '...' : stats.ordersRelation.toString(),
            relation: 2,
            icon: <Order />,
            color: '2B3138'
        },
        {
            link: 'reports',
            title: 'Ganancias',
            value: isLoading ? '...' : `$${stats.totalEarnings.toLocaleString('es-CO')}`,
            relation: 54,
            icon: <EarningsIcon />,
            color: '62FF6B'
        },
        {
            link: 'requests',
            title: 'Solicitudes',
            value: isLoading ? '...' : stats.totalStoreRequests.toString(),
            relation: -5,
            icon: <Bell />,
            color: '95A4FC'
        }
    ];

    if (error)
    {
        return (
            <div className={styles.dashboard}>
                <div className={styles.error}>
                    Error cargando datos del dashboard: {error}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <StoreFilter
                selectedStoreId={selectedStoreId}
                onStoreChange={handleStoreChange}
            />
            <div className={styles.cards}>
                {cards.map((card, index) => (
                    <StatsCard
                        key={index}
                        link={card.link}
                        title={card.title}
                        value={card.value}
                        relation={card.relation}
                        icon={card.icon}
                        color={card.color}
                    />
                ))}
            </div>
            <div className={styles.infoapp}>
                <ChartData />
                <NotificationCard />
            </div>
        </div>
    );
}

export default Dashboard;