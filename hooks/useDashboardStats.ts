import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { Role } from '@/interfaces/enums'; // Ajusta la ruta
import { useAuth } from '@/context/AuthContext';
import { CashClosing, CustomOrder, Order, PaginatedResponse, StoreRequest } from '@/interfaces/interfaces';

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

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const getMonthRange = (month: string) =>
{
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = `${month}-01`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
};

export const useDashboardStats = (storeId?: string, selectedMonth: string = getCurrentMonth()) =>
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
    const { startDate, endDate } = getMonthRange(selectedMonth);
    const productsUrl = '/api/product/?limit=500';
    const ordersUrl = storeId
        ? `/api/order/?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}&limit=500`
        : `/api/order/?startDate=${startDate}&endDate=${endDate}&limit=500`;
    const customOrdersUrl = storeId
        ? `/api/custom-order/?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}&limit=500`
        : `/api/custom-order/?startDate=${startDate}&endDate=${endDate}&limit=500`;
    const storeRequestsUrl = storeId ? `/api/store-request/?storeId=${storeId}&limit=500` : '/api/store-request/?limit=500';
    const cashClosingsUrl = storeId
        ? `/api/cash-closing/?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}&limit=500`
        : `/api/cash-closing/?startDate=${startDate}&endDate=${endDate}&limit=500`;

    const extractArray = <T,>(response: any): T[] => Array.isArray(response) ? response : (response?.data ?? []);


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
    const { data: cashClosingsData, isLoading: cashClosingsLoading, error: cashClosingsError, execute: fetchCashClosings } = useFetch<PaginatedResponse<CashClosing>>(cashClosingsUrl, {
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
    }, [storeId, selectedMonth]);

    useEffect(() =>
    {
        if (productsData && ordersData && customOrdersData && storeRequestsData)
        {
            let filteredProducts = extractArray<any>(productsData);

            const totalProducts = filteredProducts.length;

            let filteredOrders = extractArray<Order>(ordersData);
            if (storeId && filteredOrders.length > 0) filteredOrders = filteredOrders.filter(o => o.storeId === storeId);

            const totalOrders = filteredOrders.length;

            let filteredCustomOrders = extractArray<CustomOrder>(customOrdersData);
            if (storeId && filteredCustomOrders.length > 0) filteredCustomOrders = filteredCustomOrders.filter(o => o.storeId === storeId);

            const totalCustomOrders = filteredCustomOrders.length;
            let filteredStoreRequests = extractArray<StoreRequest>(storeRequestsData);

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
            totalEarnings += filteredCustomOrders
                .filter(order => order.status === 'COMPLETED')
                .reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);

            let filteredCashClosings = extractArray<CashClosing>(cashClosingsData);
            if (storeId && filteredCashClosings.length > 0)
            {
                filteredCashClosings = filteredCashClosings.filter(closing => closing.storeId === storeId);
            }

            const totalExpenses = filteredCashClosings.reduce((sum, closing) => sum + (Number(closing.totalExpenses) || 0), 0);

            const ordersRelation = totalOrders + totalCustomOrders;

            const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
            const currentYear = selectedYear;
            const currentMonth = selectedMonthNum - 1;
            const isCurrentRealMonth = selectedMonth === getCurrentMonth();
            const daysInSelectedMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const lastDayToShow = isCurrentRealMonth ? new Date().getDate() : daysInSelectedMonth;
            const dayKeys: string[] = [];

            for (let day = 1; day <= lastDayToShow; day++)
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
            filteredCustomOrders
                .filter(order => order.status === 'COMPLETED')
                .forEach((order: CustomOrder) => addIncomeByDate(order.createdAt, order.totalPrice));
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
    }, [productsData, ordersData, customOrdersData, storeRequestsData, cashClosingsData, storeId, selectedMonth]);

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