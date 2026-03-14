'use client';

import styles from './page.module.css';
import { Bell, Cash, Check, Clock, CustomOrder, EarningsIcon, Order, Supplier, Supplies } from '@/app/components/svg';
import StatsCard from '@/app/components/dashboard/statscard/StatsCard';
import NotificationCard from '@/app/components/dashboard/notificationcard/NotificationCard';
import ChartData from '@/app/components/dashboard/chart/ChartData';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { JSX, useEffect, useState } from 'react';
import StoreFilter from '@/app/components/dashboard/storefilter/StoreFilter';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/interfaces/enums';

const Dashboard = () =>
{
    const { user } = useAuth();
    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const [isMobile, setIsMobile] = useState(false);
    const { stats, chartData, isLoading, error, cardsConfig } = useDashboardStats(selectedStoreId);
    const handleStoreChange = (storeId: string) => setSelectedStoreId(storeId);

    useEffect(() =>
    {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateIsMobile = (event: MediaQueryListEvent | MediaQueryList) => setIsMobile(event.matches);

        updateIsMobile(mediaQuery);

        mediaQuery.addEventListener('change', updateIsMobile);
        return () => mediaQuery.removeEventListener('change', updateIsMobile);
    }, []);

    const iconMap: Record<string, JSX.Element> = {
        supplies: <Supplies />,
        order: <Order />,
        earnings: <EarningsIcon />,
        expenses: <Cash />,
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

        if (valueKey === 'totalEarnings' || valueKey === 'totalExpenses') return `$${value.toLocaleString('es-CO')}`;

        return value.toString();
    };

    const shouldShowStoreFilter = user?.role === Role.ADMIN || user?.role === Role.MANAGER;
    const shouldPrioritizeAdminMobile = user?.role === Role.ADMIN && isMobile;
    const prioritizedCards = shouldPrioritizeAdminMobile
        ? [...cardsConfig].sort((a, b) =>
        {
            const priorityMap: Record<string, number> = {
                'Ingresos': 1,
                'Gastos': 2,
                'Órdenes': 3,
                'Órdenes Personalizadas': 4
            };

            return (priorityMap[a.title] ?? 99) - (priorityMap[b.title] ?? 99);
        })
        : cardsConfig;

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
            {shouldPrioritizeAdminMobile && (
                <div className={styles.infoapp}>
                    <ChartData data={chartData} />
                    <NotificationCard />
                </div>
            )}
            <div className={styles.cards}>
                {prioritizedCards.map((card, index) => (
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
            {!shouldPrioritizeAdminMobile && (
                <div className={styles.infoapp}>
                    <ChartData data={chartData} />
                    <NotificationCard />
                </div>
            )}
        </div>
    );
}

export default Dashboard;