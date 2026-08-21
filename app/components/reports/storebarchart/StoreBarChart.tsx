'use client';

import styles from './storebarchart.module.css';
import {
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    Bar,
    Rectangle,
} from 'recharts';
import { useFetch } from '@/hooks/useFetch';
import { useEffect, useMemo, useState } from 'react';
import { CustomOrder, Order, PaginatedResponse, Store } from '@/interfaces/interfaces';

interface ChartData {
    storeName: string;
    regularOrders: number;
    customOrders: number;
    totalSales: number;
    storeType: string;
}

const StoreBarChart = () =>
{
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'total' | 'regular' | 'custom'>('total');

    const {
        data: stores,
        error: storeError,
        isLoading: storeLoading,
        execute: fetchStores
    } = useFetch<Store[]>(`/api/store`, {
        immediate: false,
    });

    const {
        data: ordersResponse,
        error: orderError,
        isLoading: ordersLoading,
        execute: fetchOrders
    } = useFetch<PaginatedResponse<Order>>(`/api/order?limit=500`, {
        immediate: false,
    });
    const orders = ordersResponse?.data ?? null;

    const {
        data: customOrdersResponse,
        error: customOrderError,
        isLoading: customOrderLoading,
        execute: fetchCustomOrders
    } = useFetch<PaginatedResponse<CustomOrder>>(`/api/custom-order?limit=500`, {
        immediate: false,
    });
    const customOrders = customOrdersResponse?.data ?? null;

    const processStoreData = (stores: Store[], orders: Order[], customOrders: CustomOrder[]) =>
    {
        const storeMap = new Map<string, ChartData>();

        stores?.forEach(store =>
        {
            storeMap.set(store.id, {
                storeName: store.name,
                regularOrders: 0,
                customOrders: 0,
                totalSales: 0,
                storeType: store.type
            });
        });

        // Procesar órdenes regulares
        orders?.forEach(order =>
        {
            if (order.status === 'COMPLETED')
            {
                const storeData = storeMap.get(order.storeId);

                if (storeData)
                {
                    const price = parseFloat(order.totalPrice.toString());
                    storeData.regularOrders += price;
                    storeData.totalSales += price;
                }
            }
        });

        customOrders?.forEach(order =>
        {
            if (order.status === 'COMPLETED')
            {
                const storeData = storeMap.get(order.storeId);

                if (storeData)
                {
                    const price = parseFloat(order.totalPrice.toString());
                    storeData.customOrders += price;
                    storeData.totalSales += price;
                }
            }
        });

        return Array.from(storeMap.values());
    };

    const processedData = useMemo(() =>
    {
        if (!stores || !orders || !customOrders) return [];

        const data = processStoreData(stores, orders, customOrders);

        return data.sort((a, b) =>
        {
            switch (sortBy)
            {
                case 'name':
                    return a.storeName.localeCompare(b.storeName);
                case 'regular':
                    return b.regularOrders - a.regularOrders;
                case 'custom':
                    return b.customOrders - a.customOrders;
                case 'total':

                default:
                    return b.totalSales - a.totalSales;
            }
        });
    }, [stores, orders, customOrders, sortBy]);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            setIsLoadingData(true);

            try
            {
                await Promise.all([fetchStores(), fetchOrders(), fetchCustomOrders()]);
            }
            catch (error)
            {
                console.error('Error loading data:', error);
            }
            finally
            {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, []);

    useEffect(() =>
    {
        setChartData(processedData);
    }, [processedData]);

    const formatCurrency = (value: number) =>
    {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }: any) =>
    {
        if (active && payload && payload.length)
        {
            const data = payload[0].payload;

            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{`Tienda: ${label}`}</p>
                    <p className={styles.tooltipType}>{`Tipo: ${data.storeType}`}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${formatCurrency(entry.value)}`}
                        </p>
                    ))}
                    <div className={styles.tooltipTotal}>
                        <p>{`Total: ${formatCurrency(data.totalSales)}`}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const totalSales = chartData.reduce((sum, item) => sum + item.totalSales, 0);
    const topStore = chartData.length > 0 ? chartData[0] : null;

    const isLoading = storeLoading || ordersLoading || customOrderLoading || isLoadingData;
    const hasError = storeError || orderError || customOrderError;

    return (
        <div className={styles.chart}>
            <div className={styles.charttop}>
                <div className={styles.titleSection}>
                    <h3>Ventas por Tienda</h3>
                    <div className={styles.stats}>
                        <span className={styles.statItem}>
                            Total: {formatCurrency(totalSales)}
                        </span>
                        {topStore && (
                            <span className={styles.statItem}>
                                Top: {topStore.storeName}
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.controls}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'total' | 'regular' | 'custom')}
                        className={styles.sortSelect}
                    >
                        <option value="total">Ordenar por Total</option>
                        <option value="regular">Ordenar por Regulares</option>
                        <option value="custom">Ordenar por Personalizadas</option>
                        <option value="name">Ordenar por Nombre</option>
                    </select>
                </div>
            </div>

            {isLoading && (
                <div className={styles.loading}>
                    <p>Cargando datos de ventas...</p>
                </div>
            )}

            {hasError && (
                <div className={styles.error}>
                    <p>Error al cargar los datos: {hasError}</p>
                </div>
            )}

            {!isLoading && !hasError && chartData.length === 0 && (
                <div className={styles.nodata}>
                    <p>No hay datos de ventas disponibles</p>
                </div>
            )}

            {!isLoading && !hasError && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        width={500}
                        height={300}
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="storeName"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="regularOrders"
                            fill="#8884d8"
                            name="Órdenes Regulares"
                            activeBar={<Rectangle fill="#7c7ce8" stroke="#6b6bd9" />}
                        />
                        <Bar
                            dataKey="customOrders"
                            fill="#82ca9d"
                            name="Órdenes Personalizadas"
                            activeBar={<Rectangle fill="#7bc97b" stroke="#6bb96b" />}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default StoreBarChart;