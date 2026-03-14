import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { Role } from '@/interfaces/enums'; // Ajusta la ruta
import { useAuth } from '@/context/AuthContext';
import { CashClosing, CustomOrder, Order } from '@/interfaces/interfaces';

interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalCustomOrders: number;
    totalStoreRequests: number;
    totalEarnings: number;
    totalExpenses: number;
    ordersRelation: number;
    pendingRequests: number;
    inProgressDeliveries: number;
    completedToday: number;
}

interface DashboardChartPoint {
    name: string;
    ingresos: number;
    gastos: number;
}

interface CardConfig {
    link: string;
    title: string;
    valueKey: keyof DashboardStats;
    relation: number;
    icon: string;
    color: string;
    roles: Role[];
}

export const useDashboardStats = (storeId?: string) =>
{
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalOrders: 0,
        totalCustomOrders: 0,
        totalStoreRequests: 0,
        totalEarnings: 0,
        totalExpenses: 0,
        ordersRelation: 0,
        pendingRequests: 0,
        inProgressDeliveries: 0,
        completedToday: 0
    });
    const [chartData, setChartData] = useState<DashboardChartPoint[]>([]);
    const productsUrl = storeId ? `/api/product/?storeId=${storeId}` : '/api/product/';
    const ordersUrl = storeId ? `/api/order/?storeId=${storeId}` : '/api/order/';
    const customOrdersUrl = storeId ? `/api/custom-order/?storeId=${storeId}` : '/api/custom-order/';
    const storeRequestsUrl = storeId ? `/api/store-request/?storeId=${storeId}` : '/api/store-request/';
    const cashClosingsUrl = storeId ? `/api/cash-closing/?storeId=${storeId}` : '/api/cash-closing/';


    const { data: productsData, isLoading: productsLoading, error: productsError, execute: fetchProducts } = useFetch(productsUrl, {
        immediate: false
    });
    const { data: ordersData, isLoading: ordersLoading, error: ordersError, execute: fetchOrders } = useFetch(ordersUrl, {
        immediate: false
    });
    const { data: customOrdersData, isLoading: customOrdersLoading, error: customOrdersError, execute: fetchCustomOrders } = useFetch(customOrdersUrl, {
        immediate: false
    });
    const { data: storeRequestsData, isLoading: storeRequestsLoading, error: storeRequestsError, execute: fetchStoreRequests } = useFetch(storeRequestsUrl, {
        immediate: false
    });
    const { data: cashClosingsData, isLoading: cashClosingsLoading, error: cashClosingsError, execute: fetchCashClosings } = useFetch<CashClosing[]>(cashClosingsUrl, {
        immediate: false
    });

    useEffect(() =>
    {
        const fetchAllData = async () =>
        {
            await Promise.all([
                fetchProducts(),
                fetchOrders(),
                fetchCustomOrders(),
                fetchStoreRequests(),
                fetchCashClosings()
            ]);
        };

        fetchAllData();
    }, [storeId]);

    useEffect(() =>
    {
        if (productsData && ordersData && customOrdersData && storeRequestsData)
        {
            let filteredProducts = Array.isArray(productsData) ? productsData : [];

            const totalProducts = filteredProducts.length;

            let filteredOrders = Array.isArray(ordersData) ? ordersData : [];
            if (storeId && filteredOrders.length > 0) filteredOrders = filteredOrders.filter(o => o.storeId === storeId);

            const totalOrders = filteredOrders.length;

            let filteredCustomOrders = Array.isArray(customOrdersData) ? customOrdersData : [];
            if (storeId && filteredCustomOrders.length > 0) filteredCustomOrders = filteredCustomOrders.filter(o => o.storeId === storeId);

            const totalCustomOrders = filteredCustomOrders.length;
            let filteredStoreRequests = Array.isArray(storeRequestsData) ? storeRequestsData : [];

            if (storeId && filteredStoreRequests.length > 0)
            {
                filteredStoreRequests = filteredStoreRequests.filter(r => r.requestingStoreId === storeId || r.targetStoreId === storeId);
            }

            const totalStoreRequests = filteredStoreRequests.length;

            const pendingRequests = filteredStoreRequests.filter(r => r.status === 'PENDING').length;
            const inProgressDeliveries = filteredStoreRequests.filter(r => r.status === 'IN_PROGRESS').length;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const completedToday = filteredStoreRequests.filter(r =>
            {
                if (r.status === 'COMPLETED' && r.completedDate)
                {
                    const completedDate = new Date(r.completedDate);
                    completedDate.setHours(0, 0, 0, 0);
                    return completedDate.getTime() === today.getTime();
                }
                return false;
            }).length;

            let totalEarnings = 0;

            totalEarnings += filteredOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
            totalEarnings += filteredCustomOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);

            let filteredCashClosings = Array.isArray(cashClosingsData) ? cashClosingsData : [];
            if (storeId && filteredCashClosings.length > 0)
            {
                filteredCashClosings = filteredCashClosings.filter(closing => closing.storeId === storeId);
            }

            const totalExpenses = filteredCashClosings.reduce((sum, closing) => sum + (Number(closing.totalExpenses) || 0), 0);

            const ordersRelation = totalOrders + totalCustomOrders;

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDay = now.getDate();
            const dayKeys: string[] = [];

            for (let day = 1; day <= currentDay; day++)
            {
                const dayKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dayKeys.push(dayKey);
            }

            const ingresosByDay = dayKeys.reduce<Record<string, number>>((acc, key) =>
            {
                acc[key] = 0;
                return acc;
            }, {});

            const gastosByDay = dayKeys.reduce<Record<string, number>>((acc, key) =>
            {
                acc[key] = 0;
                return acc;
            }, {});

            const addIncomeByDate = (dateValue: Date | string, amount: number | string) =>
            {
                const date = new Date(dateValue);
                if (Number.isNaN(date.getTime())) return;

                if (date.getFullYear() !== currentYear || date.getMonth() !== currentMonth) return;

                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                if (key in ingresosByDay)
                {
                    ingresosByDay[key] += Number(amount) || 0;
                }
            };

            const addExpenseByDate = (dateValue: Date | string, amount: number | string) =>
            {
                const date = new Date(dateValue);
                if (Number.isNaN(date.getTime())) return;

                if (date.getFullYear() !== currentYear || date.getMonth() !== currentMonth) return;

                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                if (key in gastosByDay)
                {
                    gastosByDay[key] += Number(amount) || 0;
                }
            };

            filteredOrders.forEach((order: Order) => addIncomeByDate(order.createdAt, order.totalPrice));
            filteredCustomOrders.forEach((order: CustomOrder) => addIncomeByDate(order.createdAt, order.totalPrice));
            filteredCashClosings.forEach((closing: CashClosing) => addExpenseByDate(closing.closingDate, closing.totalExpenses));

            const nextChartData: DashboardChartPoint[] = dayKeys.map((key) => ({
                name: String(Number(key.slice(-2))),
                ingresos: ingresosByDay[key],
                gastos: gastosByDay[key]
            }));

            setStats({
                totalProducts,
                totalOrders,
                totalCustomOrders,
                totalStoreRequests,
                totalEarnings,
                totalExpenses,
                ordersRelation,
                pendingRequests,
                inProgressDeliveries,
                completedToday
            });

            setChartData(nextChartData);
        }
    }, [productsData, ordersData, customOrdersData, storeRequestsData, cashClosingsData, storeId]);

    const getCardsForRole = (): CardConfig[] => {
        const userRole = user?.role as Role;

        if (!userRole) return [];

        const allCards: CardConfig[] = [
            {
                link: 'orders',
                title: 'Órdenes',
                valueKey: 'ordersRelation',
                relation: 2,
                icon: 'order',
                color: '2B3138',
                roles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER, Role.COURIER]
            },
            {
                link: 'reports',
                title: 'Ingresos',
                valueKey: 'totalEarnings',
                relation: 54,
                icon: 'earnings',
                color: '62FF6B',
                roles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER, Role.COURIER]
            },
            {
                link: 'reports',
                title: 'Gastos',
                valueKey: 'totalExpenses',
                relation: 0,
                icon: 'expenses',
                color: 'FF6B6B',
                roles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER, Role.COURIER]
            },
            {
                link: 'customorders',
                title: 'Órdenes Personalizadas',
                valueKey: 'totalCustomOrders',
                relation: 8,
                icon: 'customOrder',
                color: 'FFA500',
                roles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER, Role.COURIER]
            }
        ];

        return allCards.filter(card => card.roles.includes(userRole));
    };

    const isLoading = productsLoading || ordersLoading || customOrdersLoading || storeRequestsLoading || cashClosingsLoading;
    const error = productsError || ordersError || customOrdersError || storeRequestsError || cashClosingsError;

    return {
        stats,
        chartData,
        isLoading,
        error,
        cardsConfig: getCardsForRole(),
        refetch: async () => await Promise.all([fetchProducts(), fetchOrders(), fetchCustomOrders(), fetchStoreRequests(), fetchCashClosings()])
    };
};