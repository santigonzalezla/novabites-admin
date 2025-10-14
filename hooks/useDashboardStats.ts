import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch'; // Ajusta la ruta

interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalCustomOrders: number;
    totalStoreRequests: number;
    totalEarnings: number;
    ordersRelation: number;
}

export const useDashboardStats = (storeId?: string) =>
{
    const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalOrders: 0, totalCustomOrders: 0, totalStoreRequests: 0, totalEarnings: 0, ordersRelation: 0 });
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

    useEffect(() => {
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
                ordersRelation
            });
        }
    }, [productsData, ordersData, customOrdersData, storeRequestsData, storeId]);

    const isLoading = productsLoading || ordersLoading || customOrdersLoading || storeRequestsLoading;
    const error = productsError || ordersError || customOrdersError || storeRequestsError;

    return {
        stats,
        isLoading,
        error,
        refetch: async () =>
        {
            await Promise.all([
                fetchProducts(),
                fetchOrders(),
                fetchCustomOrders(),
                fetchStoreRequests()
            ]);
        }
    };
};