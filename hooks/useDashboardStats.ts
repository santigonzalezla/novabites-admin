import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { Role } from '@/interfaces/enums'; // Ajusta la ruta
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalCustomOrders: number;
    totalStoreRequests: number;
    totalEarnings: number;
    ordersRelation: number;
    pendingRequests: number;
    inProgressDeliveries: number;
    completedToday: number;
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
        ordersRelation: 0,
        pendingRequests: 0,
        inProgressDeliveries: 0,
        completedToday: 0
    });
    const productsUrl = storeId ? `/api/product/?storeId=${storeId}` : '/api/product/';
    const ordersUrl = storeId ? `/api/order/?storeId=${storeId}` : '/api/order/';
    const customOrdersUrl = storeId ? `/api/custom-order/?storeId=${storeId}` : '/api/custom-order/';
    const storeRequestsUrl = storeId ? `/api/store-request/?storeId=${storeId}` : '/api/store-request/';


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

    useEffect(() =>
    {
        const fetchAllData = async () =>
        {
            await Promise.all([
                fetchProducts(),
                fetchOrders(),
                fetchCustomOrders(),
                fetchStoreRequests()
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

            const ordersRelation = totalOrders + totalCustomOrders;

            setStats({
                totalProducts,
                totalOrders,
                totalCustomOrders,
                totalStoreRequests,
                totalEarnings,
                ordersRelation,
                pendingRequests,
                inProgressDeliveries,
                completedToday
            });
        }
    }, [productsData, ordersData, customOrdersData, storeRequestsData, storeId]);

    const getCardsForRole = (): CardConfig[] => {
        const userRole = user?.role as Role;

        if (!userRole) return [];

        const allCards: CardConfig[] = [
            {
                link: 'inventory',
                title: 'Productos',
                valueKey: 'totalProducts',
                relation: 11,
                icon: 'supplies',
                color: 'FF4200',
                roles: [Role.ADMIN, Role.MANAGER]
            },
            {
                link: 'orders',
                title: 'Órdenes',
                valueKey: 'ordersRelation',
                relation: 2,
                icon: 'order',
                color: '2B3138',
                roles: [Role.ADMIN, Role.MANAGER]
            },
            {
                link: 'reports',
                title: 'Ganancias',
                valueKey: 'totalEarnings',
                relation: 54,
                icon: 'earnings',
                color: '62FF6B',
                roles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER]
            },
            {
                link: 'requests',
                title: 'Solicitudes',
                valueKey: 'totalStoreRequests',
                relation: -5,
                icon: 'bell',
                color: '95A4FC',
                roles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER, Role.COURIER]
            },
            {
                link: 'custom-orders',
                title: 'Órdenes Personalizadas',
                valueKey: 'totalCustomOrders',
                relation: 8,
                icon: 'customOrder',
                color: 'FFA500',
                roles: [Role.MANUFACTURER, Role.COURIER]
            },
            {
                link: 'requests?status=PENDING',
                title: 'Pendientes de Aprobar',
                valueKey: 'pendingRequests',
                relation: 0,
                icon: 'pending',
                color: 'FFD700',
                roles: [Role.MANUFACTURER]
            },
            {
                link: 'requests?status=IN_PROGRESS',
                title: 'En Despacho',
                valueKey: 'inProgressDeliveries',
                relation: 0,
                icon: 'delivery',
                color: '2196F3',
                roles: [Role.COURIER]
            },
            {
                link: 'requests?status=COMPLETED',
                title: 'Completadas Hoy',
                valueKey: 'completedToday',
                relation: 0,
                icon: 'completed',
                color: '4CAF50',
                roles: [Role.COURIER]
            }
        ];

        return allCards.filter(card => card.roles.includes(userRole));
    };

    const isLoading = productsLoading || ordersLoading || customOrdersLoading || storeRequestsLoading;
    const error = productsError || ordersError || customOrdersError || storeRequestsError;

    return {
        stats,
        isLoading,
        error,
        cardsConfig: getCardsForRole(),
        refetch: async () => await Promise.all([fetchProducts(), fetchOrders(), fetchCustomOrders(), fetchStoreRequests()])
    };
};