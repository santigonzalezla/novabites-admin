'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import styles from './salesareachart.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFetch } from '@/hooks/useFetch';
import { CustomOrder, Order, PaginatedResponse } from '@/interfaces/interfaces';

interface ChartData {
    period: string;
    regularOrders: number;
    customOrders: number;
    total: number;
    regularAccumulated: number;
    customAccumulated: number;
    totalAccumulated: number;
}

const SalesAreaChart = () =>
{
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const { data: ordersResponse, error: orderError, isLoading: orderLoading, execute: fetchOrders } = useFetch<PaginatedResponse<Order>>(`/api/order?limit=500`, {
        immediate: false,
    });
    const orders = ordersResponse?.data ?? null;
    const { data: customOrdersResponse, error: customOrderError, isLoading: customOrderLoading, execute: fetchCustomOrders } = useFetch<PaginatedResponse<CustomOrder>>(`/api/custom-order?limit=500`, {
        immediate: false,
    });
    const customOrders = customOrdersResponse?.data ?? null;

    const formatPeriod = (date: Date, periodType: 'daily' | 'weekly' | 'monthly') => 
    {
        switch (periodType) 
        {
            case 'daily':
                return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' });
            case 'weekly':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                return `Sem ${weekStart.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })}`;
            case 'monthly':
                return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
            default:
                return date.toLocaleDateString('es-CO');
        }
    };

    const groupDataByPeriod = (orders: Order[], customOrders: CustomOrder[]) =>
    {
        const groupedData: { [key: string]: { regular: number, custom: number, originalDate: Date } } = {};

        orders?.forEach(order =>
        {
            if (order.status === 'COMPLETED')
            {
                const date = new Date(order.createdAt);
                const periodKey = formatPeriod(date, period);

                if (!groupedData[periodKey]) groupedData[periodKey] = { regular: 0, custom: 0, originalDate: date };
                else if (date < groupedData[periodKey].originalDate) groupedData[periodKey].originalDate = date;

                groupedData[periodKey].regular += parseFloat(order.totalPrice.toString());
            }
        });

        customOrders?.forEach(order =>
        {
            if (order.status === 'COMPLETED')
            {
                const date = new Date(order.createdAt);
                const periodKey = formatPeriod(date, period);

                if (!groupedData[periodKey]) groupedData[periodKey] = { regular: 0, custom: 0, originalDate: date };
                else if (date < groupedData[periodKey].originalDate) groupedData[periodKey].originalDate = date;

                groupedData[periodKey].custom += parseFloat(order.totalPrice.toString());
            }
        });

        const sortedData = Object.keys(groupedData)
            .sort((a, b) => (groupedData[a].originalDate.getTime() - groupedData[b].originalDate.getTime()))
            .map(period => ({
                period,
                regularOrders: groupedData[period].regular,
                customOrders: groupedData[period].custom,
                total: groupedData[period].regular + groupedData[period].custom
            }));

        let regularAccumulated = 0;
        let customAccumulated = 0;
        let totalAccumulated = 0;

        return sortedData.map(item =>
        {
            regularAccumulated += item.regularOrders;
            customAccumulated += item.customOrders;
            totalAccumulated += item.total;

            return { ...item, regularAccumulated, customAccumulated, totalAccumulated };
        });
    };

    const processedData = useMemo(() => 
    {
        if (!orders || !customOrders) return [];
        return groupDataByPeriod(orders, customOrders);
    }, [orders, customOrders, period]);
    
    useEffect(() => 
    {
        const loadData = async () => 
        {
            setIsLoadingData(true);
            try 
            {
                await Promise.all([
                    fetchOrders(),
                    fetchCustomOrders()
                ]);
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
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{`Período: ${label}`}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${formatCurrency(entry.value)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const isLoading = orderLoading || customOrderLoading || isLoadingData;
    const hasError = orderError || customOrderError;

    return (
        <div className={styles.chart}>
            <div className={styles.charttop}>
                <h3>Ingresos Acumulados por Período</h3>
                <div className={styles.controls}>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                        className={styles.periodSelect}
                    >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                    </select>
                </div>
            </div>

            {isLoading && (
                <div className={styles.loading}>
                    <p>Cargando datos...</p>
                </div>
            )}

            {hasError && (
                <div className={styles.error}>
                    <p>Error al cargar los datos: {hasError}</p>
                </div>
            )}

            {!isLoading && !hasError && chartData.length === 0 && (
                <div className={styles.nodata}>
                    <p>No hay datos disponibles para mostrar</p>
                </div>
            )}

            {!isLoading && !hasError && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        width={500}
                        height={400}
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 15,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="period"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="regularAccumulated"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                            name="Órdenes Regulares (Acumulado)"
                        />
                        <Area
                            type="monotone"
                            dataKey="customAccumulated"
                            stackId="1"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            name="Órdenes Personalizadas (Acumulado)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default SalesAreaChart;
