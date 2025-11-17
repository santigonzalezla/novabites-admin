'use client';

import styles from './page.module.css';
import { Bell, Check, Clock, CustomOrder, EarningsIcon, Order, Supplier, Supplies } from '@/app/components/svg';
import StatsCard from '@/app/components/dashboard/statscard/StatsCard';
import NotificationCard from '@/app/components/dashboard/notificationcard/NotificationCard';
import ChartData from '@/app/components/dashboard/chart/ChartData';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { JSX, useState } from 'react';
import StoreFilter from '@/app/components/dashboard/storefilter/StoreFilter';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/interfaces/enums';

const Dashboard = () =>
{
    const { user } = useAuth();
    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const { stats, isLoading, error, cardsConfig } = useDashboardStats(selectedStoreId);
    const handleStoreChange = (storeId: string) => setSelectedStoreId(storeId);

    const iconMap: Record<string, JSX.Element> = {
        supplies: <Supplies />,
        order: <Order />,
        earnings: <EarningsIcon />,
        bell: <Bell />,
        customOrder: <CustomOrder />,
        pending: <Clock />,
        delivery: <Supplier />,
        completed: <Check />
    };

    const getFormattedValue = (valueKey: keyof typeof stats): string =>
    {
        if (isLoading) return '...';

        const value = stats[valueKey];

        if (valueKey === 'totalEarnings') return `$${value.toLocaleString('es-CO')}`;

        return value.toString();
    };

    const shouldShowStoreFilter = user?.role === Role.ADMIN || user?.role === Role.MANAGER;

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
            {shouldShowStoreFilter && (
                <StoreFilter
                    selectedStoreId={selectedStoreId}
                    onStoreChange={handleStoreChange}
                />
            )}
            <div className={styles.cards}>
                {cardsConfig.map((card, index) => (
                    <StatsCard
                        key={index}
                        link={card.link}
                        title={card.title}
                        value={getFormattedValue(card.valueKey)}
                        relation={card.relation}
                        icon={iconMap[card.icon]}
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